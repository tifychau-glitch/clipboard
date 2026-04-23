/**
 * AppSidebar — the navy vertical navigation chrome.
 *
 * Port of `ui_kits/app/components.jsx` → Sidebar, adapted to our
 * react-router-dom setup and existing auth/session shape.
 *
 * Layout: logo lockup → company switcher → nav items → spacer → user card.
 * The user card replaces the old top-right sign-out button.
 */

import { NavLink } from "react-router-dom";
import {
  Activity,
  Banknote,
  BookOpen,
  Clipboard,
  LayoutDashboard,
  LogOut,
  Moon,
  Network,
  Settings,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LogoLockup } from "./LogoMark";
import { CompanySwitcher } from "./CompanySwitcher";
import { useTheme } from "./ThemeToggle";
import { useSignOut } from "../lib/auth";

export interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Optional colored accent dot (one of the brand accents). */
  accent?: "teal" | "violet" | "yellow";
  /** Optional count/badge next to the label (DM Mono). */
  count?: number | string;
}

/**
 * Canonical sidebar items. Order matches the design kit's mental model:
 * Dashboard → My agents → Deals → Tasks → Skills → Activity → Org →
 * Reports → Settings.
 *
 * Label changes vs. legacy Paperclip TABS:
 *   - "Agents"   → "My agents"
 *   - "Spending" → "Reports"
 */
export const SIDEBAR_NAV: readonly NavItemDef[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agents",    label: "My agents", icon: Clipboard },
  { to: "/tasks",     label: "Tasks",     icon: Zap },
  { to: "/skills",    label: "Skills",    icon: BookOpen },
  { to: "/activity",  label: "Activity",  icon: Activity },
  { to: "/org",       label: "Org",       icon: Network },
  { to: "/spending",  label: "Reports",   icon: Banknote },
  { to: "/settings",  label: "Settings",  icon: Settings },
] as const;

const ACCENT_COLOR: Record<NonNullable<NavItemDef["accent"]>, string> = {
  teal: "#2BBFAD",
  violet: "#7B52E8",
  yellow: "#F6C94E",
};

function initialsFrom(name: string | null | undefined, fallbackEmail: string | null | undefined): string {
  const base = name?.trim() || fallbackEmail?.trim() || "";
  if (!base) return "??";
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return base.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export interface AppSidebarProps {
  user: { name: string | null; email: string | null };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const signOut = useSignOut();
  const { isDark, toggle: toggleTheme } = useTheme();
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Signed in";
  const displaySub = user.email?.trim() || "clipboard · pro";
  const initials = initialsFrom(user.name, user.email);

  return (
    <aside
      className="flex flex-col flex-shrink-0 w-[232px] h-dvh sticky top-0"
      style={{
        background: "var(--color-clipboard-navy)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "22px 14px",
        gap: 2,
      }}
    >
      {/* Logo lockup */}
      <div style={{ padding: "0 6px 18px" }}>
        <LogoLockup variant="dark" size={28} />
      </div>

      {/* Company switcher. Keeps its light styling — reads as a card on navy. */}
      <div style={{ padding: "0 4px 14px" }}>
        <CompanySwitcher />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col" style={{ gap: 2 }}>
        {SIDEBAR_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group"
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 10px",
                  borderRadius: 8,
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  transition: "background 0.15s cubic-bezier(0.2,0.7,0.2,1)",
                }}
                className={isActive ? "" : "hover:!bg-[rgba(255,255,255,0.05)]"}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--font-display)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    letterSpacing: "-0.01em",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  }}
                >
                  <item.icon
                    size={16}
                    strokeWidth={1.75}
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    }}
                  />
                  {item.label}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {item.accent && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: ACCENT_COLOR[item.accent],
                      }}
                    />
                  )}
                  {item.count !== undefined && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer pushes the user card to the bottom */}
      <div style={{ flex: 1 }} />

      {/* User card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-clipboard-yellow)",
            color: "var(--color-clipboard-navy)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={displayName}
          >
            {displayName}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              color: "rgba(255,255,255,0.45)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={displaySub}
          >
            {displaySub}
          </div>
        </div>
        {/* Theme toggle — sidebar-colored so it reads on navy in either mode. */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={iconBtnStyle}
          className="hover:!text-white hover:!bg-[rgba(255,255,255,0.08)]"
        >
          {isDark ? (
            <Sun size={14} strokeWidth={1.75} />
          ) : (
            <Moon size={14} strokeWidth={1.75} />
          )}
        </button>
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          title="Sign out"
          aria-label="Sign out"
          style={{
            ...iconBtnStyle,
            cursor: signOut.isPending ? "default" : "pointer",
            opacity: signOut.isPending ? 0.5 : 1,
          }}
          className="hover:!text-white hover:!bg-[rgba(255,255,255,0.08)]"
        >
          <LogOut size={14} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}

const iconBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 6,
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.55)",
  cursor: "pointer",
  transition: "color 0.15s, background 0.15s",
};

export default AppSidebar;
