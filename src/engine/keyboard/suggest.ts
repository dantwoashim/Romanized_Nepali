import { suggestWords } from "../../core/dictionary/suggestWords";
import type { Candidate, TypingContext } from "./types";

export function getKeyboardSuggestions(context: TypingContext): Candidate[] {
  if (context.secureInput || context.fieldType === "password" || context.fieldType === "code") return [];
  const lastToken = currentToken(context.leftTextWindow);
  if (!lastToken) return [];
  return suggestWords(lastToken, 8).map((suggestion, index): Candidate => ({
    id: `suggest-${index}-${suggestion.normalizedWord}`,
    text: suggestion.normalizedWord,
    label: suggestion.romanized,
    type: suggestion.domain === "government" || suggestion.domain === "office" ? "phrase" : "word",
    confidence: Math.max(0.55, Math.min(0.96, suggestion.score / 1200)),
    reason: [`${suggestion.domain} dictionary prefix`, suggestion.source],
    shortcut: String(index + 1)
  }));
}

function currentToken(input: string): string {
  return input.trim().split(/\s+/).at(-1) ?? "";
}
