// Builds and syncs delegation context into every manager agent's metadata.
// Called after org chart changes so managers always have up-to-date instructions.

import { api } from "./api";
import type { Agent } from "./types";

const DELEGATE_SCRIPT =
  "/Users/tiffanychau/Downloads/paperclip-claude/scripts/delegate.py";

function buildDelegationContext(manager: Agent, reports: Agent[]): string {
  if (reports.length === 0) return "";

  const reportList = reports
    .map((r) => {
      const roleHint = r.capabilities
        ? r.capabilities.split(/[.\n]/)[0].trim()
        : r.title ?? r.role;
      return `- **${r.name}**${r.title ? ` (${r.title})` : ""}: ${roleHint}`;
    })
    .join("\n");

  const examples = reports
    .slice(0, 2)
    .map(
      (r) =>
        `  python3 ${DELEGATE_SCRIPT} --from "${manager.name}" --to "${r.name}" --task "Describe the task here"`,
    )
    .join("\n");

  return `## YOUR DIRECT REPORTS

You can proactively delegate tasks to your direct reports when you identify work in their domain. Use the delegation script:

\`\`\`
python3 ${DELEGATE_SCRIPT} --from "${manager.name}" --to "<report name>" --task "<task prompt>"
\`\`\`

Your direct reports:
${reportList}

Examples:
${examples}

**Delegation guardrails (enforced by the script):**
- You may only delegate to YOUR direct reports listed above — not to peers or skip-level agents.
- Be specific: include context, expected output, and any constraints.
- You may delegate up to 5 tasks per run. Prioritise accordingly.
- Do not delegate tasks involving external communications (email, social posting) without confirming with the user first.
- Do not create delegation loops (e.g. asking a report to delegate back to you).

When you delegate, continue your own work — you do not need to wait for the report to finish.`;
}

export async function syncDelegationContext(agents: Agent[]): Promise<void> {
  const byId = new Map<string, Agent>();
  for (const a of agents) byId.set(a.id, a);

  const directReports = new Map<string, Agent[]>();
  for (const a of agents) {
    if (a.reportsTo && byId.has(a.reportsTo)) {
      const list = directReports.get(a.reportsTo) ?? [];
      list.push(a);
      directReports.set(a.reportsTo, list);
    }
  }

  const updates: Promise<unknown>[] = [];

  for (const manager of agents) {
    const reports = directReports.get(manager.id) ?? [];
    const context = buildDelegationContext(manager, reports);
    const currentContext = manager.metadata?.delegationContext ?? "";

    // Only PATCH if the context actually changed — avoid unnecessary writes.
    if (context === currentContext) continue;

    const patch = {
      metadata: {
        ...(manager.metadata ?? {}),
        delegationContext: context || null,
      },
    };

    updates.push(api.updateAgent(manager.id, patch));
  }

  await Promise.all(updates);
}
