/**
 * Detect which AI CLIs are installed on this machine.
 *
 * Strategy: run each CLI with `--version` and capture exit status.
 * Any non-zero exit, missing binary (ENOENT), or timeout = "not present".
 *
 * Each CLI is probed in parallel with a short timeout so startup is snappy
 * even on machines with slow shells.
 */
import { spawn } from "node:child_process";
import { hostname, platform } from "node:os";
import { log } from "./logger.js";

const PROBE_TIMEOUT_MS = 5000;

export type CliIdentifier =
  | "claude_local"
  | "codex_local"
  | "gemini_local"
  | "opencode_local";

interface CliProbe {
  id: CliIdentifier;
  command: string;
  args: string[];
}

const PROBES: CliProbe[] = [
  { id: "claude_local", command: "claude", args: ["--version"] },
  { id: "codex_local", command: "codex", args: ["--version"] },
  { id: "gemini_local", command: "gemini", args: ["--version"] },
  { id: "opencode_local", command: "opencode", args: ["--version"] },
];

export interface MachineDetection {
  os: NodeJS.Platform;
  hostname: string;
  availableClis: CliIdentifier[];
}

/**
 * Attempt to run `command args...` and resolve to true iff it exits 0 quickly.
 * Never throws — any error resolves to false.
 */
function probeCli(probe: CliProbe): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    let child;
    try {
      child = spawn(probe.command, probe.args, {
        stdio: "ignore",
        // Inherit PATH etc. so tools installed via nvm/brew/volta resolve.
        env: process.env,
      });
    } catch {
      finish(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {
        /* noop */
      }
      finish(false);
    }, PROBE_TIMEOUT_MS);

    child.on("error", () => {
      clearTimeout(timer);
      finish(false);
    });

    child.on("exit", (code) => {
      clearTimeout(timer);
      finish(code === 0);
    });
  });
}

/**
 * Probe all known CLIs in parallel and return the machine profile.
 * Logs a warning when nothing is found; otherwise logs the list.
 */
export async function detectMachine(): Promise<MachineDetection> {
  const results = await Promise.all(
    PROBES.map(async (p) => ({ id: p.id, present: await probeCli(p) })),
  );
  const availableClis = results.filter((r) => r.present).map((r) => r.id);

  const detection: MachineDetection = {
    os: platform(),
    hostname: hostname(),
    availableClis,
  };

  if (availableClis.length === 0) {
    log.warn(
      "No AI CLIs detected on this machine. Install at least one of: claude, codex, gemini, opencode.",
    );
  } else {
    log.info(`Detected CLIs: ${availableClis.join(", ")}`);
  }
  log.info(`OS: ${detection.os} • hostname: ${detection.hostname}`);

  return detection;
}
