// Thin fetch wrappers around Paperclip's REST API.
// The Node server runs at /api on the same origin (Vite proxies /api -> :3100 in dev).

import type {
  ActivityRow,
  AdapterInfo,
  AdapterModel,
  Agent,
  Company,
  CostsByAgentRow,
  CostsSummary,
  HeartbeatRun,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ?? JSON.stringify(body);
    } catch {
      detail = res.statusText;
    }
    throw new Error(`${res.status} ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // Adapters
  listAdapters: () => request<AdapterInfo[]>("/adapters"),
  listAdapterModels: (companyId: string, type: string) =>
    request<AdapterModel[]>(
      `/companies/${companyId}/adapters/${type}/models`,
    ).catch(() => [] as AdapterModel[]),

  // Companies
  listCompanies: () => request<Company[]>("/companies"),
  createCompany: (body: { name: string; description?: string }) =>
    request<Company>("/companies", { method: "POST", body: JSON.stringify(body) }),

  // Agents
  listAgents: (companyId: string) =>
    request<Agent[]>(`/companies/${companyId}/agents`),
  createAgent: (companyId: string, body: Record<string, unknown>) =>
    request<Agent>(`/companies/${companyId}/agents`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getAgent: (agentId: string) => request<Agent>(`/agents/${agentId}`),
  updateAgent: (agentId: string, patch: Record<string, unknown>) =>
    request<Agent>(`/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteAgent: (agentId: string) =>
    request<{ ok: boolean }>(`/agents/${agentId}`, { method: "DELETE" }),
  pauseAgent: (agentId: string, reason?: string) =>
    request<Agent>(`/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paused", pauseReason: reason ?? null }),
    }),
  resumeAgent: (agentId: string) =>
    request<Agent>(`/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "active", pauseReason: null }),
    }),

  // Heartbeats / runs (ad-hoc tasks)
  wakeupAgent: (
    agentId: string,
    body: {
      reason?: string;
      payload?: Record<string, unknown>;
      forceFreshSession?: boolean;
      source?: "on_demand";
    },
  ) =>
    request<{ id: string; status: string }>(`/agents/${agentId}/wakeup`, {
      method: "POST",
      body: JSON.stringify({ source: "on_demand", ...body }),
    }),
  listRuns: (companyId: string, agentId?: string) => {
    const qs = agentId ? `?agentId=${encodeURIComponent(agentId)}` : "";
    return request<HeartbeatRun[]>(`/companies/${companyId}/heartbeat-runs${qs}`);
  },
  getRun: (runId: string) =>
    request<HeartbeatRun & { stdout?: string; stderr?: string; resultJson?: unknown }>(
      `/heartbeat-runs/${runId}`,
    ),

  // Costs
  costsSummary: (companyId: string) =>
    request<CostsSummary>(`/companies/${companyId}/costs/summary`),
  costsByAgent: (companyId: string) =>
    request<CostsByAgentRow[]>(`/companies/${companyId}/costs/by-agent`),

  // Activity (audit log of system events)
  activity: (companyId: string) =>
    request<ActivityRow[]>(`/companies/${companyId}/activity`),
};
