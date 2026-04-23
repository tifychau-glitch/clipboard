/**
 * Clipboard form controls — Input, Textarea, Select.
 *
 * All share the same surface pattern: 10px radius, light border that
 * deepens on hover, and the violet 25% focus ring mandated by the brand
 * spec. DM Sans body font throughout; never the display font.
 */

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const fieldBase = [
  // Semantic tokens so fields sit correctly against both modes.
  "w-full rounded-[10px] border border-border bg-card",
  "font-[var(--font-sans)] text-[14px] text-foreground placeholder:text-muted-foreground",
  "px-3 py-2 leading-relaxed",
  "transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
  "hover:border-[color:var(--border-strong)]",
  "focus-visible:outline-none focus-visible:border-[#7B52E8] focus-visible:ring-[3px] focus-visible:ring-[#7B52E8]/25",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...rest }, ref) => (
    <input ref={ref} type={type} className={cn(fieldBase, className)} {...rest} />
  ),
);
Input.displayName = "Input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...rest }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(fieldBase, "resize-y min-h-[88px]", className)} {...rest} />
  ),
);
Textarea.displayName = "Textarea";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...rest }, ref) => (
    <select ref={ref} className={cn(fieldBase, "pr-8 cursor-pointer", className)} {...rest}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";
