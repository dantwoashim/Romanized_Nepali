import { applyProofread } from "../proofread";
import type { ProofreadHint as EngineProofreadHint } from "../proofread";
import type { ProofHint, TypingContext } from "./types";

export function getKeyboardProofHints(textWindow: string, context?: TypingContext): ProofHint[] {
  if (!textWindow.trim() || context?.secureInput || context?.fieldType === "password" || context?.fieldType === "code") return [];
  const result = applyProofread(textWindow, { autoFix: false });
  return result.hints.slice(0, 8).map(mapProofreadHint);
}

function mapProofreadHint(hint: EngineProofreadHint): ProofHint {
  return {
    range: hint.range,
    original: hint.input,
    suggestion: hint.suggestion,
    type: mapHintType(hint.kind),
    confidence: hint.confidence,
    action: hint.action === "auto-fix" ? "auto-suggest" : hint.confidence >= 0.85 ? "ask" : "hint-only",
    explanation: hint.explanation
  };
}

function mapHintType(kind: EngineProofreadHint["kind"]): ProofHint["type"] {
  if (kind === "normalization") return "normalization";
  if (kind === "postposition") return "postposition";
  if (kind === "halant") return "halanta";
  if (kind === "matra") return "matra";
  if (kind === "style") return "name-variant";
  return "spelling";
}
