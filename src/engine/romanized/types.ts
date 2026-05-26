import type { CandidateScore, EngineMode, EngineWarning } from "../types";

export type RomanizedTokenKind =
  | "word"
  | "number"
  | "space"
  | "punctuation"
  | "protected"
  | "unknown";

export interface RomanizedToken {
  text: string;
  normalized: string;
  range: [number, number];
  kind: RomanizedTokenKind;
}

export interface RomanizedCandidate {
  input: string;
  output: string;
  normalizedInput: string;
  source:
    | "phrase"
    | "alias"
    | "syllable"
    | "lexicon"
    | "hunspell"
    | "name"
    | "place"
    | "loanword"
    | "copy-through"
    | "memory"
    | "proofread";
  confidence: number;
  score: CandidateScore;
  trace: string[];
  warnings: EngineWarning[];
}

export interface RomanizedConfidenceResult {
  confidence: number;
  status: "auto" | "ambiguous" | "preserve" | "unsafe";
  warnings: EngineWarning[];
  reasons: string[];
}

export interface RomanizedEngineContext {
  mode: EngineMode;
  preserveEnglish: boolean;
  domains: string[];
  nameHeavy: boolean;
}
