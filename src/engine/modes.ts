import type { EngineMode } from "./types";

export const ENGINE_MODES: EngineMode[] = [
  "auto",
  "romanized-strict",
  "romanized-mixed",
  "romanized-government",
  "romanized-legal",
  "romanized-education",
  "romanized-health",
  "romanized-name-heavy",
  "preeti-strict",
  "preeti-mixed",
  "legacy-profile",
  "unicode-passthrough",
  "proofread-only",
  "unknown-diagnostic"
];

export function isRomanizedMode(mode: EngineMode): boolean {
  return mode.startsWith("romanized-");
}

export function isPreetiMode(mode: EngineMode): boolean {
  return mode === "preeti-strict" || mode === "preeti-mixed" || mode === "legacy-profile";
}

export function isMixedMode(mode: EngineMode): boolean {
  return mode.endsWith("-mixed") || mode === "auto" || mode === "unknown-diagnostic" || mode === "proofread-only";
}
