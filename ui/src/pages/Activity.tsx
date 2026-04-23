import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useDefaultCompany } from "../lib/company";
import { formatRelativeTime } from "../lib/format";
import type { ActivityRow, Agent } from "../lib/types";
import { EmptyState } from "../components/EmptyState";
import { Select } from "../components/ui/input";
import { MonoLabel } from "../components/ui/mono-label";

// Friendly translations for Paperclip's audit-log action codes.
const ACTION_LABELS: Record<string, string> = {
  "agent.created": "Agent created",
  "agent.updated": "Agent updated",
  "agent.deleted": "Agent deleted",
  "agent.paused": "Agent paused",
  "agent.resumed": "Agent resumed",
  "agent.key_created": "Agent API key created",
  "agent.key_deleted": "Agent API key deleted",
  "heartbeat.invoked": "Task assigned",
  "heartbeat.started": "Task started",
  "heartbeat.completed": "Task completed",
  "heartbeat.failed": "Task failed",
  "company.created": "Company created",
  "company.updated": "Company settings changed",
  "hire_hook.succeeded": "Agent hire succeeded",
  "hire_hook.failed": "Agent hire failed",
  "hire_hook.error": "Agent hire errored",
};

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action;
}

export function ActivityPage() {
  const company = useDefaultCompany();
  const companyId = company.data?.id;

  const events = useQuery({
    queryKey: ["activity", companyId],
    queryFn: () => api.activity(companyId!),
    enabled: !!companyId,
    refetchInterval: 5_000,
  });

  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => api.listAgents(companyId!),
    enabled: !!companyId,
  });

  const agentLookup = useMemo(() => {
    const m = new Map<string, Agent>();
    for (const a of agents.data ?? []) m.set(a.id, a);
    return m;
  }, [agents.data]);

  const [actionFilter, setActionFilter] = useState<string>("");

  const filtered = useMemo(() => {
    if (!events.data) return [];
    if (!actionFilter) return events.data;
    return events.data.filter((e) => e.action === actionFilter);
  }, [events.data, actionFilter]);

  const distinctActions = useMemo(() => {
    const set = new Set<string>();
    for (const e of events.data ?? []) set.add(e.action);
    return Array.from(set).sort();
  }, [events.data]);

  if (company.isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-5">
        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="py-1.5 text-sm w-auto min-w-[160px]"
        >
          <option value="">All actions</option>
          {distinctActions.map((a) => (
            <option key={a} value={a}>
              {actionLabel(a)}
            </option>
          ))}
        </Select>
      </div>

      {events.isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        actionFilter ? (
          <div className="mt-8 rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No events match this filter.
          </div>
        ) : (
          <EmptyState
            icon={<ActivityIcon className="size-6" strokeWidth={1.5} />}
            title="Nothing yet"
            description="Agent activity will appear here as your team works."
          />
        )
      ) : (
        <ol className="mt-6 space-y-2">
          {filtered.map((e) => (
            <ActivityItem key={e.id} event={e} agent={e.agentId ? agentLookup.get(e.agentId) ?? null : null} />
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Activity feed row — design-kit row anatomy: colored leading dot that
 * encodes the event category, tinted action pill, agent name, optional
 * detail, DM Mono timestamp trailing.
 */
function ActivityItem({ event, agent }: { event: ActivityRow; agent: Agent | null }) {
  const detail = describeDetails(event.details);
  const tint = activityTint(event.action);
  return (
    <li
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 transition-[box-shadow,transform] duration-150"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 6px rgba(18,25,43,0.04)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: tint.dot }}
        />
        <span
          className="rounded-full px-2.5 py-0.5 whitespace-nowrap"
          style={{
            background: tint.bg,
            color: tint.fg,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {actionLabel(event.action)}
        </span>
        {agent && (
          <Link
            to={`/agents/${agent.id}`}
            className="transition-colors hover:text-[#7B52E8]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
            }}
          >
            {agent.name}
          </Link>
        )}
        {detail && (
          <span
            className="truncate"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--fg-body)",
            }}
          >
            {detail}
          </span>
        )}
      </div>
      <MonoLabel tone="muted">{formatRelativeTime(event.createdAt)}</MonoLabel>
    </li>
  );
}

/**
 * Same categorization as the Dashboard's activity feed so the two views
 * read as one system.
 */
function activityTint(action: string): { bg: string; fg: string; dot: string } {
  if (action.startsWith("agent.")) {
    return { bg: "#F0EBFF", fg: "#5B32C8", dot: "#7B52E8" };
  }
  if (action.startsWith("heartbeat.")) {
    if (action === "heartbeat.failed") {
      return { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" };
    }
    if (action === "heartbeat.completed") {
      return { bg: "#E6FAF8", fg: "#1A8A7D", dot: "#2BBFAD" };
    }
    return { bg: "#FEF9E7", fg: "#B8860B", dot: "#F6C94E" };
  }
  if (action.startsWith("hire_hook.")) {
    if (action === "hire_hook.succeeded") {
      return { bg: "#E6FAF8", fg: "#1A8A7D", dot: "#2BBFAD" };
    }
    return { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" };
  }
  return {
    bg: "var(--surface-subtle)",
    fg: "var(--fg-body)",
    dot: "var(--muted-foreground)",
  };
}

function describeDetails(details: Record<string, unknown> | null): string | null {
  if (!details || Object.keys(details).length === 0) return null;
  // Cherry-pick a few common fields; fall back to a compact JSON-ish summary.
  const name = (details as { name?: unknown }).name;
  if (typeof name === "string" && name.trim()) return name;
  const agentId = (details as { agentId?: unknown }).agentId;
  if (typeof agentId === "string") return `agent ${agentId.slice(0, 8)}…`;
  const reason = (details as { reason?: unknown }).reason;
  if (typeof reason === "string") return reason;
  const keys = Object.keys(details).slice(0, 3).join(", ");
  return keys || null;
}
