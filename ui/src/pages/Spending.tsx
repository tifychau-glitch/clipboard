import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useDefaultCompany } from "../lib/company";
import { formatTokens, formatUsd } from "../lib/format";
import { isMeteredAgent, type Agent } from "../lib/types";
import { Card } from "../components/ui/card";
import { MonoLabel } from "../components/ui/mono-label";

export function SpendingPage() {
  const company = useDefaultCompany();
  const companyId = company.data?.id;

  const summary = useQuery({
    queryKey: ["costs", "summary", companyId],
    queryFn: () => api.costsSummary(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  const byAgent = useQuery({
    queryKey: ["costs", "byAgent", companyId],
    queryFn: () => api.costsByAgent(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  const agents = useQuery({
    queryKey: ["agents", companyId],
    queryFn: () => api.listAgents(companyId!),
    enabled: !!companyId,
    refetchInterval: 10_000,
  });

  // Map agentId → agent for budget lookup
  const agentMap = useMemo(() => {
    const m = new Map<string, Agent>();
    for (const a of agents.data ?? []) m.set(a.id, a);
    return m;
  }, [agents.data]);

  const totals = useMemo(() => {
    if (!byAgent.data) return null;
    let inputTokens = 0,
      cachedInputTokens = 0,
      outputTokens = 0,
      apiRunCount = 0,
      subscriptionRunCount = 0;
    for (const row of byAgent.data) {
      inputTokens += row.inputTokens;
      cachedInputTokens += row.cachedInputTokens;
      outputTokens += row.outputTokens;
      apiRunCount += row.apiRunCount;
      subscriptionRunCount += row.subscriptionRunCount;
    }
    return {
      inputTokens,
      cachedInputTokens,
      outputTokens,
      totalTokens: inputTokens + cachedInputTokens + outputTokens,
      runs: apiRunCount + subscriptionRunCount,
      apiRunCount,
      subscriptionRunCount,
    };
  }, [byAgent.data]);

  // Count agents paused because of budget exhaustion. Only metered agents
  // can be auto-paused by budget — subscription agents' costCents never
  // increments, so a paused subscription agent was paused for other reasons.
  const agentsAtLimit = useMemo(() => {
    return (agents.data ?? []).filter(
      (a) =>
        a.status === "paused" &&
        a.budgetMonthlyCents != null &&
        a.budgetMonthlyCents > 0 &&
        isMeteredAgent(a),
    ).length;
  }, [agents.data]);

  if (company.isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }

  const apiSpendUsd = (summary.data?.spendCents ?? 0) / 100;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Total tokens"
          value={formatTokens(totals?.totalTokens)}
          hint={`${formatTokens(totals?.outputTokens)} output`}
        />
        <Stat
          label="Total runs"
          value={String(totals?.runs ?? 0)}
          hint={`${totals?.subscriptionRunCount ?? 0} sub, ${totals?.apiRunCount ?? 0} API`}
        />
        <Stat
          label="API spend"
          value={formatUsd(apiSpendUsd)}
          hint={apiSpendUsd === 0 ? "All on subscription" : "From API-key agents"}
        />
        <Stat
          label="Agents at limit"
          value={String(agentsAtLimit)}
          hint={agentsAtLimit === 0 ? "All within budget" : "Auto-paused by budget"}
          alert={agentsAtLimit > 0}
        />
      </section>

      <section>
        <div className="mb-3">
          <MonoLabel spaced>Per agent · lifetime</MonoLabel>
        </div>
        {byAgent.isLoading ? (
          <div
            className="flex items-center gap-2"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)", fontSize: 13 }}
          >
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : !byAgent.data || byAgent.data.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{
              border: "1px dashed var(--border-strong)",
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
            }}
          >
            No agents yet.
          </div>
        ) : (
          <Card padding="none" className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <Th>Agent</Th>
                  <Th align="right">Runs</Th>
                  <Th align="right">Input</Th>
                  <Th align="right">Cached</Th>
                  <Th align="right">Output</Th>
                  <Th align="right">API spend</Th>
                  <Th align="right">Budget</Th>
                </tr>
              </thead>
              <tbody>
                {byAgent.data.map((row) => {
                  const subRuns = row.subscriptionRunCount;
                  const apiRuns = row.apiRunCount;
                  const agent = agentMap.get(row.agentId);
                  const metered = agent ? isMeteredAgent(agent) : false;
                  const budget = agent?.budgetMonthlyCents ?? null;
                  const spent = agent?.spentMonthlyCents ?? 0;
                  const pct =
                    budget && metered
                      ? Math.min(100, Math.round((spent / budget) * 100))
                      : null;
                  const budgetStyle: React.CSSProperties =
                    pct == null
                      ? { color: "var(--muted-foreground)" }
                      : pct >= 100
                      ? { color: "#991B1B", fontWeight: 500 }
                      : pct >= 80
                      ? { color: "#B8860B", fontWeight: 500 }
                      : { color: "var(--fg-body)" };

                  return (
                    <tr
                      key={row.agentId}
                      style={{ borderBottom: "1px solid var(--border)" }}
                      className="last:!border-0"
                    >
                      <Td>
                        <Link
                          to={`/agents/${row.agentId}`}
                          className="transition-colors hover:text-[#7B52E8]"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: "-0.01em",
                            color: "var(--foreground)",
                          }}
                        >
                          {row.agentName}
                        </Link>
                        <div
                          className="mt-0.5"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 11,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {row.agentStatus}
                        </div>
                      </Td>
                      <Td align="right">
                        <div>{subRuns + apiRuns}</div>
                        {(subRuns > 0 || apiRuns > 0) && (
                          <div className="text-xs text-muted-foreground">
                            {subRuns} sub · {apiRuns} API
                          </div>
                        )}
                      </Td>
                      <Td align="right" mono>{formatTokens(row.inputTokens)}</Td>
                      <Td align="right" mono>{formatTokens(row.cachedInputTokens)}</Td>
                      <Td align="right" mono>{formatTokens(row.outputTokens)}</Td>
                      <Td align="right" mono>
                        {formatUsd(row.costCents / 100)}
                      </Td>
                      <Td align="right">
                        {!metered ? (
                          <span
                            style={{ color: "var(--muted-foreground)" }}
                            title="Subscription agents don't incur per-dollar cost. Budget is inactive."
                          >
                            Subscription
                          </span>
                        ) : budget == null ? (
                          <span style={{ color: "var(--muted-foreground)" }}>No limit</span>
                        ) : (
                          <span style={budgetStyle}>
                            {formatUsd(spent / 100)} / {formatUsd(budget / 100)}
                          </span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}

/**
 * KPI tile — same visual pattern as the Dashboard KPI. Bricolage 800
 * accent-colored number, DM Mono eyebrow, DM Sans hint below.
 * `alert` flips the accent to destructive red.
 */
function Stat({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  const accent = alert ? "#DC2626" : "var(--foreground)";
  return (
    <Card padding="none" className="px-5 py-4">
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 28,
          color: accent,
          letterSpacing: "-0.025em",
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
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`px-4 py-3 whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 500,
        color: "var(--muted-foreground)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  mono,
}: {
  children: React.ReactNode;
  align?: "right";
  mono?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`}
      style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: 13,
        color: "var(--foreground)",
      }}
    >
      {children}
    </td>
  );
}
