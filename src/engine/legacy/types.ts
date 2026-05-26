import type { EngineDiagnostic } from "../types";
import type { DiagnosticFingerprint, LegacyProfileId, LegacyProfileStatus } from "./profile";

export type LegacyReviewStatus = "reviewed" | "provisional" | "unknown";

export type LegacyAtom =
  | { kind: "independent-vowel"; value: string; source: string }
  | { kind: "consonant"; value: string; source: string }
  | { kind: "virama"; value: "्"; source: string }
  | { kind: "dependent-vowel"; value: string; source: string; position: "prebase" | "postbase" | "above" | "below" | "split" }
  | { kind: "split-vowel-part"; value: string; source: string; group: string }
  | { kind: "reph-marker"; value: "र्"; source: string }
  | { kind: "rakar-marker"; value: "्र"; source: string }
  | { kind: "nukta"; value: "़"; source: string }
  | { kind: "anusvara"; value: "ं"; source: string }
  | { kind: "chandrabindu"; value: "ँ"; source: string }
  | { kind: "visarga"; value: "ः"; source: string }
  | { kind: "digit"; value: string; source: string }
  | { kind: "punctuation"; value: string; source: string }
  | { kind: "whitespace"; value: string; source: string }
  | { kind: "protected-placeholder"; value: string; source: string }
  | { kind: "unknown"; value: string; source: string };

export interface LegacyTokenMapping {
  token: string;
  atoms: LegacyAtom[];
  unicodePreview: string;
  confidence: "high" | "medium" | "low";
  reviewStatus: LegacyReviewStatus;
  evidence: string[];
  notes?: string;
}

export interface LegacyBoundaryRule {
  id: string;
  description: string;
  tokenPattern: string;
  expectedBehavior: "map" | "preserve" | "warn";
  reviewStatus: LegacyReviewStatus;
}

export interface LegacyProfileCoverageManifest {
  reviewedSingleTokenCount: number;
  reviewedSequenceTokenCount: number;
  reviewedConjunctCount: number;
  generatedAt: string;
  notes?: string;
}

export interface SemanticLegacyFontProfile {
  profileId: LegacyProfileId;
  displayName: string;
  version: string;
  status: LegacyProfileStatus | "partial" | "diagnostic-only";
  sourceProvenance: {
    source: string;
    license: string;
    reviewStatus: "reviewed" | "manual-curation" | "imported-unreviewed" | "planned";
    reviewers?: string[];
    notes?: string;
  };
  diagnosticFingerprint: DiagnosticFingerprint;
  singleTokenMap: Record<string, LegacyTokenMapping>;
  sequenceTokenMap: Record<string, LegacyTokenMapping>;
  conjunctMap: Record<string, LegacyTokenMapping>;
  matraMap: Record<string, LegacyTokenMapping>;
  digitMap: Record<string, LegacyTokenMapping>;
  punctuationMap: Record<string, LegacyTokenMapping>;
  boundaryRules: LegacyBoundaryRule[];
  knownUnsupported: string[];
  testCoverageManifest?: LegacyProfileCoverageManifest;
}

export interface LegacyToken {
  source: string;
  range: [number, number];
  mapping?: LegacyTokenMapping;
  atoms: LegacyAtom[];
  kind: "mapped" | "digit" | "punctuation" | "whitespace" | "protected-placeholder" | "unknown";
  profileId: string;
  confidence: number;
  diagnostics: EngineDiagnostic[];
}

export interface LegacyVerificationResult {
  status: "clean" | "warning" | "unsafe";
  errors: EngineDiagnostic[];
  warnings: EngineDiagnostic[];
  unknownSequences: string[];
  coveragePercent: number;
  profileId: string;
  profileVersion: string;
  normalized: boolean;
}

export interface LegacyDecodeResult {
  input: string;
  output: string;
  tokens: LegacyToken[];
  verification: LegacyVerificationResult;
  diagnostics: EngineDiagnostic[];
  trace: Array<{ name: string; message: string; data?: Record<string, unknown> }>;
}
