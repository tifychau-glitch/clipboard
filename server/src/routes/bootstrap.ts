/**
 * First-signup bootstrap: promote the initial authenticated user to
 * `instance_admin` so they can create a company and start using the app.
 *
 * Context
 * -------
 * In `authenticated` deployment mode, a fresh database has no instance
 * admins. `POST /api/companies` requires the caller to be an admin, so
 * the very first user gets a 403 and can never escape sign-in → empty
 * state. Paperclip's original answer was a local "board claim" URL
 * printed to boot logs — that flow is impractical on cloud deploys
 * (Railway, Fly, etc.) where operators don't see startup logs.
 *
 * Contract
 * --------
 *   POST /api/bootstrap/claim-instance-admin
 *   - Requires an authenticated user session (actor.type === "board",
 *     actor.source === "session").
 *   - If the caller is already instance_admin → 200 { promoted: true,
 *     alreadyAdmin: true }.
 *   - Else if NO instance_admin row exists anywhere (not counting the
 *     synthetic `local-board` row used in local_trusted mode) → insert
 *     one for the caller and 200 { promoted: true, userId }.
 *   - Else → 409 { promoted: false, reason: "already_claimed" }.
 *
 * Safety
 * ------
 * This is idempotent and race-safe: the unique index on
 * (userId, role) prevents duplicate rows, and the "no admins exist"
 * check is the only way to win the promotion — once any user has the
 * role, everyone else is locked out of the bootstrap path.
 *
 * An operator can disable this endpoint by setting
 * `PAPERCLIP_DISABLE_BOOTSTRAP_CLAIM=true` once the instance has its
 * admin(s) configured — belt-and-suspenders against a misconfigured
 * auth layer letting someone through if the admin rows ever got wiped.
 */
import { Router } from "express";
import { and, eq, ne } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { instanceUserRoles } from "@paperclipai/db";
import { logger } from "../middleware/logger.js";

const LOCAL_BOARD_USER_ID = "local-board";

export function bootstrapRoutes(db: Db) {
  const router = Router();

  router.post("/claim-instance-admin", async (req, res) => {
    if (process.env.PAPERCLIP_DISABLE_BOOTSTRAP_CLAIM === "true") {
      res.status(404).json({ error: "Bootstrap endpoint disabled" });
      return;
    }

    const actor = req.actor;
    if (!actor || actor.type !== "board" || actor.source !== "session") {
      res.status(401).json({ error: "Authenticated user session required" });
      return;
    }
    const userId = actor.userId;
    if (!userId) {
      res.status(401).json({ error: "Session has no userId" });
      return;
    }

    // If the caller is already an admin, just confirm it. Makes the UI
    // safe to call this endpoint on every sign-in without guarding.
    if (actor.isInstanceAdmin) {
      res.json({ promoted: true, alreadyAdmin: true, userId });
      return;
    }

    try {
      await db.transaction(async (tx) => {
        const existingAdmins = await tx
          .select({ userId: instanceUserRoles.userId })
          .from(instanceUserRoles)
          .where(
            and(
              eq(instanceUserRoles.role, "instance_admin"),
              ne(instanceUserRoles.userId, LOCAL_BOARD_USER_ID),
            ),
          );

        if (existingAdmins.length > 0) {
          // Someone else already claimed. Surface 409 without mutating.
          const err = new Error("ALREADY_CLAIMED");
          (err as Error & { httpStatus?: number }).httpStatus = 409;
          throw err;
        }

        // Race-safe: unique index on (userId, role) makes a concurrent
        // insert fail with a conflict, which we treat as success since
        // the end state is still "caller is admin".
        await tx
          .insert(instanceUserRoles)
          .values({ userId, role: "instance_admin" })
          .onConflictDoNothing();
      });

      logger.info(
        { userId, email: actor.userEmail ?? null },
        "Bootstrap: promoted first user to instance_admin",
      );
      res.json({ promoted: true, userId, firstClaim: true });
    } catch (err) {
      const status =
        err instanceof Error && "httpStatus" in err
          ? (err as Error & { httpStatus?: number }).httpStatus
          : undefined;
      if (status === 409) {
        res
          .status(409)
          .json({ promoted: false, reason: "already_claimed" });
        return;
      }
      logger.error({ err, userId }, "Bootstrap claim failed");
      res.status(500).json({ promoted: false, reason: "server_error" });
    }
  });

  return router;
}
