/**
 * Clipboard LogoMark
 *
 * Brand-compliant logo component. The icon mark is a clipboard outline
 * with three color-coded border segments (yellow, teal, violet) and a
 * navy checkmark inside.
 *
 * Variants:
 *   - "light"  : for white / surface backgrounds (default)
 *   - "dark"   : for navy / dark backgrounds (wordmark white if shown)
 *   - "mark"   : icon-only, sized for favicons and tight chrome
 *
 * Use together with the lowercase "clipboard" wordmark per brand guidelines.
 */

import type { SVGProps } from "react";

const BRAND = {
  navy: "#12192B",
  yellow: "#F6C94E",
  violet: "#7B52E8",
  teal: "#2BBFAD",
  white: "#FFFFFF",
} as const;

export type LogoMarkVariant = "light" | "dark" | "mark";

export interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number;
  variant?: LogoMarkVariant;
  /**
   * Screen-reader label. Default: "Clipboard logo".
   * Pass an empty string to mark the mark as decorative (aria-hidden).
   */
  title?: string;
}

export function LogoMark({
  size = 48,
  variant = "light",
  title = "Clipboard logo",
  ...props
}: LogoMarkProps) {
  const bodyFill = variant === "dark" ? "rgba(255,255,255,0.08)" : BRAND.white;
  const clipFill = variant === "dark" ? BRAND.white : BRAND.navy;
  const clipInner = variant === "dark" ? BRAND.navy : BRAND.white;
  const checkStroke = variant === "dark" ? BRAND.white : BRAND.navy;
  const decorative = title === "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      {...props}
    >
      {!decorative && <title>{title}</title>}

      {/* Clipboard body */}
      <rect x="6" y="10" width="36" height="33" rx="5" fill={bodyFill} />

      {/* Color-coded borders: yellow (left), teal (right), violet (bottom) */}
      <path
        d="M14 10 H24"
        stroke={BRAND.yellow}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M24 10 H34"
        stroke={BRAND.teal}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M6 14 V43"
        stroke={BRAND.yellow}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M42 14 V43"
        stroke={BRAND.teal}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M6 43 H42"
        stroke={BRAND.violet}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Clip handle */}
      <rect x="17" y="6" width="14" height="8" rx="4" fill={clipFill} />
      <rect x="20" y="8" width="8" height="4" rx="2" fill={clipInner} />

      {/* Checkmark: "handled, done, complete" */}
      <path
        d="M16 27 L21.5 33 L32 20"
        stroke={checkStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Full logo lockup: mark + lowercase wordmark.
 * Use in app chrome, headers, and marketing pages.
 */
export interface LogoLockupProps {
  size?: number;
  variant?: LogoMarkVariant;
  /** Hide the wordmark (icon only). */
  iconOnly?: boolean;
  className?: string;
}

export function LogoLockup({
  size = 32,
  variant = "light",
  iconOnly = false,
  className,
}: LogoLockupProps) {
  const wordColor = variant === "dark" ? BRAND.white : BRAND.navy;
  const gap = Math.max(8, Math.round(size * 0.3));
  // Wordmark is ~0.58x of the mark height (per design kit shared.jsx)
  const wordSize = Math.round(size * 0.58);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap}px`,
      }}
    >
      <LogoMark size={size} variant={variant} />
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: `${wordSize}px`,
            color: wordColor,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          clipboard
        </span>
      )}
    </span>
  );
}

export default LogoMark;
