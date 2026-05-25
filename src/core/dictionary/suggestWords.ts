import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Suggestion } from "../types";
import { wordEntries } from "./loadSeedWords";

const DOMAIN_BOOST: Record<Suggestion["domain"], number> = {
  names: 18,
  places: 20,
  government: 35,
  office: 28,
  education: 24,
  legal: 22,
  common: 16
};

export function suggestWords(prefix: string, limit = 8): Suggestion[] {
  const normalizedPrefix = normalizeNepaliText(prefix).trim().toLowerCase();
  if (!normalizedPrefix) return [];

  const isDevanagari = /[\u0900-\u097F]/.test(normalizedPrefix);

  return wordEntries
    .filter((entry) => {
      if (isDevanagari) {
        return entry.normalizedWord.startsWith(normalizedPrefix);
      }
      return entry.romanized?.toLowerCase().startsWith(normalizedPrefix);
    })
    .map((entry) => ({
      word: entry.word,
      normalizedWord: entry.normalizedWord,
      romanized: entry.romanized,
      source: entry.source,
      domain: entry.domain,
      score: entry.frequency + DOMAIN_BOOST[entry.domain]
    }))
    .sort((a, b) => b.score - a.score || a.normalizedWord.localeCompare(b.normalizedWord))
    .slice(0, limit);
}

export function currentRomanizedToken(input: string): string {
  const match = input.match(/[A-Za-z]+$/);
  return match?.[0] ?? "";
}

export function currentDevanagariToken(input: string): string {
  const match = normalizeNepaliText(input).match(/[\u0900-\u097F]+$/);
  return match?.[0] ?? "";
}
