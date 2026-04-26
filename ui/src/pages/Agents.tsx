import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Loader2, Pause, Play, Plus, Trash2, UserPlus } from "lucide-react";
import { api } from "../lib/api";
import { useDefaultCompany } from "../lib/company";
import { formatRelativeTime } from "../lib/format";
import { isCeoAgent, isMeteredAgent, type Agent } from "../lib/types";
import { AddAgentDialog } from "../components/AddAgentDialog";
import { EmptyState } from "../components/EmptyState";
import { AgentCardSkeleton } from "../components/Skeleton";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { MonoLabel } from "../components/ui/mono-label";
import { Pill } from "../components/ui/pill";

export function AgentsPage() {
  const company = useDefaultCompany();
  const [adding, setAdding] = useState(false);

  const agents = useQuery({
    queryKey: ["agents", company.data?.id],
    queryFn: () => api.listAgents(company.data!.id),
    enabled: !!company.data?.id,
    refetchInterval: 5_000,
  });

  const approvals = useQuery({
    queryKey: ["pendingApprovals", company.data?.id],
    queryFn: () => api.listPendingApprovals(company.data!.id),
    enabled: !!company.data?.id,
    refetchInterval: 10_000,
  });

  const pendingByAgentId = new Map<string, string>();
  for (const a of approvals.data ?? []) {
    if (a.type === "hire_agent" && typeof a.payload.agentId === "string") {
      pendingByAgentId.set(a.payload.agentId, a.id);
    }
  }

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

  return (
    <div>
      <div className="flex items-center justify-end mb-5">
        <Button
          variant="violet"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setAdding(true)}
        >
          New agent
        </Button>
      </div>

      {agents.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      ) : agents.data && agents.data.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="size-6" strokeWidth={1.5} />}
          title="No agents yet"
          description="Add your first agent to get started."
          action={{ label: "Add agent", onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.data
            ?.slice()
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                pendingApprovalId={pendingByAgentId.get(a.id) ?? null}
              />
            ))}
        </div>
      )}

      {adding && company.data && (
        <AddAgentDialog
          companyId={company.data.id}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function BudgetBar({ agent }: { agent: Agent }) {
  const budget = agent.budgetMonthlyCents;
  if (budget == null || budget === 0) return null;
  // Subscription agents don't accumulate costCents, so the bar would sit at
  // 0% forever and mislead the user. Hide it and let the AgentDetail page
  // explain the nuance.
  if (!isMeteredAgent(agent)) return null;
  const spent = agent.spentMonthlyCents ?? 0;
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const isAtLimit = pct >= 100;
  const isNear = pct >= 80 && !isAtLimit;
  // Brand palette: teal healthy → yellow approaching → red at-limit.
  const barColor = isAtLimit ? "#DC2626" : isNear ? "#F6C94E" : "#2BBFAD";

  return (
    <div className="mt-4">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-subtle)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {(isNear || isAtLimit) && (
        <div
          className="mt-1.5 flex items-center gap-1 text-xs"
          style={{
            color: isAtLimit ? "#991B1B" : "#B8860B",
            fontFamily: "var(--font-sans)",
          }}
        >
          <AlertTriangle className="size-3" />
          {isAtLimit ? "Budget reached" : "Approaching limit"}
        </div>
      )}
    </div>
  );
}

function AgentCard({
  agent,
  pendingApprovalId,
}: {
  agent: Agent;
  pendingApprovalId: string | null;
}) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["agents"], refetchType: "all" });
    qc.invalidateQueries({ queryKey: ["pendingApprovals"], refetchType: "all" });
  };

  const pause = useMutation({
    mutationFn: () => api.pauseAgent(agent.id),
    onSuccess: invalidate,
  });
  const resume = useMutation({
    mutationFn: () => api.resumeAgent(agent.id),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => api.deleteAgent(agent.id),
    onSuccess: invalidate,
  });
  const approve = useMutation({
    mutationFn: () => api.approveApproval(pendingApprovalId!),
    onSuccess: invalidate,
  });

  const model =
    (agent.adapterConfig?.model as string | undefined) ?? "default";
  const cwd = agent.adapterConfig?.cwd as string | undefined;
  const isPaused = agent.status === "paused";
  const isPendingApproval = agent.status === "pending_approval";
  const isCeo = isCeoAgent(agent);

  return (
    <Card interactive padding="none" className="overflow-hidden">
      <Link to={`/agents/${agent.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="truncate"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.02em",
                color: "var(--foreground)",
              }}
            >
              {agent.name}
            </div>
            {agent.title && (
              <div
                className="truncate mt-0.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                }}
              >
                {agent.title}
              </div>
            )}
            {isCeo && (
              <div
                className="mt-1"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                Receives tasks from owner
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {isCeo && <Pill color="violet" dot={false}>CEO</Pill>}
            <StatusBadge status={agent.status} />
          </div>
        </div>
        {agent.capabilities && (
          <p
            className="mt-3 line-clamp-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--fg-body)",
              lineHeight: 1.55,
            }}
          >
            {agent.capabilities}
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <MonoLabel>Model</MonoLabel>
            <dd
              className="mt-1 truncate"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--foreground)",
              }}
            >
              {model}
            </dd>
          </div>
          <div>
            <MonoLabel>Last active</MonoLabel>
            <dd
              className="mt-1"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--fg-body)",
              }}
            >
              {formatRelativeTime(agent.lastHeartbeatAt)}
            </dd>
          </div>
          {cwd && (
            <div className="col-span-2">
              <MonoLabel>Working directory</MonoLabel>
              <dd
                className="mt-1 truncate"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-body)",
                }}
              >
                {cwd.replace(/\/Users\/[^/]+/, "~")}
              </dd>
            </div>
          )}
        </dl>
        <BudgetBar agent={agent} />
      </Link>
      <div
        className="flex gap-2 px-5 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {isPendingApproval ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 !border-[#2BBFAD] !text-[#1A8A7D] hover:!bg-[#E6FAF8]"
            onClick={() => approve.mutate()}
            disabled={approve.isPending || !pendingApprovalId}
            leftIcon={
              approve.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )
            }
            title={
              !pendingApprovalId
                ? "No pending approval record found for this agent."
                : undefined
            }
          >
            Approve
          </Button>
        ) : isPaused ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => resume.mutate()}
            disabled={resume.isPending}
            leftIcon={<Play size={14} />}
          >
            Resume
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => pause.mutate()}
            disabled={pause.isPending}
            leftIcon={<Pause size={14} />}
          >
            Pause
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm(`Remove agent "${agent.name}"?`)) remove.mutate();
          }}
          disabled={remove.isPending}
          className="!text-[#DC2626] hover:!border-[#DC2626] hover:!bg-[#FEE2E2]"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
}
