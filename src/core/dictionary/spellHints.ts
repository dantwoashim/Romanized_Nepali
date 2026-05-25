import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { SpellHint, Suggestion } from "../types";
import { hasDictionaryWord, primaryWordEntries } from "./loadSeedWords";

const DEVANAGARI_TOKEN = /[\u0900-\u097F]+/g;

export function getSpellHints(text: string, limit = 6): SpellHint[] {
  const normalized = normalizeNepaliText(text);
  const tokens = normalized.match(DEVANAGARI_TOKEN) ?? [];
  const seen = new Set<string>();
  const hints: SpellHint[] = [];

  for (const token of tokens) {
    const normalizedToken = normalizeNepaliText(token);
    if (seen.has(normalizedToken) || normalizedToken.length < 2) continue;
    seen.add(normalizedToken);

    if (/([\u0900-\u097F])\1\1/.test(normalizedToken)) {
      hints.push({
        token,
        normalizedToken,
        label: "Possible typo",
        severity: "warning",
        suggestions: nearestSuggestions(normalizedToken, 3),
        reason: "Repeated characters are unusual in local seed words."
      });
      continue;
    }

    if (!hasDictionaryWord(normalizedToken)) {
      hints.push({
        token,
        normalizedToken,
        label: "Not in local dictionary",
        severity: "info",
        suggestions: nearestSuggestions(normalizedToken, 3),
        reason: "This word is not in the bundled seed list."
      });
    }

    if (hints.length >= limit) break;
  }

  return hints;
}

function nearestSuggestions(token: string, limit: number): Suggestion[] {
  return primaryWordEntries
    .map((entry) => ({
      entry,
      distance: levenshtein(token, entry.normalizedWord)
    }))
    .filter(({ distance, entry }) => distance <= Math.max(2, Math.ceil(entry.normalizedWord.length / 3)))
    .sort((a, b) => a.distance - b.distance || b.entry.frequency - a.entry.frequency)
    .slice(0, limit)
    .map(({ entry, distance }) => ({
      word: entry.word,
      normalizedWord: entry.normalizedWord,
      romanized: entry.romanized,
      score: entry.frequency - distance * 40,
      domain: entry.domain,
      source: entry.source
    }));
}

export function levenshtein(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let column = 1; column <= b.length; column += 1) {
    rows[0][column] = column;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost
      );
    }
  }

  return rows[a.length][b.length];
}
