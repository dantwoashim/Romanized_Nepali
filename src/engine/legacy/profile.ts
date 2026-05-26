import preetiProfile from "../../../data/legacy-fonts/profiles/preeti.json";
import kantipurProfile from "../../../data/legacy-fonts/profiles/kantipur.json";
import sagarmathaProfile from "../../../data/legacy-fonts/profiles/sagarmatha.json";
import himaliProfile from "../../../data/legacy-fonts/profiles/himali.json";
import { FONT_MAPS } from "@nepalibhasha/converter";
import { getPreetiEntries } from "../../core/preeti/preetiMap";
import { atomsFromUnicodePreview } from "./atoms";
import type {
  LegacyBoundaryRule,
  LegacyTokenMapping,
  SemanticLegacyFontProfile
} from "./types";

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
  semantic?: SemanticLegacyFontProfile;
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

export function getSemanticLegacyProfile(id: LegacyProfileId): SemanticLegacyFontProfile {
  if (id !== "preeti") return plannedSemanticProfile(getLegacyProfile(id));
  return buildPreetiSemanticProfile();
}

const HIGH_VALUE_SEQUENCE_MAP: Record<string, { unicode: string; notes: string }> = {
  "cf]": { unicode: "ओ", notes: "Split-vowel independent ओ sequence." },
  "cf}": { unicode: "औ", notes: "Split-vowel independent औ sequence." },
  "f]": { unicode: "ो", notes: "Split-vowel dependent ो sequence." },
  "f}": { unicode: "ौ", notes: "Split-vowel dependent ौ sequence." },
  "of{": { unicode: "र्या", notes: "Reviewed reph+rakar style sequence used in कार्यालय." },
  "tf{": { unicode: "र्ता", notes: "Reviewed reph boundary sequence used in दर्ता." },
  "y{": { unicode: "र्थ", notes: "Reviewed reph boundary sequence used in प्रार्थना." },
  "o{": { unicode: "र्य", notes: "Reviewed reph boundary sequence used in सौर्य." },
  "0f{o": { unicode: "र्णय", notes: "Reviewed reph boundary sequence used in निर्णय." },
  "0ff": { unicode: "णा", notes: "Reviewed long-vowel णा sequence used in दुष्परिणामहरू." },
  "s[lif": { unicode: "कृषि", notes: "Reviewed vocalic-r sequence used in कृषि." },
  "af]w": { unicode: "बोध", notes: "Reviewed hard sequence used in दायित्वबोध." },
  Rr: { unicode: "च्च", notes: "Canonical current inverse-map sequence for उच्चतम्; consumed as one conjunct in atom path." },
  R: { unicode: "च्च", notes: "Reviewed stress fixture: pRtd\\ encodes उच्चतम्." },
  "?": { unicode: "रू", notes: "Reviewed Preeti suffix token. Literal question marks are handled by mixed-mode protection/boundary diagnostics." },
  "bf]w": { unicode: "बोध", notes: "Reviewed hard case for दायित्वबोध; kept as sequence guard for atom path." },
  "dx?": { unicode: "महरू", notes: "Boundary sequence used by दुष्परिणामहरू when source encodes म + हरू." },
  "x?": { unicode: "हरू", notes: "Boundary suffix sequence for लक्ष्यहरू and related ह + रू forms." },
  If: { unicode: "क्ष", notes: "Common Preeti conjunct sequence." },
  1: { unicode: "ज्ञ", notes: "Common Preeti dedicated conjunct token." },
  4: { unicode: "द्ध", notes: "Common Preeti dedicated conjunct token." }
};

const PREETI_BOUNDARY_RULES: LegacyBoundaryRule[] = [
  {
    id: "preeti-haru-question-token",
    description: "In reviewed Preeti spans, terminal ? may encode रू, especially after ह for हरू; literal question marks stay punctuation in protected/English context.",
    tokenPattern: "ह?",
    expectedBehavior: "map",
    reviewStatus: "reviewed"
  },
  {
    id: "preeti-prebase-i",
    description: "Legacy short-i is typed before the visual cluster but assembled after the Unicode base cluster.",
    tokenPattern: "l<cluster>",
    expectedBehavior: "map",
    reviewStatus: "reviewed"
  },
  {
    id: "preeti-reph-marker",
    description: "Legacy reph marker is attached to the following consonant cluster and emitted as र् in Unicode logical order.",
    tokenPattern: "<cluster>{",
    expectedBehavior: "map",
    reviewStatus: "provisional"
  }
];

function buildPreetiSemanticProfile(): SemanticLegacyFontProfile {
  const base = getLegacyProfile("preeti");
  const baselineMap = FONT_MAPS.preeti ?? {};
  const singleTokenMap: Record<string, LegacyTokenMapping> = {};
  const sequenceTokenMap: Record<string, LegacyTokenMapping> = {};
  const conjunctMap: Record<string, LegacyTokenMapping> = {};
  const matraMap: Record<string, LegacyTokenMapping> = {};
  const digitMap: Record<string, LegacyTokenMapping> = {};
  const punctuationMap: Record<string, LegacyTokenMapping> = {};

  const addMapping = (
    target: Record<string, LegacyTokenMapping>,
    token: string,
    unicodePreview: string,
    evidence: string[],
    confidence: LegacyTokenMapping["confidence"] = "high",
    reviewStatus: LegacyTokenMapping["reviewStatus"] = "reviewed",
    notes?: string
  ) => {
    target[token] = {
      token,
      unicodePreview,
      atoms: atomsFromUnicodePreview(unicodePreview, token),
      confidence,
      reviewStatus,
      evidence,
      notes
    };
  };

  for (const [token, unicodePreview] of Object.entries(baselineMap)) {
    addMapping(singleTokenMap, token, unicodePreview, ["@nepalibhasha/converter MIT baseline"]);
  }

  for (const [token, entry] of getPreetiEntries()) {
    if (!singleTokenMap[token]) {
      addMapping(singleTokenMap, token, entry.target, [`project fallback map: ${entry.source}`], entry.confidence, entry.confidence === "high" ? "reviewed" : "provisional", entry.notes);
    }
  }

  for (const [token, entry] of Object.entries(HIGH_VALUE_SEQUENCE_MAP)) {
    const target = token.length > 1 ? sequenceTokenMap : singleTokenMap;
    addMapping(target, token, entry.unicode, ["manual regression audit"], "high", "reviewed", entry.notes);
    if (/[्]|(क्ष|ज्ञ|द्ध|च्च)/.test(entry.unicode)) {
      addMapping(conjunctMap, token, entry.unicode, ["manual regression audit"], "high", "reviewed", entry.notes);
    }
  }

  for (const [token, mapping] of Object.entries(singleTokenMap)) {
    const preview = mapping.unicodePreview;
    if (/^[०-९0-9]$/.test(preview)) digitMap[token] = mapping;
    if (/^[।,.;:!?()[\]{}\-_/]$/.test(preview)) punctuationMap[token] = mapping;
    if (/^[ािीुूृेैोौंँः]$/.test(preview)) matraMap[token] = mapping;
  }

  return {
    profileId: "preeti",
    displayName: base.label,
    version: "2026-05-26.semantic-v1",
    status: base.status,
    sourceProvenance: {
      source: base.mapSource,
      license: base.license,
      reviewStatus: "manual-curation",
      notes: "Semantic profile is generated from the bundled MIT baseline map plus project-owned reviewed hard-case mappings. It does not copy unsafe legacy maps."
    },
    diagnosticFingerprint: base.diagnosticFingerprint,
    singleTokenMap,
    sequenceTokenMap,
    conjunctMap,
    matraMap,
    digitMap,
    punctuationMap,
    boundaryRules: PREETI_BOUNDARY_RULES,
    knownUnsupported: [],
    testCoverageManifest: {
      reviewedSingleTokenCount: Object.keys(singleTokenMap).length,
      reviewedSequenceTokenCount: Object.keys(sequenceTokenMap).length,
      reviewedConjunctCount: Object.keys(conjunctMap).length,
      generatedAt: "2026-05-26T00:00:00.000Z",
      notes: "Counts are generated from bundled maps at runtime; timestamp is profile schema date, not benchmark freshness."
    }
  };
}

function plannedSemanticProfile(profile: LegacyFontProfile): SemanticLegacyFontProfile {
  return {
    profileId: profile.id,
    displayName: profile.label,
    version: "planned",
    status: profile.status === "blocked" ? "diagnostic-only" : "planned",
    sourceProvenance: {
      source: profile.mapSource,
      license: profile.license,
      reviewStatus: "planned",
      notes: "No verified bundle-safe semantic mapping is present for this profile."
    },
    diagnosticFingerprint: profile.diagnosticFingerprint,
    singleTokenMap: {},
    sequenceTokenMap: {},
    conjunctMap: {},
    matraMap: {},
    digitMap: {},
    punctuationMap: {},
    boundaryRules: [],
    knownUnsupported: ["semantic-map-missing"]
  };
}
