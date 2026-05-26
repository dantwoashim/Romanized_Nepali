import type { ProofreadHint } from "./types";

const POSTPOSITION_PATTERN = /([\u0900-\u097F]+)\s+(को|का|की|ले|लाई|मा|बाट|सँग)(?=\s|$|[।,;:!?])/g;

export function postpositionHints(input: string, offset = 0): ProofreadHint[] {
  return Array.from(input.matchAll(POSTPOSITION_PATTERN)).map((match, index) => {
    const original = match[0];
    const suggestion = `${match[1]}${match[2]}`;
    const start = offset + (match.index ?? 0);
    return {
      id: `postposition-spacing-${offset}-${index}`,
      range: [start, start + original.length],
      input: original,
      suggestion,
      ruleId: "postposition-spacing",
      kind: "postposition",
      confidence: 0.97,
      action: "auto-fix",
      explanation: "Common Nepali postpositions attach to the preceding word in this normalization profile."
    };
  });
}
