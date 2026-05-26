import preetiProfile from "../../../data/legacy-fonts/profiles/preeti.json";
import kantipurProfile from "../../../data/legacy-fonts/profiles/kantipur.json";
import sagarmathaProfile from "../../../data/legacy-fonts/profiles/sagarmatha.json";
import himaliProfile from "../../../data/legacy-fonts/profiles/himali.json";

export type LegacyProfileId = "preeti" | "kantipur" | "sagarmatha" | "himali";
export type LegacyProfileStatus = "supported" | "planned" | "blocked";

export interface DiagnosticFingerprint {
  glyphRatios: {
    minMappedGlyphRatio: number;
    minLegacySymbolRatio: number;
  };
  sequenceRatios: {
    minCommonSequenceRatio: number;
  };
  coverageRange: [number, number];
  minAutoSelectScore: number;
}

export interface LegacyFontProfile {
  id: LegacyProfileId;
  label: string;
  status: LegacyProfileStatus;
  mapSource: string;
  license: string;
  diagnosticFingerprint: DiagnosticFingerprint;
}

export const LEGACY_FONT_PROFILES: Record<LegacyProfileId, LegacyFontProfile> = {
  preeti: preetiProfile as LegacyFontProfile,
  kantipur: kantipurProfile as LegacyFontProfile,
  sagarmatha: sagarmathaProfile as LegacyFontProfile,
  himali: himaliProfile as LegacyFontProfile
};

export function getLegacyProfile(id: LegacyProfileId): LegacyFontProfile {
  return LEGACY_FONT_PROFILES[id];
}

export function listLegacyProfiles(): LegacyFontProfile[] {
  return Object.values(LEGACY_FONT_PROFILES);
}
