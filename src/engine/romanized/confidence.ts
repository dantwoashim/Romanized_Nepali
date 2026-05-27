import type { Candidate, EngineMode, EngineWarning, ProtectedSpan } from "../types";
import type { RomanizedConfidenceResult } from "./types";

export function assessRomanizedConfidence(input: {
  sourceInput: string;
  output: string;
  mode: EngineMode;
  alternatives: Candidate[];
  protectedSpans?: ProtectedSpan[];
}): RomanizedConfidenceResult {
  const warnings: EngineWarning[] = [];
  const reasons: string[] = [];
  let confidence = input.alternatives[0]?.confidence ?? 0.72;
  let status: RomanizedConfidenceResult["status"] = "auto";
  const normalizedSource = input.sourceInput.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

  if (input.protectedSpans?.length) {
    reasons.push(`protected-spans:${input.protectedSpans.length}`);
  }

  if (hasSuspiciousLatinResidue(input.output, input.protectedSpans ?? [])) {
    confidence = Math.min(confidence, 0.58);
    status = input.mode === "romanized-strict" ? "ambiguous" : "preserve";
    warnings.push({
      code: "ROMANIZED_LATIN_RESIDUE",
      message: "Output still contains Latin text outside protected spans; conversion is not treated as fully confident.",
      severity: "warning"
    });
    reasons.push("latin-residue");
  }

  if (input.alternatives.length >= 2) {
    const gap = input.alternatives[0].score.total - input.alternatives[1].score.total;
    if (gap < 80) {
      confidence = Math.min(confidence, 0.74);
      status = status === "auto" ? "ambiguous" : status;
      warnings.push({
        code: "ROMANIZED_LOW_RANK_GAP",
        message: "Top Romanized candidates are close; expose alternatives instead of treating the output as definitive.",
        severity: "info"
      });
      reasons.push(`rank-gap:${gap}`);
    }
  }

  if (isCollisionHeavyInput(normalizedSource) && input.alternatives.length >= 2) {
    confidence = Math.min(confidence, 0.7);
    status = "ambiguous";
    warnings.push({
      code: "ROMANIZED_ALIAS_COLLISION",
      message: "This Romanized input has multiple plausible Nepali outputs; show candidates instead of treating the first output as definitive.",
      severity: "warning"
    });
    reasons.push("alias-collision-policy");
  }

  if (input.mode === "romanized-strict" && /^[A-Za-z0-9\s.,:;'"!?()-]+$/.test(input.sourceInput) && input.alternatives.length === 0) {
    confidence = Math.min(confidence, 0.42);
    status = "ambiguous";
    warnings.push({
      code: "ROMANIZED_NO_CANDIDATES",
      message: "No ranked candidates were available for this Romanized input.",
      severity: "warning"
    });
    reasons.push("no-candidates");
  }

  return { confidence, status, warnings, reasons };
}

function isCollisionHeavyInput(input: string): boolean {
  return new Set(["sita", "ram", "sharma", "neupane"]).has(input);
}

function hasSuspiciousLatinResidue(output: string, protectedSpans: ProtectedSpan[]): boolean {
  const stripped = protectedSpans.reduce((text, span) => text.replace(span.original, ""), output);
  return /[A-Za-z]{3,}/.test(stripped);
}
