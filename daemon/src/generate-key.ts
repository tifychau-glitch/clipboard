/**
 * Device-key utilities.
 *
 * The daemon identifies itself to the Clipboard cloud server via a random
 * 32-char hex key. On first run we generate one and persist it back into
 * daemon/.env so subsequent runs are stable.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { log } from "./logger.js";

const ENV_PATH = resolve(process.cwd(), ".env");

export function generateDeviceKey(): string {
  // 16 bytes → 32 hex chars, which is plenty of entropy for a device id.
  return randomBytes(16).toString("hex");
}

/**
 * Append or update a KEY=VALUE entry in daemon/.env.
 * Creates the file if missing. Never removes unrelated entries.
 */
export function persistEnvValue(key: string, value: string): void {
  let contents = "";
  if (existsSync(ENV_PATH)) {
    contents = readFileSync(ENV_PATH, "utf8");
  }

  const line = `${key}=${value}`;
  // Match KEY= at start of a line (with optional trailing CR on Windows).
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(contents)) {
    contents = contents.replace(pattern, line);
  } else {
    if (contents.length > 0 && !contents.endsWith("\n")) contents += "\n";
    contents += line + "\n";
  }

  writeFileSync(ENV_PATH, contents, { encoding: "utf8" });
  log.info(`Wrote ${key} to ${ENV_PATH}`);
}

/**
 * Ensure DAEMON_DEVICE_KEY exists. If not, generate one, persist it, and set
 * it on process.env so the running process sees it. Returns the key.
 */
export function ensureDeviceKey(): string {
  const existing = process.env.DAEMON_DEVICE_KEY;
  if (existing && existing.trim().length > 0) return existing.trim();

  const fresh = generateDeviceKey();
  persistEnvValue("DAEMON_DEVICE_KEY", fresh);
  process.env.DAEMON_DEVICE_KEY = fresh;
  log.info("Generated new DAEMON_DEVICE_KEY (32 hex chars).");
  return fresh;
}

/**
 * Ensure DAEMON_DEVICE_NAME exists. Defaults to the machine hostname.
 */
export function ensureDeviceName(hostname: string): string {
  const existing = process.env.DAEMON_DEVICE_NAME;
  if (existing && existing.trim().length > 0) return existing.trim();

  persistEnvValue("DAEMON_DEVICE_NAME", hostname);
  process.env.DAEMON_DEVICE_NAME = hostname;
  log.info(`Set DAEMON_DEVICE_NAME to ${hostname}`);
  return hostname;
}
