# Clipboard Context

**Clipboard** is a non-technical fork of Paperclip — an AI agent orchestration platform with pre-built company templates. It lets users create and manage autonomous agents without writing code.

## Core Architecture

- **Frontend:** React + TypeScript, Vite, React Router, React Query for data fetching and caching
- **Backend:** Node.js REST API at `/api`, Zod for validation, database with company/agent/approval records
- **Agent System:** Each agent has capabilities, skills, adapter config (model, environment), monthly budget, and a status lifecycle

## Agent Workflow

1. **Creation:** User fills out agent form → clicks "Create Agent"
2. **Approval Gate:** If company has `requireBoardApprovalForNewAgents: true`, agent goes to `pending_approval` status
3. **Approval List:** Admin reviews pending approvals on Agents page, clicks Approve/Reject
4. **Live State:** Once approved, agent moves to `idle` status and becomes operational

### Key Endpoints
- **POST `/api/companies/:id/agent-hires`** — Creates agent, returns approval object if required
- **GET `/api/companies/:id/approvals?status=pending`** — Lists pending approvals
- **POST `/api/approvals/:id/approve`** — Approves a pending hire

## Important Patterns

**React Query Cache Invalidation:**
- When approval happens, use `refetchType: "all"` to force immediate refresh of inactive queries
- Default `invalidateQueries` only refetches active queries — Dashboard banner stays stale if user navigates away before refetch completes
- Fix: Add `refetchType: "all"` in mutation's `onSuccess` callback

**Agent Status States:**
- `idle` — Ready to work
- `pending_approval` — Awaiting board approval
- `paused` — Manually paused by user
- `error` — Runtime error

**Budget Tracking:**
- Metered agents (pay-per-use) show budget bar; subscription agents hide it
- `budgetMonthlyCents`, `spentMonthlyCents` drive the UI

## Common Gotchas

1. **Direct creation fails with 409** if company requires approval — always use `/agent-hires`, not `/agents`
2. **Stale approval banners** on Dashboard after approve — requires `refetchType: "all"` in invalidation
3. **Skills sync** expects a Zod-validated payload; invalid skill IDs fail silently
4. **Memory endpoint** may not exist if agent has no memory file — check `exists: false` before rendering

## For New Work

- Check `.claude/skills/` for existing workflows before building new ones
- Validate all agent payloads against `createAgentSchema` in `packages/shared/src/validators/agent.ts`
- Board approval is not optional when `requireBoardApprovalForNewAgents` is set — the UI must route through `/agent-hires`
- Test with both approval-required and approval-not-required company settings
