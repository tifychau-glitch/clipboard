/**
 * Minimal logger: writes to both stdout and daemon.log (append).
 * Kept as a tiny module to avoid a heavyweight logging dependency.
 */
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

const LOG_PATH = resolve(process.cwd(), "daemon.log");

type Level = "info" | "warn" | "error" | "debug";

function write(level: Level, message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  // stdout for operator visibility
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
  // best-effort append to daemon.log; never throw from logging
  try {
    appendFileSync(LOG_PATH, line + "\n", { encoding: "utf8" });
  } catch {
    /* ignore — logging must not kill the daemon */
  }
}

export const log = {
  info: (m: string) => write("info", m),
  warn: (m: string) => write("warn", m),
  error: (m: string) => write("error", m),
  debug: (m: string) => {
    if (process.env.DAEMON_DEBUG === "1") write("debug", m);
  },
};
