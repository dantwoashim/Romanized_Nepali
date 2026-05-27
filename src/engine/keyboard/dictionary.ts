import { lookupByRomanized, wordsByNormalized } from "../../core/dictionary/loadSeedWords";
import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { loadLexicalAuthority } from "../lexicon";
import { queryLexiconByRomanized, queryRuntimeDictionary } from "../lexicon/authority";
import type { DictionaryResult, TypingContext } from "./types";

export function lookupKeyboardDictionary(query: string, context?: TypingContext): DictionaryResult[] {
  const trimmed = query.trim();
  if (!trimmed || context?.secureInput || context?.fieldType === "password" || context?.fieldType === "code") return [];

  const normalized = normalizeNepaliText(trimmed);
  const byRomanized = [
    ...queryRuntimeDictionary(trimmed),
    ...queryLexiconByRomanized(loadLexicalAuthority(), trimmed)
  ];
  const byUnicode = wordsByNormalized.get(normalized);
  const rows = byUnicode
    ? [{
      query: trimmed,
      word: byUnicode.normalizedWord,
      romanized: byUnicode.romanized ? [byUnicode.romanized] : [],
      domains: [byUnicode.domain],
      source: byUnicode.source,
      confidence: 0.94
    }]
    : byRomanized.map((entry) => ({
      query: trimmed,
      word: entry.word,
      romanized: entry.romanizations,
      domains: entry.domains,
      source: entry.source,
      confidence: entry.reviewStatus === "reviewed" ? 0.92 : 0.72
    }));

  const fallback = lookupByRomanized(trimmed).map((entry) => ({
    query: trimmed,
    word: entry.normalizedWord,
    romanized: entry.romanized ? [entry.romanized] : [],
    domains: [entry.domain],
    source: entry.source,
    confidence: entry.source.includes("dictionary-ne") ? 0.68 : 0.88
  }));

  return dedupe([...rows, ...fallback]).slice(0, 8);
}

function dedupe(rows: DictionaryResult[]): DictionaryResult[] {
  const seen = new Set<string>();
  const result: DictionaryResult[] = [];
  for (const row of rows) {
    const key = `${row.word}:${row.source ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result.sort((a, b) => b.confidence - a.confidence || a.word.localeCompare(b.word, "ne"));
}
