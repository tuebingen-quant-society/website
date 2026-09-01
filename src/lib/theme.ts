export const THEME_STORAGE_KEY = "tqs-theme";
export const THEME_CHANGE_EVENT = "tqs:themechange";

export const themePreferences = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export function parseThemePreference(value: string | null): ThemePreference {
  return (themePreferences as readonly string[]).includes(value ?? "")
    ? (value as ThemePreference)
    : "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  return preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;
}

/** Runs before hydration so the first painted frame already has the right palette. */
export const themeBootstrapScript = `(()=>{let p="system";try{const s=localStorage.getItem("${THEME_STORAGE_KEY}");if(s==="light"||s==="dark"||s==="system")p=s}catch{}const d=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;const r=document.documentElement;r.dataset.theme=d;r.dataset.themePreference=p;r.style.colorScheme=d})()`;
