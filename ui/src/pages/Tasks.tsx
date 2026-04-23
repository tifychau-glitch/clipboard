import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ListChecks, Loader2, Send } from "lucide-react";
import { api } from "../lib/api";
import { useDefaultCompany } from "../lib/company";
import {
  formatDuration,
  formatRelativeTime,
  formatTokens,
  formatUsd,
} from "../lib/format";
import {
  findCeoAgent,
  runBilling,
  runDurationMs,
  runModel,
  runSummary,
  runTokens,
  runWakeReason,
  type Agent,
  type HeartbeatRun,
} from "../lib/types";
import { EmptyState } from "../components/EmptyState";
import { RunRowSkeleton } from "../components/Skeleton";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { MonoLabel } from "../components/ui/mono-label";
import { Textarea, Select as BrandSelect } from "../components/ui/input";

export function TasksPage() {
  const company = useDefaultCompany();
  const companyId = company.data?.id;

  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => api.listAgents(companyId!),
    enabled: !!companyId,
    refetchInterval: 5_000,
  });

  // Fan out to fetch runs for each agent (Paperclip's heartbeat-runs endpoint
  // is per-agent or all-agents-but-only-one-call-per-id, so we just multiplex).
  const runsQueries = useQueries({
    queries: (agents.data ?? []).map((a) => ({
      queryKey: ["runs", companyId, a.id],
      queryFn: () => api.listRuns(companyId!, a.id),
      enabled: !!companyId,
      refetchInterval: 3_000,
    })),
  });

  const allRuns = useMemo(() => {
    const merged: Array<HeartbeatRun & { agentName: string }> = [];
    runsQueries.forEach((q, i) => {
      const a = agents.data?.[i];
      if (!a || !q.data) return;
      for (const r of q.data) merged.push({ ...r, agentName: a.name });
    });
    merged.sort((a, b) => {
      const at = a.startedAt ?? a.createdAt;
      const bt = b.startedAt ?? b.createdAt;
      return new Date(bt).getTime() - new Date(at).getTime();
    });
    return merged.slice(0, 50);
  }, [runsQueries, agents.data]);

  if (company.isLoading || agents.isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }

  const activeAgents = (agents.data ?? []).filter((a) => a.status !== "paused");

  return (
    <div className="space-y-8">
      {agents.data && agents.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h2 className="text-lg font-medium">No agents yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create an agent on the{" "}
            <Link to="/agents" className="text-primary hover:underline">
              Agents tab
            </Link>{" "}
            first.
          </p>
        </div>
      ) : (
        <TaskComposer
          agents={agents.data ?? []}
          onSent={() => runsQueries.forEach((q) => q.refetch())}
        />
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recent tasks (all agents)
        </h2>
        {runsQueries.length > 0 &&
        runsQueries.some((q) => q.isLoading) &&
        allRuns.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <RunRowSkeleton key={i} />
            ))}
          </div>
        ) : allRuns.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="size-6" strokeWidth={1.5} />}
            title="No tasks yet"
            description={
              activeAgents.length === 0
                ? "No active agents to send tasks to."
                : "Tell your CEO what you want to accomplish."
            }
          />
        ) : (
          <div className="space-y-2">
            {allRuns.map((r) => (
              <RunRow key={r.id} run={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Top-level composer: always opens in "tell your CEO" mode. A subtle link
// flips to the legacy direct-to-agent composer for power users.
function TaskComposer({ agents, onSent }: { agents: Agent[]; onSent: () => void }) {
  const [mode, setMode] = useState<"ceo" | "direct">("ceo");

  if (mode === "direct") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode("ceo")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to Tell your CEO
        </button>
        <ComposeTask agents={agents} onSent={onSent} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TellCeoComposer agents={agents} onSent={onSent} />
      <div className="text-right">
        <button
          type="button"
          onClick={() => setMode("direct")}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Or send directly to a specific agent ↓
        </button>
      </div>
    </div>
  );
}

function TellCeoComposer({
  agents,
  onSent,
}: {
  agents: Agent[];
  onSent: () => void;
}) {
  const qc = useQueryClient();
  const ceo = findCeoAgent(agents);
  const [prompt, setPrompt] = useState("");
  const [askForPlan, setAskForPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      if (!ceo) throw new Error("No CEO agent in this company.");
      const base = prompt.trim();
      if (!base) throw new Error("Enter a goal.");
      const prefix = askForPlan
        ? "Before delegating any work, show me your delegation plan and wait for my approval.\n\n"
        : "";
      return api.wakeupAgent(ceo.id, {
        reason: "Owner directive via Tell your CEO",
        payload: { prompt: prefix + base },
        forceFreshSession: true,
      });
    },
    onSuccess: () => {
      setPrompt("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["runs"] });
      onSent();
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  });

  return (
    <section>
      <Card padding="lg">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.025em",
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          What do you want to accomplish?
        </h2>
        <p
          className="mt-1"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--muted-foreground)",
          }}
        >
          Your CEO will figure out who handles it.
        </p>

        {!ceo ? (
          <div
            className="mt-4 flex items-start gap-3 rounded-xl p-3.5"
            style={{
              background: "#FEF9E7",
              border: "1px solid #F6C94E",
              color: "#B8860B",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
            }}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                No CEO agent found.
              </div>
              <div className="mt-0.5" style={{ color: "#8B860B" }}>
                Add one from the{" "}
                <Link to="/agents" className="underline underline-offset-2">
                  Agents tab
                </Link>{" "}
                to use this feature.
              </div>
            </div>
          </div>
        ) : (
          <>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={send.isPending}
              rows={4}
              placeholder={
                "e.g. Get a social post written about our latest deal, or: I want to bring in an extra $5k this month, figure out what we should focus on."
              }
              className="mt-4 resize-none"
            />
            <label
              className="mt-3 flex cursor-pointer items-center gap-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--muted-foreground)",
              }}
              title="CEO will outline the delegation plan and wait for your approval before sending work to agents"
            >
              <input
                type="checkbox"
                checked={askForPlan}
                onChange={(e) => setAskForPlan(e.target.checked)}
                className="size-3.5 rounded"
                style={{ accentColor: "#7B52E8" }}
              />
              Ask for a plan before starting
            </label>

            {error && (
              <div
                className="mt-3"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <MonoLabel>
                Goes to {ceo.name}
                {ceo.title ? ` · ${ceo.title}` : ""}
              </MonoLabel>
              <Button
                variant="violet"
                size="sm"
                onClick={() => send.mutate()}
                disabled={send.isPending || !prompt.trim()}
                leftIcon={
                  send.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )
                }
              >
                Send to CEO
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}

function ComposeTask({ agents, onSent }: { agents: Agent[]; onSent: () => void }) {
  const qc = useQueryClient();
  const candidates = agents.filter((a) => a.status !== "paused");
  const [agentId, setAgentId] = useState(candidates[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If the previously-selected agent gets paused/deleted, fall back to first available.
  const selectedExists = candidates.some((a) => a.id === agentId);
  if (!selectedExists && candidates[0]) {
    setAgentId(candidates[0].id);
  }

  const send = useMutation({
    mutationFn: async () => {
      const trimmed = prompt.trim();
      if (!trimmed) throw new Error("Enter a prompt");
      if (!agentId) throw new Error("Pick an agent");
      return api.wakeupAgent(agentId, {
        reason: "Ad-hoc task from Mission Control",
        payload: { prompt: trimmed },
        forceFreshSession: true,
      });
    },
    onSuccess: () => {
      setPrompt("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["runs"] });
      onSent();
    },
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  });

  return (
    <section>
      <div className="mb-3">
        <MonoLabel spaced>Send a task</MonoLabel>
      </div>
      <Card padding="md">
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--fg-body)",
            }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>To:</span>
            <BrandSelect
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={send.isPending || candidates.length === 0}
              className="w-auto min-w-[160px] py-1.5 text-sm"
            >
              {candidates.length === 0 && <option value="">No active agents</option>}
              {candidates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.title ? ` — ${a.title}` : ""}
                </option>
              ))}
            </BrandSelect>
          </label>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={send.isPending || candidates.length === 0}
          rows={3}
          placeholder={
            candidates.length === 0
              ? "All agents are paused or none exist."
              : "Tell the agent what to do…"
          }
          className="mt-3 resize-none"
        />
        {error && (
          <div
            className="mt-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <MonoLabel>
            Each task starts fresh. Output appears below.
          </MonoLabel>
          <Button
            variant="violet"
            size="sm"
            onClick={() => send.mutate()}
            disabled={send.isPending || !prompt.trim() || !agentId}
            leftIcon={
              send.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )
            }
          >
            Send
          </Button>
        </div>
      </Card>
    </section>
  );
}

function RunRow({ run }: { run: HeartbeatRun & { agentName: string } }) {
  const [expanded, setExpanded] = useState(false);
  const tokens = runTokens(run);
  const billing = runBilling(run);
  const cost =
    billing.kind === "subscription"
      ? "Subscription"
      : billing.kind === "api"
      ? formatUsd(billing.usd)
      : "—";
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <StatusBadge status={run.status} />
          <Link
            to={`/agents/${run.agentId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {run.agentName}
          </Link>
          <span className="truncate text-sm">
            {runSummary(run) ?? runWakeReason(run) ?? "(no summary yet)"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDuration(runDurationMs(run))}</span>
          <span>{formatTokens(tokens.total)} tokens</span>
          <span className={billing.kind === "subscription" ? "text-muted-foreground/70" : undefined}>
            {cost}
          </span>
          <span>{formatRelativeTime(run.startedAt ?? run.createdAt)}</span>
        </div>
      </button>
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 text-sm">
          {run.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive whitespace-pre-wrap">
              {run.error}
            </div>
          )}
          {runSummary(run) && (
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Output</div>
              <div className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-xs">
                {runSummary(run)}
              </div>
            </div>
          )}
          <dl className="grid grid-cols-4 gap-2 text-xs">
            <Stat label="Input" value={formatTokens(tokens.input)} />
            <Stat label="Cached" value={formatTokens(tokens.cached)} />
            <Stat label="Output" value={formatTokens(tokens.output)} />
            <Stat label="Model" value={runModel(run) ?? "—"} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}
