/**
 * Clipboard Pill
 *
 * Soft-tint + accent-dot pattern from the design kit's shared.jsx.
 * One color per pill — never stack all three accents in one component.
 *
 * Color meaning (per brand book):
 *   - teal    : live / active / success / running
 *   - violet  : agents / automation / pending approval
 *   - yellow  : contracts / attention / paused
 *   - muted   : idle / neutral / "not applicable"
 *   - navy    : on-dark surfaces, emphasized meta
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type PillColor = "teal" | "violet" | "yellow" | "muted" | "navy";

/**
 * The three brand accents (teal / violet / yellow) keep their meaning
 * across modes so they're hardcoded. `muted` uses semantic tokens so a
 * neutral pill reads correctly on navy in dark mode. `navy` always
 * sits on navy regardless of mode (for sidebar-embedded pills).
 */
const COLOR_MAP: Record<PillColor, { bg: string; fg: string; dot: string }> = {
  teal:   { bg: "#E6FAF8", fg: "#1A8A7D", dot: "#2BBFAD" },
  violet: { bg: "#F0EBFF", fg: "#5B32C8", dot: "#7B52E8" },
  yellow: { bg: "#FEF9E7", fg: "#B8860B", dot: "#F6C94E" },
  muted:  {
    bg: "var(--muted)",
    fg: "var(--muted-foreground)",
    dot: "var(--muted-foreground)",
  },
  navy:   { bg: "#12192B", fg: "#FFFFFF", dot: "#F6C94E" },
};

export interface PillProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  color?: PillColor;
  /** Show the leading colored dot. Default true. */
  dot?: boolean;
  children: ReactNode;
}

export const Pill = forwardRef<HTMLSpanElement, PillProps>(
  ({ color = "muted", dot = true, children, className, style, ...rest }, ref) => {
    const c = COLOR_MAP[color];
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap",
          "font-[var(--font-sans)] text-[11px] font-medium",
          dot ? "pl-2 pr-2.5 py-[3px]" : "px-2.5 py-[3px]",
          className,
        )}
        style={{ background: c.bg, color: c.fg, ...style }}
        {...rest}
      >
        {dot && (
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: c.dot,
              flexShrink: 0,
            }}
          />
        )}
        {children}
      </span>
    );
  },
);
Pill.displayName = "Pill";
