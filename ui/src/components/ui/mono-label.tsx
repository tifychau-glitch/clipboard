/**
 * MonoLabel — DM Mono uppercase eyebrow used for metadata, section tags,
 * status readouts, and "LIVE" / "IN PROGRESS" indicators.
 *
 * Usage:
 *   <MonoLabel>Your org</MonoLabel>
 *   <MonoLabel tone="accent">Live</MonoLabel>
 *
 * Rules from the brand guide:
 *   - Always UPPERCASE (auto-applied here)
 *   - Letter spacing 0.12em (0.15em for larger contexts, use `spaced`)
 *   - Size 10–11px (larger breaks hierarchy)
 *   - Never for headlines or paragraph copy
 */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export type MonoLabelTone = "muted" | "ink" | "teal" | "violet" | "yellow" | "on-navy";

/**
 * `muted` and `ink` map to semantic tokens so they flip with the theme.
 * The three brand-accent tones carry meaning (teal = active, violet =
 * agent, yellow = attention) so they stay fixed across modes.
 * `on-navy` is for labels that sit on a navy surface in both modes
 * (e.g. sidebar metadata).
 */
const TONE: Record<MonoLabelTone, string> = {
  muted:     "text-[var(--muted-foreground)]",
  ink:       "text-[var(--foreground)]",
  teal:      "text-[#1A8A7D]",
  violet:    "text-[#5B32C8]",
  yellow:    "text-[#B8860B]",
  "on-navy": "text-white/50",
};

export interface MonoLabelProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: MonoLabelTone;
  /** Use a wider 0.15em tracking for emphasis. */
  spaced?: boolean;
  /** Render slightly larger (11px instead of 10px). */
  lg?: boolean;
}

export const MonoLabel = forwardRef<HTMLSpanElement, MonoLabelProps>(
  ({ tone = "muted", spaced = false, lg = false, className, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-[var(--font-mono)] font-medium uppercase",
        lg ? "text-[11px]" : "text-[10px]",
        TONE[tone],
        className,
      )}
      style={{ letterSpacing: spaced ? "0.15em" : "0.12em" }}
      {...rest}
    />
  ),
);
MonoLabel.displayName = "MonoLabel";
