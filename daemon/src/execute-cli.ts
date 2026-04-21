/**
 * Execute a task by spawning the appropriate local AI CLI and streaming
 * its stdout/stderr back to the cloud server in real time.
 *
 * Contract:
 *   - onChunk fires with each stdout/stderr chunk (as they arrive, not buffered)
 *   - onDone fires exactly once with the final exit code
 *   - If the task exceeds TASK_TIMEOUT_MINUTES, the child is killed and
 *     onDone fires with exitCode=-1 and a "Task timed out" chunk first
 *   - Per-agent concurrency is enforced externally by the connection layer
 *     (see BusyAgents below)
 */
import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { log } from "./logger.js";
import type { CliIdentifier } from "./detect-clis.js";

export interface TaskDescriptor {
  taskId: string;
  agentId: string;
  adapterType: string;
  prompt: string;
  companyId: string;
  runId: string;
  /** Optional: if present, resume a prior Claude session with --continue. */
  resumeClaudeSession?: boolean;
}

export interface ExecuteCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (exitCode: number) => void;
}

interface SpawnPlan {
  command: string;
  args: string[];
}

/**
 * Turn an adapter identifier + prompt into the concrete command to run.
 * Throws for unknown adapters so the caller can surface a clear error.
 */
function planForAdapter(
  adapterType: string,
  prompt: string,
  resumeClaudeSession = false,
): SpawnPlan {
  switch (adapterType as CliIdentifier) {
    case "claude_local":
      return resumeClaudeSession
        ? { command: "claude", args: ["--continue", "--print", prompt] }
        : { command: "claude", args: ["--print", prompt] };
    case "codex_local":
      return { command: "codex", args: [prompt] };
    case "gemini_local":
      return { command: "gemini", args: [prompt] };
    case "opencode_local":
      return { command: "opencode", args: [prompt] };
    default:
      throw new Error(`Unsupported adapterType: ${adapterType}`);
  }
}

function getTimeoutMs(): number {
  const minutes = Number(process.env.TASK_TIMEOUT_MINUTES ?? 10);
  const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : 10;
  return safe * 60 * 1000;
}

/**
 * Per-agent busy tracker. Exposed so the connection layer can check
 * whether an incoming task should be skipped.
 */
export class BusyAgents {
  private readonly busy = new Set<string>();

  isBusy(agentId: string): boolean {
    return this.busy.has(agentId);
  }

  markBusy(agentId: string): void {
    this.busy.add(agentId);
  }

  markFree(agentId: string): void {
    this.busy.delete(agentId);
  }

  snapshot(): string[] {
    return Array.from(this.busy);
  }
}

/**
 * Spawn the CLI for the given task and stream output.
 * Returns a handle that includes a kill() method in case the caller
 * needs to cancel (e.g. SIGTERM graceful shutdown scenarios).
 */
export function executeTask(
  task: TaskDescriptor,
  callbacks: ExecuteCallbacks,
): { kill: () => void } {
  let plan: SpawnPlan;
  try {
    plan = planForAdapter(task.adapterType, task.prompt, task.resumeClaudeSession);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`[task ${task.taskId}] ${msg}`);
    // Surface the failure through the same callbacks so the cloud server
    // observes a terminal state rather than a silent skip.
    callbacks.onChunk(`Error: ${msg}\n`);
    callbacks.onDone(-2);
    return { kill: () => undefined };
  }

  log.info(
    `[task ${task.taskId}] spawning ${plan.command} for agent ${task.agentId}`,
  );

  // stdin is "ignore" → null; stdout/stderr are "pipe" → Readable.
  let child: ChildProcessByStdio<null, Readable, Readable>;
  try {
    child = spawn(plan.command, plan.args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`[task ${task.taskId}] spawn failed: ${msg}`);
    callbacks.onChunk(`Failed to launch ${plan.command}: ${msg}\n`);
    callbacks.onDone(-3);
    return { kill: () => undefined };
  }

  let settled = false;
  const finish = (exitCode: number) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    callbacks.onDone(exitCode);
  };

  const timer = setTimeout(() => {
    if (settled) return;
    log.warn(`[task ${task.taskId}] timeout — killing ${plan.command}`);
    try {
      child.kill("SIGKILL");
    } catch {
      /* noop */
    }
    callbacks.onChunk("Task timed out\n");
    finish(-1);
  }, getTimeoutMs());

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (data: string) => callbacks.onChunk(data));
  child.stderr.on("data", (data: string) => callbacks.onChunk(data));

  child.on("error", (err) => {
    log.error(`[task ${task.taskId}] child error: ${err.message}`);
    callbacks.onChunk(`Child process error: ${err.message}\n`);
    finish(-4);
  });

  child.on("exit", (code, signal) => {
    const effective = code ?? (signal ? -5 : 0);
    log.info(
      `[task ${task.taskId}] exit code=${code} signal=${signal ?? "none"}`,
    );
    finish(effective);
  });

  return {
    kill: () => {
      try {
        child.kill("SIGTERM");
      } catch {
        /* noop */
      }
    },
  };
}
