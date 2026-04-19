# Clipboard — Project Handoff

## What This Is

**Clipboard** is a custom mission-control UI for running multiple Claude Code agents, built on top of the open-source [Paperclip](https://github.com/paperclipai/paperclip) backend. Tiffany wanted a clean, simple dashboard to manage AI agents — Paperclip's backend is excellent (handles Claude CLI execution, session management, cost tracking, scheduling) but its original UI is too complex. So we replaced the UI entirely while keeping the backend untouched.

There is also a second project, **Paperclip Copy**, which is the original Paperclip UI running unmodified on port 3101 — kept for reference.

---

## Repo Locations

| Project | Path | Port | Instance ID |
|---------|------|------|-------------|
| Clipboard (our custom UI) | `~/Downloads/paperclip-claude/` | 3100 (backend) / 5173 (Vite dev) | `default` |
| Paperclip Copy (original UI) | `~/Downloads/paperclip-copy/` | 3101 | `paperclip-copy` |
| AIOS (Iris accountability system) | `~/Downloads/AIOS/` | — | n/a |

### How to start Clipboard
```bash
cd ~/Downloads/paperclip-claude && pnpm dev
# Open http://localhost:5173
```

### How to start Paperclip Copy
```bash
cd ~/Downloads/paperclip-copy && PORT=3101 PAPERCLIP_INSTANCE_ID=paperclip-copy pnpm dev
```

---

## Architecture

```
Browser (localhost:5173)
  └─ React + Vite + Tailwind (our custom UI)
       └─ fetch /api/* → proxied to localhost:3100
            └─ Paperclip Node server (unmodified)
                 ├─ Embedded PostgreSQL (~/.paperclip/instances/default/)
                 ├─ Heartbeat scheduler
                 └─ claude_local adapter → claude CLI → Claude subscription or API key
```

The UI calls Paperclip's existing REST API — we just show less and lay it out differently. The server, DB, and adapter layer are never touched.

---

## UI File Structure

```
ui/src/
  main.tsx                    React entry point (QueryClient, BrowserRouter)
  App.tsx                     Layout, 5-tab nav, routes
  lib/
    api.ts                    All fetch wrappers for Paperclip REST API
    types.ts                  TypeScript types + helper functions (runTokens, runBilling, etc.)
    format.ts                 formatTokens, formatUsd, formatDuration, formatRelativeTime
    company.ts                useDefaultCompany() — fetches/creates "Main" company silently
    templates.ts              10 built-in agent role templates (CEO, CTO, CMO, etc.)
    delegation.ts             syncDelegationContext() — auto-injects delegation instructions into manager agents
  pages/
    Agents.tsx                Agent grid, Add Agent button, pause/delete actions
    AgentDetail.tsx           Per-agent detail: send task, run history, edit, heartbeat schedule toggle
    OrgChart.tsx              Interactive org chart with drag-to-reparent and click-to-assign
    Tasks.tsx                 Global task send (all agents) + merged recent runs feed
    Activity.tsx              Audit log feed with friendly labels and action filter
    Spending.tsx              Token/cost breakdown per agent
  components/
    AddAgentDialog.tsx        Create agent modal: 10 templates, adapter selector, auth toggle
  reference-paperclip/        Original Paperclip UI archived here — DO NOT DELETE
scripts/
  delegate.py                 Agent-to-agent delegation script (used by agents themselves)
  delegation_audit.log        Auto-created when delegations are made
```

---

## The 5 Tabs

### Agents
- Grid of all agents with status badge, model, last-active, working directory
- Clicking a card opens AgentDetail
- Add Agent button opens dialog with 10 role templates + custom option
- Each card has Pause/Resume and Delete in the footer

### Org
- Visual org chart tree (CEO at top, branches down)
- **Drag any agent card onto another** to reassign who they report to (cycle prevention enforced)
- **Drop on background** to remove a manager (make root)
- **Click any card** → "Assign task" modal for that agent
- **Small arrow chips** inside manager cards → "Delegate task" modal (prepends delegation context to the prompt)
- On every load and on every drag-drop, `syncDelegationContext()` runs automatically, injecting each manager's direct reports and `delegate.py` instructions into their system prompt

### Tasks
- Global: pick any agent from dropdown + prompt + Send
- Below: merged recent-runs feed from ALL agents, sorted by date
- Each run row: status badge, agent name, summary, duration, tokens, cost label (shows "Subscription" or "$X.XX")

### Activity
- Audit log from Paperclip's `/companies/:id/activity` endpoint
- Friendly action labels (e.g. "heartbeat.completed" → "Task completed")
- Filter dropdown by action type

### Spending
- 4 summary cards: total tokens, total runs, API spend, active agents
- Per-agent table: input / cached / output tokens, subscription runs vs API runs, real $ if any

---

## AgentDetail Page (`/agents/:id`)

- Agent name, title, status badge, last-active
- **Edit button** → modal to update name, title, capabilities, persona, cwd
- **Pause / Resume / Delete**
- **Send a task** textarea (calls `POST /agents/:id/wakeup`)
- **Recent tasks** — run cards showing status, summary, tokens, cost; expandable for full output
- **Role** section — shows capabilities
- **Personality & style** — shows persona (if set)
- **Configuration** panel — model, cwd, adapter, created date
- **Autonomous schedule** toggle — enables Paperclip's heartbeat scheduler so the agent wakes on a timer without human input; interval options from 15 min to 24 hours

---

## Agent System Prompt Structure

Every agent created through Clipboard gets this `promptTemplate` in `adapterConfig`:

```handlebars
You are {{agent.name}}{{#agent.title}}, {{agent.title}}{{/agent.title}}.

ROLE
{{agent.capabilities}}

HOW YOU BEHAVE
{{agent.metadata.persona}}

{{#agent.metadata.delegationContext}}
{{agent.metadata.delegationContext}}

{{/agent.metadata.delegationContext}}
Follow the task instructions that follow.
```

- `agent.capabilities` — the role description set in the form
- `agent.metadata.persona` — the personality/style text
- `agent.metadata.delegationContext` — auto-generated by `syncDelegationContext()` whenever the org chart changes; contains the agent's direct reports list and `delegate.py` command

---

## Agent-to-Agent Delegation System

### The delegation script
`scripts/delegate.py` — agents can call this during a task run to dispatch work to their direct reports.

```bash
python3 /Users/tiffanychau/Downloads/paperclip-claude/scripts/delegate.py \
  --from "CEO" --to "CMO" --task "Write a product launch tweet thread"
```

**Guardrails enforced by the script:**
1. **Scope check** — `--from` must be a direct manager of `--to` (verified against live Paperclip API). Lateral and skip-level delegation is blocked.
2. **Loop guard** — tracks the delegation chain via `--chain`; refuses if the target is already in the chain
3. **Task cap** — max 5 delegations per manager per run (overridable via `DELEGATE_MAX_TASKS` env var)
4. **Paused block** — refuses to send to a paused agent
5. **Audit trail** — every successful delegation is appended to `scripts/delegation_audit.log`

Dry-run mode: add `--dry-run` to validate without sending.

### Auto-sync
`lib/delegation.ts` exports `syncDelegationContext(agents)`. It runs on:
- Every OrgChart page load
- After every drag-drop in the org chart

It reads the current `reportsTo` tree, generates delegation instructions for each manager, and PATCHes `metadata.delegationContext` — but only if the content actually changed (no-op writes avoided).

### Making agents proactive
To have an agent self-wake and delegate autonomously:
1. Open the agent's detail page
2. Flip the "Autonomous schedule" toggle ON
3. Pick an interval (e.g. every 1 hour)

The agent will wake on that schedule, read the injected delegation instructions, and dispatch tasks to its reports without human input.

---

## Current Agent Roster

All agents live in company `de3f0b6d-4be7-4d3c-8eb8-8e24a6b6da47` ("Iris").

| Name | Role | Status | Model | Reports To | CWD |
|------|------|--------|-------|-----------|-----|
| CEO | ceo | paused | claude-opus-4-7 | — | — |
| CTO | cto | pending_approval | claude-opus-4-7 | CEO | — |
| CMO | cmo | idle | claude-sonnet-4-6 | CEO | — |
| Iris | general | idle | claude-opus-4-7 | CMO | `~/Downloads/AIOS` |
| Echo | general | idle | claude-sonnet-4-6 | — | `~/Downloads/AIOS` |

**Notes:**
- CEO and CTO were created via the original Paperclip UI (test agents). CEO is paused. CTO is stuck in `pending_approval` — this happened because they were created via Paperclip's hire flow when `requireBoardApprovalForNewAgents` was true. That setting has since been turned off. CTO can be deleted and recreated via Clipboard if needed.
- Iris and Echo are the real AIOS agents; their `cwd` points to `~/Downloads/AIOS` so they run with full access to the AIOS skills, context, and scripts.
- Iris currently reports to CMO — this may need to be reorganized. Use the Org tab drag-and-drop to restructure.

---

## Key API Endpoints (Paperclip REST)

All prefixed with `http://localhost:3100/api`:

```
GET    /companies                                    list companies
POST   /companies                                    create company
GET    /companies/:id/agents                         list agents
POST   /companies/:id/agents                         create agent
GET    /agents/:id                                   get single agent
PATCH  /agents/:id                                   update agent (name, title, capabilities, metadata, reportsTo, status, runtimeConfig, adapterConfig)
DELETE /agents/:id                                   delete agent
POST   /agents/:id/wakeup                            send ad-hoc task (body: {source, reason, payload: {prompt}, forceFreshSession})
GET    /companies/:id/heartbeat-runs?agentId=X       list runs for agent
GET    /heartbeat-runs/:id                           single run with stdout/stderr
GET    /companies/:id/activity                       audit log
GET    /companies/:id/costs/summary                  {spendCents, budgetCents, utilizationPercent}
GET    /companies/:id/costs/by-agent                 per-agent token/cost breakdown
GET    /companies/:id/adapters/:type/models          list models for adapter type
```

---

## Add Agent Form — Supported Adapters

The form has an "AI engine" selector:
- **Claude** (`claude_local`) — uses `claude` CLI; subscription or API key auth
- **Gemini** (`gemini_local`) — uses `gemini` CLI; Google account or Gemini API key
- **OpenAI Codex** (`codex_local`) — uses `codex` CLI; needs OpenAI API key (ChatGPT Plus does NOT include API access)
- **OpenCode** (`opencode_local`) — open-source coding agent
- **Custom process** (`process`) — any shell command

The auth toggle and API key field update their labels to match the selected engine.

---

## Multi-Model / Multi-Machine Architecture Notes

For scaling beyond one machine:
- **Per-agent model selection**: assign cheaper models (Gemini, Sonnet, Ollama) to worker agents; reserve Opus for executive/decision-making agents
- **Subscription limits are per-account**, not per-machine — spreading agents across machines doesn't increase capacity under one subscription
- **`http` adapter pattern**: run a lightweight HTTP server on a remote machine that accepts a prompt and shells out to a local Claude/Gemini CLI; register it as an `http`-type agent in Clipboard
- **Free local models**: Ollama (runs Llama, Mistral, etc. locally, no subscription) can be wired via the `process` adapter for low-level tasks

---

## Known Issues / Pending Work

1. **CTO in `pending_approval`** — created via old Paperclip UI hire flow. Can't be activated via PATCH. Best path: delete and recreate via Clipboard's Add Agent dialog.
2. **CEO is paused** — test agent from early Paperclip exploration. Can be deleted; it has no important runs.
3. **Iris reports to CMO** — may not be the intended structure. Reorganize via Org tab.
4. **Echo has no manager** — floating root; should probably report to Iris or CEO depending on intended hierarchy.
5. **CTO/CMO/CEO have no `cwd` set** — they'll run in the Paperclip server's default directory. If they need filesystem access to a project, set `cwd` via the Edit button on their detail page.
6. **Existing agents (CEO/CTO/CMO) don't have the new `promptTemplate`** — they were created via Paperclip's hire flow and use Paperclip's managed instructions bundle instead. The `delegationContext` sync still writes to their `metadata` field, but won't render in their prompt unless their `promptTemplate` is also updated via a PATCH or Edit.

---

## What "Proactive Agents" Looks Like End-to-End

1. Open CEO's detail page → turn on "Autonomous schedule" → set to "Every 1 hour"
2. CEO wakes each hour; their injected prompt includes their direct reports and `delegate.py` commands
3. CEO decides CTO should review a PR → calls: `python3 /path/to/delegate.py --from "CEO" --to "CTO" --task "Review PR #42 for security issues"`
4. `delegate.py` validates the chain, calls `POST /agents/CTO-id/wakeup`, logs the delegation
5. CTO wakes, sees "Task delegated by CEO", executes, finishes
6. All activity visible in the Activity and Tasks tabs

---

## File to Read for Deeper Context

- `ui/src/lib/types.ts` — all TypeScript types and helper functions for run data
- `ui/src/lib/delegation.ts` — delegation context generator
- `scripts/delegate.py` — full delegation script with inline docs
- `packages/adapters/claude-local/src/server/execute.ts` — how Paperclip builds and sends prompts to Claude CLI
- `packages/shared/src/validators/agent.ts` — what fields can be PATCHed on an agent
