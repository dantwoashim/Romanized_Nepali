export interface TextWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface NepaliTextResult {
  input: string;
  output: string;
  normalizedOutput: string;
  warnings: TextWarning[];
}

export interface Candidate {
  text: string;
  normalizedText: string;
  score: number;
  source: "rule" | "dictionary" | "variant" | "user-feedback";
  reason: string;
}

export interface TokenTrace {
  input: string;
  output: string;
  rule: string;
  notes?: string[];
}

export interface RomanizedResult extends NepaliTextResult {
  candidates: Candidate[];
  trace: TokenTrace[];
}

export interface ConversionWarning extends TextWarning {
  sourceChar?: string;
  position?: number;
}

export interface PreetiResult extends NepaliTextResult {
  warnings: ConversionWarning[];
  changedCount: number;
  uncertainMappings: ConversionWarning[];
}

export type SuggestionDomain = "common" | "government" | "education" | "legal" | "office" | "names" | "places";

export interface Suggestion {
  word: string;
  normalizedWord: string;
  romanized?: string;
  score: number;
  domain: SuggestionDomain;
  source: string;
}

export interface WordEntry extends Suggestion {
  frequency: number;
}

export interface SpellHint {
  token: string;
  normalizedToken: string;
  label: "Possible typo" | "Unknown word" | "Suggestion" | "Not in local dictionary";
  severity: "info" | "warning";
  suggestions: Suggestion[];
  reason: string;
}
