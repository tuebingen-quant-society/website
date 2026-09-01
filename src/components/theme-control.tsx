"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n";
import {
  parseThemePreference,
  resolveTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  themePreferences,
  type ThemePreference,
} from "@/lib/theme";

const labels = {
  de: {
    aria: "Farbschema",
    system: "System",
    light: "Hell",
    dark: "Dunkel",
  },
  en: {
    aria: "Color scheme",
    system: "System",
    light: "Light",
    dark: "Dark",
  },
} as const;

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (preference === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8a8.5 8.5 0 1 0 11.4 11.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = resolveTheme(preference, systemPrefersDark);
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
}

export function ThemeControl({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [initialized, setInitialized] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = parseThemePreference(document.documentElement.dataset.themePreference ?? null);
    setPreference(stored);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    applyTheme(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Storage can be unavailable in locked-down browsers; the session still works.
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (preference === "system") applyTheme("system");
    };
    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, [initialized, preference]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const select = (next: ThemePreference) => {
    setPreference(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="header__theme" ref={rootRef}>
      <button
        className="header__theme-trigger"
        type="button"
        aria-label={`${copy.aria}: ${copy[preference]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`${copy.aria}: ${copy[preference]}`}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
      >
        <ThemeIcon preference={preference} />
      </button>

      {open && (
        <div className="header__theme-menu" role="menu" aria-label={copy.aria}>
          {themePreferences.map((option) => (
            <button
              className="header__theme-option"
              type="button"
              role="menuitemradio"
              aria-checked={option === preference}
              onClick={() => select(option)}
              key={option}
            >
              <span className="header__theme-icon"><ThemeIcon preference={option} /></span>
              <span>{copy[option]}</span>
              <span className="header__theme-check" aria-hidden="true">
                {option === preference ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
