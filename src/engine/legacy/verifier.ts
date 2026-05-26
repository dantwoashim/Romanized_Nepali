import type { EngineDiagnostic, ProtectedSpan } from "../types";
import { hasDanglingPrebaseMatra, hasDanglingVirama } from "./syllable";
import type { LegacyToken, LegacyVerificationResult, SemanticLegacyFontProfile } from "./types";

const LEGACY_RESIDUE = /[A-Za-z{}|<>`~\\]/;

export interface VerifyLegacyOptions {
  protectedSpans?: ProtectedSpan[];
  profileConfidence?: number;
}

export function verifyLegacyOutput(
  input: string,
  output: string,
  tokens: LegacyToken[],
  profile: SemanticLegacyFontProfile,
  options: VerifyLegacyOptions = {}
): LegacyVerificationResult {
  const errors: EngineDiagnostic[] = [];
  const warnings: EngineDiagnostic[] = [];
  const unknownSequences = tokens.filter((token) => token.kind === "unknown").map((token) => token.source);
  const mappedCount = tokens.filter((token) => token.kind !== "unknown" && token.kind !== "whitespace").length;
  const consideredCount = Math.max(1, tokens.filter((token) => token.kind !== "whitespace").length);
  const coveragePercent = mappedCount / consideredCount;

  if (profile.status !== "supported") {
    errors.push({
      code: "LEGACY_PROFILE_UNSUPPORTED",
      message: `${profile.displayName} is ${profile.status}; auto conversion is disabled.`,
      severity: "error",
      data: { profileId: profile.profileId }
    });
  }

  if (unknownSequences.length > 0) {
    errors.push({
      code: "LEGACY_UNKNOWN_SEQUENCES",
      message: "Legacy decoder found unmapped source tokens.",
      severity: "error",
      data: { unknownSequences: Array.from(new Set(unknownSequences)).slice(0, 20) }
    });
  }

  if (LEGACY_RESIDUE.test(output) && /[A-Za-z{}|<>`~\\]/.test(input)) {
    warnings.push({
      code: "LEGACY_ASCII_RESIDUE",
      message: "Converted output still contains ASCII that may be preserved English or unmapped legacy residue.",
      severity: "warning"
    });
  }

  if (hasDanglingPrebaseMatra(output)) {
    errors.push({
      code: "LEGACY_DANGLING_PREBASE_MATRA",
      message: "Output contains a dangling prebase ि matra.",
      severity: "error"
    });
  }

  if (hasDanglingVirama(output)) {
    warnings.push({
      code: "LEGACY_DANGLING_VIRAMA",
      message: "Output contains a virama that is not followed by a consonant; this may be valid final halanta or a source issue.",
      severity: "warning"
    });
  }

  if (/र्र्/.test(output)) {
    errors.push({
      code: "LEGACY_REPEATED_REPH_MARKER",
      message: "Output contains repeated reph markers; source is likely malformed or unsupported.",
      severity: "error"
    });
  }

  if (output !== output.normalize("NFC")) {
    errors.push({
      code: "LEGACY_NOT_NFC_NORMALIZED",
      message: "Legacy output is not NFC-normalized.",
      severity: "error"
    });
  }

  for (const span of options.protectedSpans ?? []) {
    if (!output.includes(span.original)) {
      errors.push({
        code: "LEGACY_PROTECTED_SPAN_MUTATION",
        message: `Protected span "${span.original}" was not restored byte-exactly.`,
        severity: "error",
        data: { spanId: span.id, kind: span.kind }
      });
    }
  }

  const profileConfidence = options.profileConfidence ?? coveragePercent;
  if (profileConfidence < profile.diagnosticFingerprint.minAutoSelectScore && coveragePercent < 0.95) {
    errors.push({
      code: "LEGACY_PROFILE_CONFIDENCE_LOW",
      message: "Profile confidence is below the auto-conversion threshold.",
      severity: "error",
      data: { profileConfidence, minAutoSelectScore: profile.diagnosticFingerprint.minAutoSelectScore }
    });
  }

  const status = errors.length > 0 ? "unsafe" : warnings.length > 0 ? "warning" : "clean";
  return {
    status,
    errors,
    warnings,
    unknownSequences: Array.from(new Set(unknownSequences)),
    coveragePercent: Number(coveragePercent.toFixed(4)),
    profileId: profile.profileId,
    profileVersion: profile.version,
    normalized: output === output.normalize("NFC")
  };
}
