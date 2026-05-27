import type { KeyboardMode, SuggestionSurface, TypingContext } from "./types";

export const DEFAULT_ROMANIZED_SURFACES: SuggestionSurface[] = [
  "romanized-to-unicode",
  "romanized-to-unicode-with-labels",
  "romanized-to-romanized"
];

export const DEFAULT_TRADITIONAL_SURFACES: SuggestionSurface[] = [
  "traditional-to-unicode",
  "traditional-to-traditional-proofread",
  "traditional-to-romanized-helper"
];

export function defaultTypingContext(mode: KeyboardMode = "romanized"): TypingContext {
  return {
    leftTextWindow: "",
    activeDomains: [],
    preserveEnglish: true,
    secureInput: false,
    mode,
    enabledSurfaces: mode === "traditional" ? DEFAULT_TRADITIONAL_SURFACES : DEFAULT_ROMANIZED_SURFACES,
    showRomanizedLabels: false,
    enableNextWordPrediction: true
  };
}

export function surfaceForMode(mode: KeyboardMode): SuggestionSurface {
  if (mode === "traditional") return "traditional-to-unicode";
  if (mode === "unicode-proofread") return "traditional-to-traditional-proofread";
  if (mode === "dictionary-lookup") return "romanized-to-unicode-with-labels";
  if (mode === "diagnostic") return "romanized-to-unicode-with-labels";
  return "romanized-to-unicode";
}

export function isSecureContext(context: TypingContext): boolean {
  return context.secureInput || context.fieldType === "password" || context.fieldType === "code";
}
