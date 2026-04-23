// Dashboard — unified high-level overview of the business.
//
// Pulls together everything a non-technical operator needs to see at a glance:
// agent roster + status, month spend, pending approvals, 14-day run activity,
// success rate, spending by agent, and recent activity + failures.

import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { useDefaultCompany } from "../lib/company";
import { formatRelativeTime, formatTokens, formatUsd } from "../lib/format";
import type { Agent, HeartbeatRun } from "../lib/types";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { MonoLabel } from "../components/ui/mono-label";
// (PageHeader removed — layout no longer has a shared top bar.)

// Friendly translations for Paperclip's audit-log action codes.
// Matches the list used in Activity.tsx so the two views feel consistent.
const ACTION_LABELS: Record<string, string> = {
  "agent.created": "Agent created",
  "agent.updated": "Agent updated",
  "agent.deleted": "Agent deleted",
  "agent.paused": "Agent paused",
  "agent.resumed": "Agent resumed",
  "heartbeat.invoked": "Task assigned",
  "heartbeat.started": "Task started",
  "heartbeat.completed": "Task completed",
  "heartbeat.failed": "Task failed",
  "company.created": "Company created",
  "company.updated": "Company settings changed",
  "hire_hook.succeeded": "Agent hired",
  "hire_hook.failed": "Agent hire failed",
  "hire_hook.error": "Agent hire errored",
};

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action;
}

/**
 * Status dot color — brand palette, not Tailwind defaults.
 *   running          → teal (live / active)
 *   paused           → yellow (attention)
 *   pending_approval → violet (agent intelligence / waiting on you)
 *   error            → destructive red
 *   idle / active    → muted
 */
function statusDotColor(status: Agent["status"]): string {
  switch (status) {
    case "running":
      return "#2BBFAD";
    case "paused":
      return "#F6C94E";
    case "pending_approval":
      return "#7B52E8";
    case "error":
      return "#DC2626";
    default:
      return "var(--muted-foreground)";
  }
}

export function DashboardPage() {
  const company = useDefaultCompany();
  const companyId = company.data?.id;

  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => api.listAgents(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  const approvals = useQuery({
    queryKey: ["pendingApprovals", companyId],
    queryFn: () => api.listPendingApprovals(companyId!),
    enabled: !!companyId,
    refetchInterval: 15_000,
  });

  const costsSummary = useQuery({
    queryKey: ["costs", "summary", companyId],
    queryFn: () => api.costsSummary(companyId!),
    enabled: !!companyId,
    refetchInterval: 15_000,
  });

  const byAgent = useQuery({
    queryKey: ["costs", "byAgent", companyId],
    queryFn: () => api.costsByAgent(companyId!),
    enabled: !!companyId,
    refetchInterval: 15_000,
  });

  const runs = useQuery({
    queryKey: ["runs", companyId],
    queryFn: () => api.listRuns(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  const activity = useQuery({
    queryKey: ["activity", companyId],
    queryFn: () => api.activity(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  // Agent counts by category
  const agentStats = useMemo(() => {
    const list = agents.data ?? [];
    let enabled = 0;
    let paused = 0;
    let pending = 0;
    let error = 0;
    for (const a of list) {
      if (a.status === "paused") paused++;
      else if (a.status === "pending_approval") pending++;
      else if (a.status === "error") error++;
      else enabled++;
    }
    return { total: list.length, enabled, paused, pending, error };
  }, [agents.data]);

  // Lifetime run + token totals
  const spendStats = useMemo(() => {
    const rows = byAgent.data ?? [];
    let tokens = 0;
    let runsTotal = 0;
    let subRuns = 0;
    let apiRuns = 0;
    for (const r of rows) {
      tokens +=
        r.inputTokens +
        r.cachedInputTokens +
        r.outputTokens +
        r.subscriptionInputTokens +
        r.subscriptionCachedInputTokens +
        r.subscriptionOutputTokens;
      subRuns += r.subscriptionRunCount;
      apiRuns += r.apiRunCount;
    }
    runsTotal = subRuns + apiRuns;
    return { tokens, runsTotal, subRuns, apiRuns };
  }, [byAgent.data]);

  // 14-day run activity (split by succeeded / failed) — uses the recent-runs feed
  const runActivity = useMemo(() => {
    return buildDailyActivity(runs.data ?? [], 14);
  }, [runs.data]);

  // Success rate across all fetched runs (snapshot of recent runs)
  const successRate = useMemo(() => {
    const list = runs.data ?? [];
    let ok = 0;
    let bad = 0;
    for (const r of list) {
      if (r.status === "succeeded") ok++;
      else if (r.status === "failed" || r.status === "cancelled") bad++;
    }
    const done = ok + bad;
    return { ok, bad, done, pct: done === 0 ? 0 : Math.round((ok / done) * 100) };
  }, [runs.data]);

  // Top 5 agents by total tokens (lifetime)
  const topSpenders = useMemo(() => {
    const rows = (byAgent.data ?? []).map((r) => ({
      ...r,
      totalTokens: r.inputTokens + r.cachedInputTokens + r.outputTokens,
    }));
    rows.sort((a, b) => b.totalTokens - a.totalTokens);
    return rows.slice(0, 5);
  }, [byAgent.data]);

  const recentActivity = (activity.data ?? []).slice(0, 8);

  const recentFailures = useMemo(() => {
    return (runs.data ?? [])
      .filter((r) => r.status === "failed")
      .slice(0, 5);
  }, [runs.data]);

  const agentNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of agents.data ?? []) m.set(a.id, a.name);
    return m;
  }, [agents.data]);

  if (company.isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (company.error) {
    return (
      <div className="text-destructive">
        Could not reach the backend. Is it running?
      </div>
    );
  }

  const apiSpendUsd = (costsSummary.data?.spendCents ?? 0) / 100;

  const pendingCount = (approvals.data ?? []).length;

  return (
    <div className="space-y-6">
      {/* Pending approvals banner — surfaced prominently in brand violet tint. */}
      {pendingCount > 0 && (
        <Link
          to="/agents"
          className="flex items-center justify-between gap-3 rounded-xl border border-[#D4C6FF] bg-[#F0EBFF] px-5 py-3.5 hover:bg-[#E8E0FF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-8 items-center justify-center rounded-full"
              style={{ background: "#7B52E8", color: "#fff" }}
            >
              <ShieldCheck size={16} strokeWidth={2} />
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "#5B32C8", fontFamily: "var(--font-sans)" }}
            >
              {pendingCount} pending approval{pendingCount === 1 ? "" : "s"} waiting for your review.
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1 text-xs font-bold"
            style={{
              color: "#5B32C8",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            Review <ArrowRight size={12} />
          </span>
        </Link>
      )}

      {/* KPI strip — Bricolage 800 numbers in brand accents. */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Agents enabled"
          value={String(agentStats.enabled)}
          accent="#2BBFAD"
          hint={
            agentStats.paused || agentStats.pending || agentStats.error
              ? `${agentStats.paused} paused · ${agentStats.pending} pending · ${agentStats.error} error`
              : `${agentStats.total} total`
          }
          to="/agents"
        />
        <KpiCard
          label="Pending approvals"
          value={String(pendingCount)}
          accent={pendingCount > 0 ? "#7B52E8" : "var(--foreground)"}
          hint={pendingCount === 0 ? "All clear" : "Awaiting review"}
          to="/agents"
        />
        <KpiCard
          label="Month spend"
          value={formatUsd(apiSpendUsd)}
          accent="#F6C94E"
          hint={
            costsSummary.data?.budgetCents
              ? `${costsSummary.data.utilizationPercent}% of budget`
              : "No budget set"
          }
          to="/spending"
        />
        <KpiCard
          label="Total runs"
          value={String(spendStats.runsTotal)}
          accent="var(--foreground)"
          hint={`${spendStats.subRuns} sub · ${spendStats.apiRuns} API`}
          to="/tasks"
        />
      </section>

      {/* Weekly pulse — the dashboard's brand moment. Navy slab, three-stripe
          motif, yellow CTA. */}
      <WeeklyPulse
        runsTotal={spendStats.runsTotal}
        successRate={successRate.pct}
        failures={successRate.bad}
      />

      {/* Charts: run activity + success rate */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="Run activity" subtitle="Last 14 days" className="lg:col-span-2">
          {runActivity.total === 0 ? (
            <EmptyPanel text="No runs yet." />
          ) : (
            <RunActivityChart data={runActivity} />
          )}
        </Panel>
        <Panel title="Success rate" subtitle={`${successRate.done} recent runs`}>
          {successRate.done === 0 ? (
            <EmptyPanel text="No completed runs yet." />
          ) : (
            <SuccessDonut pct={successRate.pct} ok={successRate.ok} bad={successRate.bad} />
          )}
        </Panel>
      </section>

      {/* Agents overview + spending breakdown */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Agents" subtitle={`${agentStats.total} total`}>
          {agents.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : agents.data && agents.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {agents.data
                .slice()
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                .map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/agents/${a.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:text-[#7B52E8]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: statusDotColor(a.status) }}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div
                            className="truncate text-sm font-bold"
                            style={{
                              fontFamily: "var(--font-display)",
                              letterSpacing: "-0.01em",
                              color: "var(--foreground)",
                            }}
                          >
                            {a.name}
                          </div>
                          {a.title && (
                            <div
                              className="truncate text-xs mt-0.5"
                              style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
                            >
                              {a.title}
                            </div>
                          )}
                        </div>
                      </div>
                      <MonoLabel tone="muted">
                        {formatRelativeTime(a.lastHeartbeatAt)}
                      </MonoLabel>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyPanel text="No agents yet." />
          )}
        </Panel>

        <Panel
          title="Top spenders"
          subtitle="Lifetime tokens"
          headerAction={
            <Link
              to="/spending"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All →
            </Link>
          }
        >
          {topSpenders.length === 0 ? (
            <EmptyPanel text="No token usage yet." />
          ) : (
            <ul className="space-y-3.5">
              {topSpenders.map((row) => {
                const max = topSpenders[0].totalTokens || 1;
                const pct = Math.max(2, Math.round((row.totalTokens / max) * 100));
                return (
                  <li key={row.agentId}>
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        to={`/agents/${row.agentId}`}
                        className="truncate text-sm font-bold transition-colors hover:text-[#7B52E8]"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.01em",
                          color: "var(--foreground)",
                        }}
                      >
                        {row.agentName}
                      </Link>
                      <span
                        className="shrink-0 text-xs"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--fg-body)",
                        }}
                      >
                        {formatTokens(row.totalTokens)}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
                      style={{ background: "var(--surface-subtle)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "#7B52E8" }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <MonoLabel tone="muted">
                        {row.subscriptionRunCount + row.apiRunCount} runs
                      </MonoLabel>
                      <MonoLabel tone="muted">
                        {formatUsd(row.costCents / 100)} API
                      </MonoLabel>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>

      {/* Recent activity + recent failures */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent activity"
          headerAction={
            <Link
              to="/activity"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              All →
            </Link>
          }
        >
          {recentActivity.length === 0 ? (
            <EmptyPanel text="Nothing has happened yet." />
          ) : (
            <ul className="divide-y divide-border">
              {recentActivity.map((e) => {
                const tint = activityTint(e.action);
                return (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ background: tint.dot }}
                        aria-hidden
                      />
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
                        style={{
                          background: tint.bg,
                          color: tint.fg,
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {actionLabel(e.action)}
                      </span>
                      {e.agentId && agentNameById.has(e.agentId) && (
                        <span
                          className="truncate text-xs"
                          style={{ color: "var(--fg-body)", fontFamily: "var(--font-sans)" }}
                        >
                          {agentNameById.get(e.agentId)}
                        </span>
                      )}
                    </div>
                    <MonoLabel tone="muted">
                      {formatRelativeTime(e.createdAt)}
                    </MonoLabel>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent failures"
          subtitle={recentFailures.length > 0 ? "Runs that errored" : "Nothing to worry about"}
        >
          {recentFailures.length === 0 ? (
            <div
              className="flex items-center gap-2 py-2 text-sm"
              style={{ color: "#1A8A7D", fontFamily: "var(--font-sans)" }}
            >
              <CheckCircle2 className="size-4" style={{ color: "#2BBFAD" }} />
              No failures recently.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentFailures.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-2.5">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: "#DC2626" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/agents/${r.agentId}`}
                        className="truncate text-sm font-bold transition-colors hover:text-[#7B52E8]"
                        style={{
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.01em",
                          color: "var(--foreground)",
                        }}
                      >
                        {agentNameById.get(r.agentId) ?? "Unknown agent"}
                      </Link>
                      <MonoLabel tone="muted">
                        {formatRelativeTime(r.finishedAt ?? r.startedAt ?? r.createdAt)}
                      </MonoLabel>
                    </div>
                    {r.error && (
                      <div
                        className="mt-1 truncate text-xs"
                        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
                      >
                        {r.error}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

// ---------- Subcomponents ----------

/**
 * KPI tile — Bricolage 800 number in an accent color, DM Mono uppercase
 * eyebrow below, body-small hint underneath. The accent color is the
 * only meaningful per-card variation.
 */
function KpiCard({
  label,
  value,
  accent,
  hint,
  to,
}: {
  label: string;
  value: string;
  accent: string;
  hint: string;
  to?: string;
}) {
  const inner = (
    <Card
      interactive={!!to}
      padding="none"
      className="px-5 py-4 h-full"
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 32,
          color: accent,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div className="mt-2">
        <MonoLabel spaced>{label}</MonoLabel>
      </div>
      {hint && (
        <div
          className="mt-1 text-[11px]"
          style={{ color: "var(--fg-body)", fontFamily: "var(--font-sans)" }}
        >
          {hint}
        </div>
      )}
    </Card>
  );
  return to ? (
    <Link to={to} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/**
 * Panel — a titled content card. Thin wrapper around Card so Dashboard
 * stays readable and can pass a headerAction (e.g. "All →").
 */
function Panel({
  title,
  subtitle,
  children,
  className,
  headerAction,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}) {
  return (
    <Card padding="md" className={className}>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerAction}
      </div>
      {children}
    </Card>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div
      className="py-6 text-center text-sm"
      style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
    >
      {text}
    </div>
  );
}

/**
 * Weekly pulse — the dashboard's big brand moment. Navy slab, three-stripe
 * motif, yellow CTA. Copy adapts to whether anything has happened yet.
 */
function WeeklyPulse({
  runsTotal,
  successRate,
  failures,
}: {
  runsTotal: number;
  successRate: number;
  failures: number;
}) {
  const hasActivity = runsTotal > 0;
  return (
    <section
      className="relative overflow-hidden rounded-xl px-7 py-6"
      style={{ background: "#12192B", color: "#fff" }}
    >
      {/* Accent blobs */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          top: -30,
          right: -20,
          width: 180,
          height: 180,
          background: "#7B52E8",
          opacity: 0.18,
          filter: "blur(50px)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          bottom: -40,
          right: 120,
          width: 140,
          height: 140,
          background: "#F6C94E",
          opacity: 0.1,
          filter: "blur(45px)",
        }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          {/* Three-stripe motif */}
          <div className="mb-4 flex gap-1">
            <span style={{ width: 22, height: 3, borderRadius: 2, background: "#F6C94E" }} />
            <span style={{ width: 22, height: 3, borderRadius: 2, background: "#2BBFAD" }} />
            <span style={{ width: 22, height: 3, borderRadius: 2, background: "#7B52E8" }} />
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              marginBottom: 8,
            }}
          >
            {hasActivity
              ? "Your weekly pulse is ready."
              : "Your weekly pulse will appear here."}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 300,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.55,
              maxWidth: 560,
            }}
          >
            {hasActivity
              ? `${runsTotal} task${runsTotal === 1 ? "" : "s"} handled · ${successRate}% success · ${failures} failure${failures === 1 ? "" : "s"}. Here's what your agents did this week.`
              : "Once your agents start running, you'll get a summary of what they did every week."}
          </div>
        </div>
        <div className="shrink-0">
          {/* No dedicated weekly-pulse page exists yet. Route to the
              closest existing surface: the Activity feed (week's events)
              when there's data, or the Agents setup when there isn't. */}
          <Link to={hasActivity ? "/activity" : "/agents"}>
            <Button
              variant={hasActivity ? "yellow" : "outline"}
              size="sm"
              rightIcon={<ArrowRight size={14} />}
            >
              {hasActivity ? "See the activity" : "Set up agents"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Activity-feed row tint by action code. Maps event categories to brand accents. */
function activityTint(action: string): { bg: string; fg: string; dot: string } {
  if (action.startsWith("agent.")) {
    // Agent lifecycle events use violet (agents are the product).
    return { bg: "#F0EBFF", fg: "#5B32C8", dot: "#7B52E8" };
  }
  if (action.startsWith("heartbeat.")) {
    if (action === "heartbeat.failed") {
      return { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" };
    }
    if (action === "heartbeat.completed") {
      return { bg: "#E6FAF8", fg: "#1A8A7D", dot: "#2BBFAD" };
    }
    // Queued / invoked / started — neutral-ish with yellow hint of energy.
    return { bg: "#FEF9E7", fg: "#B8860B", dot: "#F6C94E" };
  }
  if (action.startsWith("hire_hook.")) {
    if (action === "hire_hook.succeeded") {
      return { bg: "#E6FAF8", fg: "#1A8A7D", dot: "#2BBFAD" };
    }
    return { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" };
  }
  // Company events, unknowns, everything else.
  return {
    bg: "var(--surface-subtle)",
    fg: "var(--fg-body)",
    dot: "var(--muted-foreground)",
  };
}

// ---------- Charts (inline SVG — no library) ----------

type DailyBucket = {
  date: string; // YYYY-MM-DD
  label: string; // short label (e.g. "Tue")
  succeeded: number;
  failed: number;
  other: number;
};

type DailyActivity = {
  buckets: DailyBucket[];
  max: number;
  total: number;
};

function buildDailyActivity(runsIn: HeartbeatRun[], days: number): DailyActivity {
  const now = new Date();
  const buckets: DailyBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      succeeded: 0,
      failed: 0,
      other: 0,
    });
  }
  const byDate = new Map(buckets.map((b) => [b.date, b]));

  for (const run of runsIn) {
    const ts = run.startedAt ?? run.createdAt;
    if (!ts) continue;
    const key = new Date(ts).toISOString().slice(0, 10);
    const bucket = byDate.get(key);
    if (!bucket) continue;
    if (run.status === "succeeded") bucket.succeeded++;
    else if (run.status === "failed" || run.status === "cancelled") bucket.failed++;
    else bucket.other++;
  }

  let max = 0;
  let total = 0;
  for (const b of buckets) {
    const n = b.succeeded + b.failed + b.other;
    if (n > max) max = n;
    total += n;
  }
  return { buckets, max: Math.max(1, max), total };
}

function RunActivityChart({ data }: { data: DailyActivity }) {
  const { buckets, max } = data;
  const height = 120;
  return (
    <div>
      <div
        className="grid items-end gap-1"
        style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`, height }}
      >
        {buckets.map((b) => {
          const total = b.succeeded + b.failed + b.other;
          const hPct = total === 0 ? 0 : (total / max) * 100;
          const okH = total === 0 ? 0 : (b.succeeded / total) * hPct;
          const badH = total === 0 ? 0 : (b.failed / total) * hPct;
          const otherH = total === 0 ? 0 : (b.other / total) * hPct;
          return (
            <div
              key={b.date}
              className="group relative flex h-full w-full flex-col justify-end"
              title={`${b.date}: ${b.succeeded} ok · ${b.failed} failed · ${b.other} other`}
            >
              {total === 0 ? (
                <div
                  className="h-[2px] w-full rounded-sm"
                  style={{ background: "var(--border)" }}
                />
              ) : (
                <div className="flex h-full w-full flex-col-reverse overflow-hidden rounded-sm">
                  <div className="w-full" style={{ height: `${okH}%`, background: "#2BBFAD" }} />
                  <div className="w-full" style={{ height: `${badH}%`, background: "#DC2626" }} />
                  <div className="w-full" style={{ height: `${otherH}%`, background: "var(--muted-foreground)" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="mt-2 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
        }}
      >
        {buckets.map((b, i) => (
          <div
            key={b.date}
            className="text-center"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--muted-foreground)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {i % 2 === 0 ? b.label.slice(0, 2) : ""}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <Legend color="#2BBFAD" label="succeeded" />
        <Legend color="#DC2626" label="failed" />
        <Legend color="var(--muted-foreground)" label="other" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      style={{ color: "var(--fg-body)", fontFamily: "var(--font-sans)" }}
    >
      <span
        className="inline-block size-2 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function SuccessDonut({ pct, ok, bad }: { pct: number; ok: number; bad: number }) {
  const size = 140;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#2BBFAD"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            fill: "var(--foreground)",
            letterSpacing: "-0.025em",
          }}
        >
          {pct}%
        </text>
      </svg>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4" style={{ color: "#2BBFAD" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--foreground)",
            }}
          >
            {ok}
          </span>
          <MonoLabel tone="muted">succeeded</MonoLabel>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="size-4" style={{ color: "#DC2626" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--foreground)",
            }}
          >
            {bad}
          </span>
          <MonoLabel tone="muted">failed</MonoLabel>
        </div>
      </div>
    </div>
  );
}
