/**
 * Clipboard Button
 *
 * Five variants mapped to the brand's action hierarchy:
 *   - navy    : dark chrome CTAs (sidebar, cards on navy, secondary primary)
 *   - violet  : PRIMARY action on light surfaces ("+ New agent", "Run now")
 *   - yellow  : CTA on navy surfaces ("Read pulse", "Approve & send")
 *   - outline : low-emphasis action
 *   - ghost   : tertiary / inline link-button
 *
 * All variants use Bricolage Grotesque at weight 700 with tight tracking,
 * 10px radius (8px for small), and the brand's 150ms easing on hover.
 */

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

const buttonStyles = cva(
  [
    // base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-[var(--font-display)] font-bold tracking-[-0.01em]",
    "transition-[background,transform,box-shadow,opacity,border-color] duration-150 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#7B52E8]/25",
  ].join(" "),
  {
    variants: {
      variant: {
        // The three filled variants are brand moves — always the same
        // colors in both modes.
        navy:
          "bg-[#12192B] text-white hover:bg-[#1E2D4A] hover:-translate-y-px",
        violet:
          "bg-[#7B52E8] text-white hover:opacity-88 hover:-translate-y-px",
        yellow:
          "bg-[#F6C94E] text-[#12192B] hover:brightness-95 hover:-translate-y-px",
        // Outline and ghost need to breathe on whatever surface they sit on.
        outline:
          "bg-transparent text-foreground border border-border hover:border-[color:var(--foreground)] hover:bg-[color:var(--surface-subtle)]",
        ghost:
          "bg-transparent text-foreground hover:bg-[color:var(--surface-subtle)]",
      },
      size: {
        sm: "rounded-lg px-3.5 py-1.5 text-xs",
        md: "rounded-[10px] px-[22px] py-3 text-sm",
        lg: "rounded-[12px] px-7 py-[14px] text-[15px]",
        icon: "rounded-lg size-9",
      },
    },
    defaultVariants: {
      variant: "violet",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  /** Icon rendered before children. Size yourself (e.g. `size={14}`). */
  leftIcon?: ReactNode;
  /** Icon rendered after children. */
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, leftIcon, rightIcon, children, ...rest }, ref) => (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      className={cn(buttonStyles({ variant, size }), className)}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
);
Button.displayName = "Button";

export { buttonStyles };
