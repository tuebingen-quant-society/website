import assert from "node:assert/strict";
import test from "node:test";
import { parseThemePreference, resolveTheme } from "./theme";

test("missing or invalid preferences fall back to system", () => {
  assert.equal(parseThemePreference(null), "system");
  assert.equal(parseThemePreference("sepia"), "system");
  assert.equal(parseThemePreference("light"), "light");
  assert.equal(parseThemePreference("dark"), "dark");
});

test("system follows the OS while explicit preferences stay fixed", () => {
  assert.equal(resolveTheme("system", true), "dark");
  assert.equal(resolveTheme("system", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});
