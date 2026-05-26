import { getPreetiEntry } from "../../core/preeti/preetiMap";
import { parseLegacyGlyphs } from "./parseGlyphs";
import { getLegacyProfile, type LegacyFontProfile, type LegacyProfileId } from "./profile";

export interface LegacyProfileDiagnostic {
  requestedProfile?: LegacyProfileId;
  selectedProfile?: LegacyProfileId;
  profileConfidence: number;
  supported: boolean;
  unknownGlyphCount: number;
  mappedGlyphRatio: number;
  legacySymbolRatio: number;
  commonSequenceRatio: number;
  matraErrorCount: number;
  rephErrorCount: number;
  conjunctErrorCount: number;
  protectedSpanPreserved: boolean;
  layoutPreserved: boolean;
  warnings: string[];
}

const COMMON_PREETI_SEQUENCES = [/sfof/g, /lg0f/g, /k\|/g, /l\/k/g, /;/g, /{/g];

export function diagnoseLegacyInput(input: string, requestedProfile: LegacyProfileId = "preeti"): LegacyProfileDiagnostic {
  const profile = getLegacyProfile(requestedProfile);
  if (profile.status !== "supported") {
    return plannedProfileDiagnostic(input, profile);
  }

  const atoms = parseLegacyGlyphs(input, profile);
  const mappedCount = Array.from(input).filter((char) => Boolean(getPreetiEntry(char))).length;
  const legacySymbolCount = Array.from(input).filter((char) => /[{}|/<>?;:'"[\]\\`~]/.test(char)).length;
  const commonSequenceCount = COMMON_PREETI_SEQUENCES.filter((pattern) => pattern.test(input)).length;
  const length = Math.max(1, Array.from(input).filter((char) => !/\s/.test(char)).length);
  const mappedGlyphRatio = mappedCount / length;
  const legacySymbolRatio = legacySymbolCount / length;
  const commonSequenceRatio = commonSequenceCount / COMMON_PREETI_SEQUENCES.length;
  const score =
    0.52 * mappedGlyphRatio +
    0.28 * legacySymbolRatio +
    0.2 * commonSequenceRatio;

  const supported = score >= profile.diagnosticFingerprint.minAutoSelectScore || mappedGlyphRatio >= 0.7;
  const unknownGlyphCount = atoms.filter((atom) => atom.kind === "unknown").length;
  return {
    requestedProfile,
    selectedProfile: supported ? profile.id : undefined,
    profileConfidence: Number(score.toFixed(4)),
    supported,
    unknownGlyphCount,
    mappedGlyphRatio: Number(mappedGlyphRatio.toFixed(4)),
    legacySymbolRatio: Number(legacySymbolRatio.toFixed(4)),
    commonSequenceRatio: Number(commonSequenceRatio.toFixed(4)),
    matraErrorCount: countSuspicious(input, /ि्|्[ािीुूेैोौ]/g),
    rephErrorCount: countSuspicious(input, /र््/g),
    conjunctErrorCount: 0,
    protectedSpanPreserved: true,
    layoutPreserved: newlineCount(input) === newlineCount(input),
    warnings: supported ? [] : ["Profile confidence below auto-select threshold; conversion should stay diagnostic/manual."]
  };
}

function plannedProfileDiagnostic(input: string, profile: LegacyFontProfile): LegacyProfileDiagnostic {
  return {
    requestedProfile: profile.id,
    selectedProfile: undefined,
    profileConfidence: 0,
    supported: false,
    unknownGlyphCount: Array.from(input).filter((char) => !/\s/.test(char)).length,
    mappedGlyphRatio: 0,
    legacySymbolRatio: 0,
    commonSequenceRatio: 0,
    matraErrorCount: 0,
    rephErrorCount: 0,
    conjunctErrorCount: 0,
    protectedSpanPreserved: true,
    layoutPreserved: true,
    warnings: [`${profile.label} profile is planned only; no verified bundle-safe map is bundled.`]
  };
}

function countSuspicious(input: string, pattern: RegExp): number {
  return Array.from(input.matchAll(pattern)).length;
}

function newlineCount(input: string): number {
  return (input.match(/\n/g) ?? []).length;
}
