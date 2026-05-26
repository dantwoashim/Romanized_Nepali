export type ReviewStatus =
  | "approved"
  | "reviewed"
  | "imported-unreviewed"
  | "generated"
  | "quarantined"
  | "rejected"
  | "user-local";

export interface LexiconEntry {
  id: string;
  word: string;
  romanizations: string[];
  domains: string[];
  pos?: string;
  frequency?: number;
  frequencyBand?: "very-common" | "common" | "medium" | "rare" | "unknown";
  source: string;
  license: string;
  reviewStatus: ReviewStatus;
  addedAt: string;
  reviewedBy?: string;
  notes?: string;
}

export interface LexiconSourceManifest {
  id: string;
  name: string;
  sourceType: "manual" | "third-party" | "generated" | "local-research-input" | "user-consented" | "unknown";
  sourceUrl?: string;
  license: string;
  version?: string;
  commit?: string;
  importDate: string;
  importedBy: string;
  bundleEligible: boolean;
  reviewStatus: ReviewStatus;
  notes?: string;
}

export interface PhraseEntry {
  id: string;
  romanized: string;
  aliases: string[];
  output: string;
  domains: string[];
  tokenLength: number;
  confidence: number;
  frequency: number;
  source: string;
  license: string;
  reviewStatus: ReviewStatus;
}

export interface LoanwordEntry {
  id: string;
  input: string;
  output: string;
  modePolicy: "preserve-in-mixed" | "candidate-only" | "convert-in-strict";
  source: string;
  license: string;
  reviewStatus: ReviewStatus;
}

export interface EnglishPreserveEntry {
  id: string;
  value: string;
  kind: "acronym" | "office-phrase" | "developer-term";
  source: string;
  license: string;
  reviewStatus: ReviewStatus;
}

export interface LexicalAuthority {
  entries: LexiconEntry[];
  phrases: PhraseEntry[];
  loanwords: LoanwordEntry[];
  englishPreserve: EnglishPreserveEntry[];
  sources: LexiconSourceManifest[];
}
