/**
 * Clipboard daemon — entry point.
 *
 * Lifecycle:
 *   1. Load daemon/.env (from the daemon directory, not the caller's cwd)
 *   2. Detect installed AI CLIs + machine identity
 *   3. Ensure DAEMON_DEVICE_KEY and DAEMON_DEVICE_NAME are set (generate + persist if not)
 *   4. If CLIPBOARD_SERVER_URL is missing, log and exit cleanly (no server = nothing to do)
 *   5. Otherwise register, start polling, and install signal handlers
 *
 * Signals:
 *   - SIGTERM / SIGINT (first)  → graceful: stop polling, let in-flight tasks finish
 *   - SIGTERM / SIGINT (second) → forceful: kill any remaining child processes and exit
 */
import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { log } from "./logger.js";
import { detectMachine } from "./detect-clis.js";
import { ensureDeviceKey, ensureDeviceName } from "./generate-key.js";
import { CloudConnection } from "./connection.js";

// Resolve .env relative to the daemon package, regardless of how tsx/node is invoked.
const HERE = dirname(fileURLToPath(import.meta.url));
const DAEMON_ROOT = resolve(HERE, "..");
loadDotenv({ path: resolve(DAEMON_ROOT, ".env") });

async function main(): Promise<void> {
  log.info("Clipboard daemon starting…");

  const detection = await detectMachine();
  const deviceKey = ensureDeviceKey();
  const deviceName = ensureDeviceName(detection.hostname);

  const serverUrl = process.env.CLIPBOARD_SERVER_URL?.trim();
  if (!serverUrl) {
    log.warn(
      "No CLIPBOARD_SERVER_URL configured — nothing to connect to. Set it in daemon/.env and restart.",
    );
    // Clean exit: this is an expected first-run state, not an error.
    return;
  }

  const connection = new CloudConnection({
    serverUrl,
    deviceKey,
    deviceName,
    detection,
  });

  // Signal handling: first signal = graceful, second = forceful.
  let shuttingDown = false;
  const handleSignal = (sig: NodeJS.Signals) => {
    if (!shuttingDown) {
      shuttingDown = true;
      log.info(`Received ${sig}; finishing current tasks before exit…`);
      void connection.stop().then(() => process.exit(0));
      return;
    }
    log.warn(`Received ${sig} again; force-killing in-flight tasks.`);
    connection.forceKill();
    process.exit(1);
  };
  process.on("SIGTERM", handleSignal);
  process.on("SIGINT", handleSignal);

  await connection.start();
  log.info(
    `Daemon online. Polling ${serverUrl} every ${process.env.POLL_INTERVAL_SECONDS ?? 5}s.`,
  );
  // Keep the event loop alive — pollLoop runs as a detached promise.
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  log.error(`Fatal: ${msg}`);
  process.exit(1);
});
