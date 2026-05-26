import { lookupByRomanized } from "../../core/dictionary/loadSeedWords";
import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { findPhraseMatches } from "../../core/transliteration/phraseRanker";
import { canRankStrongly, isRejected } from "./license";
import { normalizeRomanizedKey } from "./normalize";
import type { LexicalAuthority, LexiconEntry, PhraseEntry } from "./types";

export const SOURCE_PRIORITY = [
  "protected-span-rule",
  "user-correction-memory",
  "curated-phrase-pack",
  "curated-alias",
  "domain-lexicon",
  "curated-base-lexicon",
  "reviewed-names-places",
  "hunspell-validation",
  "frequency-prior",
  "phonetic-fallback"
] as const;

export function queryLexiconByRomanized(authority: LexicalAuthority, romanized: string): LexiconEntry[] {
  const key = normalizeRomanizedKey(romanized);
  return authority.entries
    .filter((entry) => !isRejected(entry.reviewStatus))
    .filter((entry) => entry.romanizations.some((item) => normalizeRomanizedKey(item) === key))
    .sort(rankLexiconEntries);
}

export function queryRuntimeDictionary(romanized: string): LexiconEntry[] {
  return lookupByRomanized(romanized).map((entry): LexiconEntry => ({
    id: `runtime:${entry.normalizedWord}:${entry.romanized}`,
    word: entry.normalizedWord,
    romanizations: entry.romanized ? [entry.romanized] : [],
    domains: [entry.domain],
    frequency: entry.frequency,
    frequencyBand: entry.frequency >= 930 ? "very-common" : entry.frequency >= 850 ? "common" : "medium",
    source: entry.source,
    license: entry.source.includes("dictionary-ne") ? "LGPL-2.1" : "project-internal",
    reviewStatus: entry.source.includes("dictionary-ne") ? "imported-unreviewed" : "reviewed",
    addedAt: "2026-05-26"
  }));
}

export function queryPhraseWindows(input: string): PhraseEntry[] {
  return findPhraseMatches(input).map((match): PhraseEntry => ({
    id: `phrase:${normalizeRomanizedKey(match.input)}`,
    romanized: normalizeRomanizedKey(match.input),
    aliases: [],
    output: normalizeNepaliText(match.output),
    domains: [match.domain],
    tokenLength: match.tokenRange[1] - match.tokenRange[0],
    confidence: 0.92,
    frequency: match.frequency,
    source: match.source,
    license: "project-internal",
    reviewStatus: match.source.includes("manual") ? "reviewed" : "generated"
  }));
}

function rankLexiconEntries(a: LexiconEntry, b: LexiconEntry): number {
  const review = reviewScore(b.reviewStatus) - reviewScore(a.reviewStatus);
  if (review !== 0) return review;
  return (b.frequency ?? 0) - (a.frequency ?? 0) || a.word.localeCompare(b.word, "ne");
}

function reviewScore(status: LexiconEntry["reviewStatus"]): number {
  if (canRankStrongly(status)) return 5;
  if (status === "generated" || status === "imported-unreviewed") return 2;
  if (status === "user-local") return 4;
  return 0;
}
