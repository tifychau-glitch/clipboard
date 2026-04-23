/**
 * Clipboard Card
 *
 * The base container pattern used everywhere content lives: white surface,
 * 12px radius, 1px light border, soft brand-spec shadow, optional lift on
 * hover when the card is interactive.
 *
 * Sub-parts mirror shadcn's Card API for ergonomics:
 *   <Card><CardHeader>…</CardHeader><CardContent>…</CardContent></Card>
 */

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift on hover (translate + stronger shadow). Use for clickable rows. */
  interactive?: boolean;
  /** Padding preset. Defaults to "md" (20/22px). */
  padding?: "none" | "sm" | "md" | "lg";
}

const PAD = {
  none: "",
  sm:   "px-4 py-3",
  md:   "px-[22px] py-5",
  lg:   "px-7 py-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, padding = "md", style, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Semantic tokens so the card surface, border, and text all flip
        // with the theme. Shadow intensity is kept subtle in both modes.
        "bg-card text-card-foreground rounded-xl border border-border",
        PAD[padding],
        interactive &&
          "cursor-pointer transition-[box-shadow,transform,border-color] duration-150 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]",
        className,
      )}
      style={{
        boxShadow: "0 1px 6px rgba(18,25,43,0.06)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) e.currentTarget.style.boxShadow = "0 4px 14px rgba(18,25,43,0.10)";
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (interactive) e.currentTarget.style.boxShadow = "0 1px 6px rgba(18,25,43,0.06)";
        rest.onMouseLeave?.(e);
      }}
      {...rest}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between gap-3 mb-4", className)} {...rest} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-[var(--font-display)] font-bold text-[15px] tracking-[-0.02em] text-foreground",
        className,
      )}
      {...rest}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("", className)} {...rest} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("mt-5 flex items-center gap-2", className)} {...rest} />
  ),
);
CardFooter.displayName = "CardFooter";
