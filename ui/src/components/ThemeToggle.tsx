/**
 * Theme toggle plumbing.
 *
 * `useTheme()` is the reusable hook: returns the current theme and a
 * toggle function. Anywhere in the app can render its own button and
 * style it to match the local surface (chrome vs. sidebar vs. wherever).
 *
 * The boot script in index.html handles initial render from localStorage;
 * this hook only drives user-initiated flips at runtime.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "paperclip.theme";
const DARK_COLOR = "#12192b";
const LIGHT_COLOR = "#f5f6fa";

export type Theme = "light" | "dark";

function readCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? DARK_COLOR : LIGHT_COLOR);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private-mode / quota errors are survivable.
  }
}

export function useTheme(): { theme: Theme; toggle: () => void; isDark: boolean } {
  const [theme, setTheme] = useState<Theme>(() => readCurrentTheme());

  // Sync state if another tab or devtools flips the class.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = readCurrentTheme();
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggle: () => {
      setTheme((prev) => {
        const next: Theme = prev === "dark" ? "light" : "dark";
        applyTheme(next);
        return next;
      });
    },
  };
}
