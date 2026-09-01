"use client";

import { useEffect, useState } from "react";
import { THEME_CHANGE_EVENT } from "@/lib/theme";

/** Re-runs canvas setup after CSS theme tokens change. */
export function useThemeChange(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((current) => current + 1);
    window.addEventListener(THEME_CHANGE_EVENT, update);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, update);
  }, []);

  return version;
}
