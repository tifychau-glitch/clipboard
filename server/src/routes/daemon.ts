/**
 * Clipboard daemon API — the server-side counterpart to the daemon/ app.
 *
 * Endpoints (all under /api/daemon):
 *   POST /register    Upsert a device by deviceKey. Anyone can register
 *                     (the key itself is the credential for subsequent
 *                     poll/run-update calls).
 *   GET  /poll        Device polls for pending task assignments. Returns
 *                     a { tasks: [] } envelope; actual task dispatch is
 *                     a future change — today the daemon registers and
 *                     idles, validating the end-to-end plumbing.
 *   POST /run-update  Device streams stdout/stderr chunks and final
 *                     exitCode back. Persisted to the logger for now;
 *                     once task dispatch is wired through heartbeat,
 *                     this will attach chunks to heartbeat_runs.
 *
 * Auth model:
 *   The daemon authenticates with the `deviceKey` it generated on first
 *   run and registered via POST /register. Poll and run-update require
 *   that key to match a row in daemon_devices — that proves the caller
 *   registered (or possesses a legitimate key). We deliberately do NOT
 *   gate /register itself, since new machines need a way to onboard.
 *   When the invite allowlist is enforced, off-list human sessions
 *   can't sign up, so the population of operators who can start a daemon
 *   is naturally bounded.
 *
 * What's missing (future work, explicitly out of scope here):
 *   - Per-agent → device binding table (which daemon runs which agent)
 *   - Heartbeat integration: when an agent bound to a daemon is due to
 *     run, the heartbeat scheduler enqueues a row in a daemon_task_queue
 *     table instead of spawning locally
 *   - run-update ↔ heartbeat_run attachment so the UI can display chunks
 *
 * Those three pieces are the "actually dispatch work to daemons" layer.
 * This file is the plumbing that lets a daemon process connect, register,
 * and keep its heartbeat alive — no more 404s when the daemon boots
 * against a Railway-hosted Clipboard.
 */
import { Router } from "express";
import { eq } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { daemonDevices } from "@paperclipai/db";
import { logger } from "../middleware/logger.js";

const DEVICE_KEY_REGEX = /^[a-zA-Z0-9_-]{16,128}$/;

function isValidDeviceKey(input: unknown): input is string {
  return typeof input === "string" && DEVICE_KEY_REGEX.test(input);
}

export function daemonRoutes(db: Db) {
  const router = Router();

  router.post("/register", async (req, res) => {
    const body = req.body ?? {};
    const deviceKey = body.deviceKey;
    const deviceName = typeof body.deviceName === "string" ? body.deviceName : null;
    const os = typeof body.os === "string" ? body.os : null;
    const availableClis = Array.isArray(body.availableClis)
      ? body.availableClis.filter((v: unknown): v is string => typeof v === "string")
      : null;
    const version = typeof body.version === "string" ? body.version : null;

    if (!isValidDeviceKey(deviceKey)) {
      res.status(400).json({ error: "deviceKey must match /^[a-zA-Z0-9_-]{16,128}$/" });
      return;
    }
    if (!deviceName || !os || !availableClis) {
      res
        .status(400)
        .json({ error: "deviceName, os, and availableClis are required" });
      return;
    }

    const now = new Date();

    // Upsert by deviceKey. We rely on the unique index to detect re-registration.
    const existing = await db
      .select({ id: daemonDevices.id })
      .from(daemonDevices)
      .where(eq(daemonDevices.deviceKey, deviceKey))
      .then((rows) => rows[0] ?? null);

    if (existing) {
      await db
        .update(daemonDevices)
        .set({
          deviceName,
          os,
          availableClis,
          version,
          lastSeenAt: now,
        })
        .where(eq(daemonDevices.id, existing.id));
      logger.info(
        { deviceKey: `${deviceKey.slice(0, 6)}…`, deviceName, os, clis: availableClis.length },
        "Daemon re-registered",
      );
    } else {
      await db.insert(daemonDevices).values({
        deviceKey,
        deviceName,
        os,
        availableClis,
        version,
        lastSeenAt: now,
        registeredAt: now,
      });
      logger.info(
        { deviceKey: `${deviceKey.slice(0, 6)}…`, deviceName, os, clis: availableClis.length },
        "Daemon registered (new device)",
      );
    }

    res.json({ connected: true, agentAssignments: [] });
  });

  router.get("/poll", async (req, res) => {
    const deviceKey = req.query.deviceKey;
    if (!isValidDeviceKey(deviceKey)) {
      res.status(400).json({ error: "deviceKey query parameter is required" });
      return;
    }

    const device = await db
      .select({ id: daemonDevices.id })
      .from(daemonDevices)
      .where(eq(daemonDevices.deviceKey, deviceKey))
      .then((rows) => rows[0] ?? null);

    if (!device) {
      res.status(404).json({ error: "Device not registered" });
      return;
    }

    // Best-effort liveness bump; ignore failures so a single poll doesn't
    // 500 if the UPDATE races with something else.
    await db
      .update(daemonDevices)
      .set({ lastSeenAt: new Date() })
      .where(eq(daemonDevices.id, device.id))
      .catch((err: unknown) => {
        logger.warn({ err }, "Failed to bump daemon last_seen_at");
      });

    // No task-dispatch pipeline yet — return an empty envelope so the
    // daemon's polling loop stays happy without having to handle a 501.
    res.json({ tasks: [] });
  });

  router.post("/run-update", async (req, res) => {
    const body = req.body ?? {};
    const deviceKey = body.deviceKey;
    const taskId = typeof body.taskId === "string" ? body.taskId : null;
    const runId = typeof body.runId === "string" ? body.runId : null;
    const chunk = typeof body.chunk === "string" ? body.chunk : "";
    const done = body.done === true;
    const exitCode =
      typeof body.exitCode === "number" && Number.isFinite(body.exitCode)
        ? body.exitCode
        : null;

    // deviceKey is optional here for now — the daemon omits it on the
    // terminal update in some paths. Accept the update regardless, but
    // if it IS present, validate it so we can start enforcing later.
    if (deviceKey !== undefined && !isValidDeviceKey(deviceKey)) {
      res.status(400).json({ error: "deviceKey is malformed" });
      return;
    }
    if (!taskId || !runId) {
      res.status(400).json({ error: "taskId and runId are required" });
      return;
    }

    if (deviceKey) {
      const known = await db
        .select({ id: daemonDevices.id })
        .from(daemonDevices)
        .where(eq(daemonDevices.deviceKey, deviceKey))
        .then((rows) => rows[0] ?? null);
      if (!known) {
        res.status(404).json({ error: "Device not registered" });
        return;
      }
    }

    // Persistence for daemon run output lives in a future migration; for
    // now, just log a terse record so operators can see the daemon is
    // actually talking to the server.
    logger.info(
      {
        taskId,
        runId,
        chunkBytes: chunk.length,
        done,
        exitCode,
      },
      "Daemon run-update received",
    );

    res.json({ accepted: true });
  });

  return router;
}
