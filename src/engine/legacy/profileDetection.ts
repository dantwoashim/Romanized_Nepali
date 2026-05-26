import { diagnoseLegacyInput, type LegacyProfileDiagnostic } from "./diagnostics";
import { getSemanticLegacyProfile, type LegacyProfileId } from "./profile";

export interface LegacyProfileDetectionResult {
  candidates: LegacyProfileDiagnostic[];
  selectedProfileId?: LegacyProfileId;
  confidence: number;
  reason: string;
}

export function detectLegacyProfile(input: string, requestedProfile: LegacyProfileId = "preeti"): LegacyProfileDetectionResult {
  const requested = diagnoseLegacyInput(input, requestedProfile);
  const semantic = getSemanticLegacyProfile(requestedProfile);
  if (semantic.status !== "supported") {
    return {
      candidates: [requested],
      selectedProfileId: undefined,
      confidence: 0,
      reason: `${semantic.displayName} is ${semantic.status}; diagnostic-only handling required.`
    };
  }

  if (requested.supported) {
    return {
      candidates: [requested],
      selectedProfileId: requestedProfile,
      confidence: requested.profileConfidence,
      reason: "Known profile coverage and sequence signals met the auto-selection threshold."
    };
  }

  return {
    candidates: [requested],
    selectedProfileId: undefined,
    confidence: requested.profileConfidence,
    reason: "Profile confidence below threshold; preserve/warn instead of silent conversion."
  };
}
