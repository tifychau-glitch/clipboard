import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { api } from "../lib/api";
import { AGENT_TEMPLATES, EMPTY_TEMPLATE, type AgentTemplate } from "../lib/templates";

type Props = {
  companyId: string;
  onClose: () => void;
};

// Interpolates capabilities + persona into every prompt the adapter renders.
const PROMPT_TEMPLATE = `You are {{agent.name}}{{#agent.title}}, {{agent.title}}{{/agent.title}}.

ROLE
{{agent.capabilities}}

HOW YOU BEHAVE
{{agent.metadata.persona}}

{{#agent.metadata.delegationContext}}
{{agent.metadata.delegationContext}}

{{/agent.metadata.delegationContext}}
Follow the task instructions that follow.`;

export function AddAgentDialog({ companyId, onClose }: Props) {
  const qc = useQueryClient();
  const [template, setTemplate] = useState<AgentTemplate>(EMPTY_TEMPLATE);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [persona, setPersona] = useState("");
  const [cwd, setCwd] = useState("");
  const [adapterType, setAdapterType] = useState("claude_local");
  const [model, setModel] = useState("");
  const [authMode, setAuthMode] = useState<"subscription" | "api_key">("subscription");
  const [apiKey, setApiKey] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [instructionsFilePath, setInstructionsFilePath] = useState("");
  const [showPersona, setShowPersona] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const models = useQuery({
    queryKey: ["adapterModels", companyId, adapterType],
    queryFn: () => api.listAdapterModels(companyId, adapterType),
    staleTime: 60_000,
  });

  const applyTemplate = (t: AgentTemplate) => {
    setTemplate(t);
    // Only overwrite fields that are still default/empty so user edits aren't lost.
    if (!name) setName(t.name);
    if (!title) setTitle(t.title);
    if (!capabilities) setCapabilities(t.capabilities);
    if (!persona) setPersona(t.persona);
    if (!model) setModel(t.model);
  };

  const create = useMutation({
    mutationFn: async () => {
      const adapterConfig: Record<string, unknown> = {
        promptTemplate: PROMPT_TEMPLATE,
        dangerouslySkipPermissions: true,
      };
      if (cwd.trim()) adapterConfig.cwd = cwd.trim();
      if (model) adapterConfig.model = model;
      if (instructionsFilePath.trim()) {
        adapterConfig.instructionsFilePath = instructionsFilePath.trim();
      }
      if (authMode === "api_key" && apiKey.trim()) {
        // Map the API key to the right env var for each adapter type.
        const envKey = adapterType === "gemini_local" ? "GEMINI_API_KEY"
          : adapterType === "codex_local" ? "OPENAI_API_KEY"
          : "ANTHROPIC_API_KEY";
        adapterConfig.env = { [envKey]: apiKey.trim() };
      }
      return api.createAgent(companyId, {
        name: name.trim(),
        title: title.trim() || null,
        icon: template.icon || "bot",
        role: template.id === "custom" ? "general" : resolveRole(template.id),
        capabilities: capabilities.trim() || null,
        metadata: persona.trim() ? { persona: persona.trim() } : null,
        adapterType,
        adapterConfig,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : String(err)),
  });

  const canSubmit =
    name.trim().length > 0 &&
    capabilities.trim().length > 0 &&
    (authMode === "subscription" || apiKey.trim().length > 0) &&
    !create.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    create.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3">
          <h2 className="text-lg font-semibold">Add Agent</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-5 py-4">
          <div>
            <div className="mb-2 text-sm font-medium">Start from a template</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AGENT_TEMPLATES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={`rounded-md border px-3 py-2 text-left transition-colors ${
                    template.id === t.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {t.tagline}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTemplate(EMPTY_TEMPLATE)}
                className={`rounded-md border border-dashed px-3 py-2 text-left transition-colors ${
                  template.id === "custom"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                <div className="text-sm font-medium">Custom</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Start from scratch
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <Field label="Name" hint="What you'll call this agent.">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Iris, Research Bot"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Job title" hint="Short title shown on the card. Optional.">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chief of Staff"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field
              label="What this agent does"
              hint="The role — what they own, what they're responsible for."
            >
              <textarea
                required
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <div>
              <button
                type="button"
                onClick={() => setShowPersona((s) => !s)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showPersona ? "Hide" : "Show"} personality & style
              </button>
              {showPersona && (
                <div className="mt-2">
                  <Field
                    label="Personality & style"
                    hint="How they behave — tone, voice, defaults. Pre-filled from the template; edit freely."
                  >
                    <textarea
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      rows={8}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                </div>
              )}
            </div>

            <Field
              label="Working directory"
              hint="The folder this agent works out of. Leave blank to use the default."
            >
              <input
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
                placeholder="/Users/you/Projects/my-project"
                className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="AI engine" hint="Which CLI will run this agent's tasks.">
              <select
                value={adapterType}
                onChange={(e) => { setAdapterType(e.target.value); setModel(""); }}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="claude_local">Claude (claude CLI)</option>
                <option value="gemini_local">Gemini (gemini CLI)</option>
                <option value="codex_local">OpenAI Codex (codex CLI)</option>
                <option value="opencode_local">OpenCode (opencode CLI)</option>
                <option value="process">Custom process</option>
              </select>
            </Field>

            <Field label="Model">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">
                  {adapterType === "gemini_local" ? "Default (Gemini 2.5 Pro)"
                    : adapterType === "codex_local" ? "Default (GPT-4o)"
                    : "Default (Sonnet)"}
                </option>
                {models.data?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Authentication">
              <div className="flex gap-2">
                <AuthButton
                  active={authMode === "subscription"}
                  onClick={() => setAuthMode("subscription")}
                  label={adapterType === "gemini_local" ? "Google account" : adapterType === "codex_local" ? "OpenAI account" : "Claude subscription"}
                  sub={adapterType === "gemini_local" ? "Uses your local `gemini` login" : adapterType === "codex_local" ? "Uses your local `codex` login" : "Uses your local `claude` login"}
                />
                <AuthButton
                  active={authMode === "api_key"}
                  onClick={() => setAuthMode("api_key")}
                  label="API key"
                  sub="For burst parallelism"
                />
              </div>
            </Field>

            {authMode === "api_key" && (
              <Field
                label={
                  adapterType === "gemini_local" ? "Gemini API key"
                    : adapterType === "codex_local" ? "OpenAI API key"
                    : "Anthropic API key"
                }
                hint="Stored with the agent. Never logged."
              >
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    adapterType === "gemini_local" ? "AIza..."
                      : adapterType === "codex_local" ? "sk-..."
                      : "sk-ant-..."
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showAdvanced ? "Hide" : "Show"} advanced
            </button>

            {showAdvanced && (
              <Field
                label="Instructions file path (optional)"
                hint="If set, this file is injected as the system prompt in addition to the role and persona above."
              >
                <input
                  value={instructionsFilePath}
                  onChange={(e) => setInstructionsFilePath(e.target.value)}
                  placeholder="/Users/you/Projects/my-project/AGENTS.md"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function resolveRole(templateId: string): string {
  // Map our template ids onto Paperclip's AGENT_ROLES enum where possible.
  const valid = new Set(["ceo", "cto", "cmo", "cfo", "engineer", "designer", "pm", "researcher", "general"]);
  return valid.has(templateId) ? templateId : "general";
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}

function AuthButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-3 py-2 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-background hover:bg-accent"
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}
