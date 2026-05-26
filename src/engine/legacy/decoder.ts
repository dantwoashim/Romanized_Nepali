import { assembleLegacyUnicode } from "./assembleUnicode";
import { detectLegacyProfile } from "./profileDetection";
import { getSemanticLegacyProfile, type LegacyProfileId } from "./profile";
import { tokenizeLegacy } from "./tokenizer";
import { verifyLegacyOutput } from "./verifier";
import type { LegacyDecodeResult } from "./types";

export interface DecodeLegacyOptions {
  profileId?: LegacyProfileId;
  profileConfidence?: number;
}

export function decodeLegacyWithAtoms(input: string, options: DecodeLegacyOptions = {}): LegacyDecodeResult {
  const profileId = options.profileId ?? "preeti";
  const detection = detectLegacyProfile(input, profileId);
  const profile = getSemanticLegacyProfile(profileId);
  const tokens = detection.selectedProfileId ? tokenizeLegacy(input, profile) : [];

  if (!detection.selectedProfileId) {
    const verification = verifyLegacyOutput(input, input, tokens, profile, { profileConfidence: detection.confidence });
    return {
      input,
      output: input,
      tokens,
      verification,
      diagnostics: [
        ...verification.errors,
        ...verification.warnings,
        {
          code: "LEGACY_PROFILE_NOT_SELECTED",
          message: detection.reason,
          severity: "warning",
          data: { candidates: detection.candidates }
        }
      ],
      trace: [{ name: "legacy-profile-detection", message: detection.reason, data: { confidence: detection.confidence } }]
    };
  }

  const assembled = assembleLegacyUnicode(tokens);
  const verification = verifyLegacyOutput(input, assembled.output, tokens, profile, { profileConfidence: options.profileConfidence ?? detection.confidence });
  return {
    input,
    output: assembled.output,
    tokens,
    verification,
    diagnostics: [
      ...assembled.diagnostics,
      ...verification.errors,
      ...verification.warnings
    ],
    trace: [
      { name: "legacy-profile-detection", message: detection.reason, data: { confidence: detection.confidence } },
      ...assembled.trace,
      {
        name: "legacy-verifier",
        message: `Verifier status: ${verification.status}.`,
        data: {
          coveragePercent: verification.coveragePercent,
          unknownSequences: verification.unknownSequences
        }
      }
    ]
  };
}
