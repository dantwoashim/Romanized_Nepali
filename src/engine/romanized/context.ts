import type { EngineMode } from "../types";

export interface RomanizedContext {
  mode: EngineMode;
  domains: string[];
  preserveEnglish: boolean;
  nameHeavy: boolean;
}

export function inferRomanizedContext(mode: EngineMode): RomanizedContext {
  const domains = new Set<string>();
  if (mode === "romanized-government") domains.add("government");
  if (mode === "romanized-legal") domains.add("legal");
  if (mode === "romanized-education") domains.add("education");
  if (mode === "romanized-health") domains.add("health");
  if (mode === "romanized-name-heavy") domains.add("names");

  return {
    mode,
    domains: [...domains],
    preserveEnglish: mode !== "romanized-strict",
    nameHeavy: mode === "romanized-name-heavy"
  };
}
