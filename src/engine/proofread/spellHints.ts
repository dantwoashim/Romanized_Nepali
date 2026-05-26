import { getSpellHints } from "../../core/dictionary/spellHints";
import type { ProofreadHint } from "./types";

export function localDictionaryProofreadHints(input: string, offset = 0): ProofreadHint[] {
  return getSpellHints(input, 6)
    .filter((hint) => hint.suggestions.length > 0)
    .map((hint, index): ProofreadHint => {
      const startInSegment = input.indexOf(hint.token);
      const start = offset + (startInSegment >= 0 ? startInSegment : 0);
      const suggestion = hint.suggestions[0].normalizedWord;
      return {
        id: `dictionary-hint-${offset}-${index}`,
        range: [start, start + hint.token.length],
        input: hint.token,
        suggestion,
        ruleId: "local-dictionary-nearest",
        kind: "spelling",
        confidence: 0.72,
        action: "hint-only",
        explanation: "Nearest local dictionary suggestion; not applied automatically."
      };
    });
}
