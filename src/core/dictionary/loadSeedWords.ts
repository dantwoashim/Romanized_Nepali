import seedWordsRaw from "../../data/wordlists/ne-seed.tsv?raw";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { SuggestionDomain, WordEntry } from "../types";

const VALID_DOMAINS: SuggestionDomain[] = ["common", "government", "education", "legal", "office", "names", "places"];

const ROMANIZED_ALIASES: Array<{ word: string; romanized: string; frequencyBoost?: number }> = [
  { word: "विद्यालय", romanized: "vidyalaya", frequencyBoost: -8 },
  { word: "विकास", romanized: "bikas", frequencyBoost: -8 },
  { word: "विकास", romanized: "vikas", frequencyBoost: -8 },
  { word: "संविधान", romanized: "samvidhan", frequencyBoost: -5 },
  { word: "संविधान", romanized: "sambidhan", frequencyBoost: -6 },
  { word: "विद्यार्थी", romanized: "bidhyarthi", frequencyBoost: -8 },
  { word: "विषय", romanized: "bisaya", frequencyBoost: -12 },
  { word: "विश्वविद्यालय", romanized: "viswavidyalaya", frequencyBoost: -12 },
  { word: "कानुन", romanized: "kanoon", frequencyBoost: -10 },
  { word: "काठमाडौं", romanized: "kathmandu", frequencyBoost: -5 },
  { word: "फाइल", romanized: "faail", frequencyBoost: -15 },
  { word: "श्रद्धा", romanized: "shraddha", frequencyBoost: -5 },
  { word: "श्रेष्ठ", romanized: "srestha", frequencyBoost: -20 },
  { word: "क्षेत्र", romanized: "xetra", frequencyBoost: -18 }
];

export interface WordlistValidationIssue {
  line: number;
  message: string;
}

export function parseSeedWords(raw = seedWordsRaw): WordEntry[] {
  const [header, ...rows] = raw.trim().split(/\n/);
  const columns = header.split("\t");
  if (columns.join("|") !== "word|romanized|frequency|domain|source") {
    throw new Error("Seed wordlist header must be word, romanized, frequency, domain, source.");
  }

  return rows.map((line, index) => {
    const [word, romanized, frequencyRaw, domainRaw, source] = line.split("\t");
    const frequency = Number(frequencyRaw);
    const domain = domainRaw as SuggestionDomain;
    return {
      word,
      normalizedWord: normalizeNepaliText(word),
      romanized,
      frequency,
      score: frequency,
      domain,
      source
    };
  });
}

export function validateWordlist(entries = parseSeedWords()): WordlistValidationIssue[] {
  const issues: WordlistValidationIssue[] = [];
  const seenWords = new Set<string>();

  entries.forEach((entry, index) => {
    const line = index + 2;
    if (!entry.word || !entry.romanized || !entry.source) {
      issues.push({ line, message: "word, romanized, and source are required." });
    }
    if (!Number.isFinite(entry.frequency)) {
      issues.push({ line, message: "frequency must be numeric." });
    }
    if (!VALID_DOMAINS.includes(entry.domain)) {
      issues.push({ line, message: `domain must be one of ${VALID_DOMAINS.join(", ")}.` });
    }
    if (!/[\u0900-\u097F]/.test(entry.word)) {
      issues.push({ line, message: "word must contain Devanagari." });
    }
    if (entry.normalizedWord !== normalizeNepaliText(entry.word)) {
      issues.push({ line, message: "normalizedWord does not match normalizeNepaliText(word)." });
    }
    if (seenWords.has(entry.normalizedWord)) {
      issues.push({ line, message: `duplicate normalized word ${entry.normalizedWord}.` });
    }
    seenWords.add(entry.normalizedWord);
  });

  return issues;
}

const seedWords = parseSeedWords();
const aliasEntries = ROMANIZED_ALIASES.flatMap((alias) => {
  const entry = seedWords.find((word) => word.normalizedWord === normalizeNepaliText(alias.word));
  if (!entry) return [];
  const frequency = Math.max(1, entry.frequency + (alias.frequencyBoost ?? 0));
  return {
    ...entry,
    romanized: alias.romanized,
    frequency,
    score: frequency,
    source: `${entry.source}:alias`
  };
});

export const wordEntries: WordEntry[] = [...seedWords, ...aliasEntries];
export const primaryWordEntries: WordEntry[] = seedWords;

export const wordsByNormalized = new Map<string, WordEntry>();
for (const entry of seedWords) {
  wordsByNormalized.set(entry.normalizedWord, entry);
}

export const wordsByRomanized = new Map<string, WordEntry[]>();
for (const entry of wordEntries) {
  const key = entry.romanized?.toLowerCase();
  if (!key) continue;
  const existing = wordsByRomanized.get(key) ?? [];
  existing.push(entry);
  existing.sort((a, b) => b.frequency - a.frequency);
  wordsByRomanized.set(key, existing);
}

export function lookupByRomanized(romanized: string): WordEntry[] {
  return wordsByRomanized.get(romanized.toLowerCase()) ?? [];
}

export function hasDictionaryWord(word: string): boolean {
  return wordsByNormalized.has(normalizeNepaliText(word));
}
