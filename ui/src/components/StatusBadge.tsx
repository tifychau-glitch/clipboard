// Unified status badge. Handles both agent statuses (idle/running/paused/
// pending_approval/error) and run statuses (queued/running/succeeded/failed/
// cancelled), mapped to a single six-tone palette (gray / blue / amber /
// purple / red / green) so the visual language stays consistent everywhere.
//
// Pass `compact` for tight layouts (e.g. the OrgChart card) — renders just a
// small tinted dot instead of the full text pill.

export type StatusBadgeSize = "sm" | "md";

export type StatusBadgeProps = {
  status: string;
  /** Render a dot-only indicator instead of the full text pill. */
  compact?: boolean;
  size?: StatusBadgeSize;
  className?: string;
};

type Tone = "gray" | "blue" | "amber" | "purple" | "red" | "green";

type Mapping = { label: string; tone: Tone; pulse?: boolean };

// Agent statuses — spec-mandated mapping.
const AGENT_MAP: Record<string, Mapping> = {
  idle: { label: "Idle", tone: "gray" },
  active: { label: "Idle", tone: "gray" },
  running: { label: "Working", tone: "blue", pulse: true },
  paused: { label: "Paused", tone: "amber" },
  pending_approval: { label: "Pending approval", tone: "purple" },
  error: { label: "Error", tone: "red" },
};

// Run statuses — kept in the same component so badges in run rows share the
// exact same visual treatment (colors, geometry, animation) as agent badges.
const RUN_MAP: Record<string, Mapping> = {
  queued: { label: "Queued", tone: "gray" },
  running: { label: "Running", tone: "blue", pulse: true },
  succeeded: { label: "Succeeded", tone: "green" },
  failed: { label: "Failed", tone: "red" },
  cancelled: { label: "Cancelled", tone: "gray" },
};

function resolve(status: string): Mapping {
  const s = status.toLowerCase();
  return (
    AGENT_MAP[s] ??
    RUN_MAP[s] ?? { label: prettify(status), tone: "gray" }
  );
}

function prettify(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Brand-palette tones. Tone NAMES (blue/green/amber/purple/red) are kept
 * for back-compat with the AGENT_MAP / RUN_MAP tables above, but the
 * RESOLVED colors map to brand accents so every status badge in the app
 * speaks the Clipboard color language:
 *   blue/green → teal (live / success)
 *   amber      → yellow (attention)
 *   purple     → violet (agent intelligence)
 *   red        → destructive red (error / failed)
 *   gray       → muted (idle / neutral)
 */
const PILL_TONES: Record<Tone, { bg: string; fg: string }> = {
  // Gray uses semantic tokens so the idle pill reads correctly on both
  // light cards and navy cards in dark mode. The brand-accent tones stay
  // fixed — they carry meaning regardless of theme.
  gray:   { bg: "var(--muted)", fg: "var(--muted-foreground)" },
  blue:   { bg: "#E6FAF8", fg: "#1A8A7D" },
  amber:  { bg: "#FEF9E7", fg: "#B8860B" },
  purple: { bg: "#F0EBFF", fg: "#5B32C8" },
  red:    { bg: "#FEE2E2", fg: "#991B1B" },
  green:  { bg: "#E6FAF8", fg: "#1A8A7D" },
};

const DOT_COLORS: Record<Tone, string> = {
  gray:   "var(--muted-foreground)",
  blue:   "#2BBFAD",
  amber:  "#F6C94E",
  purple: "#7B52E8",
  red:    "#DC2626",
  green:  "#2BBFAD",
};

export function StatusBadge({
  status,
  compact = false,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const m = resolve(status);
  const pill = PILL_TONES[m.tone];
  const dotColor = DOT_COLORS[m.tone];

  if (compact) {
    return (
      <span
        className={`inline-block size-2 shrink-0 rounded-full ${
          m.pulse ? "clipboard-status-pulse" : ""
        } ${className}`}
        style={{ background: dotColor }}
        title={m.label}
        aria-label={m.label}
      />
    );
  }

  const padding = size === "md" ? "px-2.5 py-[3px]" : "px-2 py-[2px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap ${padding} ${
        m.pulse ? "clipboard-status-pulse" : ""
      } ${className}`}
      style={{
        background: pill.bg,
        color: pill.fg,
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {m.pulse && (
        <span
          className="size-1.5 rounded-full shrink-0"
          style={{ background: dotColor }}
          aria-hidden
        />
      )}
      {m.label}
    </span>
  );
}
