import preetiProfile from "../../../data/legacy-fonts/profiles/preeti.json";
import kantipurProfile from "../../../data/legacy-fonts/profiles/kantipur.json";
import sagarmathaProfile from "../../../data/legacy-fonts/profiles/sagarmatha.json";
import himaliProfile from "../../../data/legacy-fonts/profiles/himali.json";

export type LegacyProfileId = "preeti" | "kantipur" | "sagarmatha" | "himali";
export type LegacyProfileStatus = "supported" | "planned" | "blocked";

export interface DiagnosticFingerprint {
  /**
   * Ratio of high-signal single codepoints in known profile samples.
   * Keys are literal legacy codepoints or escaped sequence labels.
   */
  glyphRatios: Record<string, number>;
  /**
   * Ratio of high-signal multi-character sequences for this profile.
   */
  sequenceRatios: Record<string, number>;
  /**
   * Minimum and maximum expected coverage of profile-known tokens in plain text samples.
   */
  coverageRange: {
    min: number;
    max: number;
  };
  /**
   * Minimum score required for automatic profile selection.
   */
  minAutoSelectScore: number;
  /**
   * Profile-specific negative indicators that reduce confidence when present.
   */
  negativeSignals?: Record<string, number>;
  /**
   * Human-readable explanation of provisional signals.
   */
  notes?: string;
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
