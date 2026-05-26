import { parseRomanizedAliases, parseSeedWords } from "../../core/dictionary/loadSeedWords";
import { parsePhraseOverrides } from "../../core/transliteration/phraseRanker";
import adminPhrasesRaw from "../../../data/phrases/admin.jsonl?raw";
import commonPhrasesRaw from "../../../data/phrases/common.jsonl?raw";
import educationPhrasesRaw from "../../../data/phrases/education.jsonl?raw";
import healthPhrasesRaw from "../../../data/phrases/health.jsonl?raw";
import legalPhrasesRaw from "../../../data/phrases/legal.jsonl?raw";
import adminTermsRaw from "../../../data/lexicon/domains/admin.jsonl?raw";
import acronymsRaw from "../../../data/lexicon/english-preserve/acronyms.jsonl?raw";
import developerTermsRaw from "../../../data/lexicon/english-preserve/developer-terms.jsonl?raw";
import officePhrasesRaw from "../../../data/lexicon/english-preserve/office-phrases.jsonl?raw";
import loanwordsRaw from "../../../data/lexicon/loanwords/technical.jsonl?raw";
import provincesRaw from "../../../data/lexicon/places/provinces.jsonl?raw";
import { normalizeLexiconWord, frequencyBandFor } from "./normalize";
import { SOURCE_REGISTRY } from "./sourceRegistry";
import type { EnglishPreserveEntry, LexicalAuthority, LexiconEntry, LoanwordEntry, PhraseEntry } from "./types";

let cachedAuthority: LexicalAuthority | undefined;

export function loadLexicalAuthority(): LexicalAuthority {
  if (cachedAuthority) return cachedAuthority;

  const seedEntries = parseSeedWords().map((entry): LexiconEntry => ({
    id: `seed:${entry.normalizedWord}`,
    word: entry.normalizedWord,
    romanizations: entry.romanized ? [entry.romanized] : [],
    domains: [entry.domain],
    frequency: entry.frequency,
    frequencyBand: frequencyBandFor(entry.frequency),
    source: entry.source,
    license: entry.source.includes("dictionary-ne") ? "LGPL-2.1" : "project-internal",
    reviewStatus: entry.source.includes("dictionary-ne") ? "imported-unreviewed" : "reviewed",
    addedAt: "2026-05-26"
  }));

  const aliasEntries = parseRomanizedAliases().map((entry): LexiconEntry => ({
    id: `alias:${normalizeLexiconWord(entry.word)}:${entry.romanized}`,
    word: normalizeLexiconWord(entry.word),
    romanizations: [entry.romanized],
    domains: [entry.domain],
    frequency: entry.frequencyBoost,
    frequencyBand: "unknown",
    source: entry.source,
    license: "project-internal",
    reviewStatus: entry.source.includes("manual") ? "reviewed" : "generated",
    addedAt: "2026-05-26"
  }));

  const tsvPhrases = parsePhraseOverrides().map((entry): PhraseEntry => ({
    id: `tsv-phrase:${entry.input}`,
    romanized: entry.input,
    aliases: [],
    output: entry.output,
    domains: [entry.domain],
    tokenLength: entry.input.split(/\s+/).length,
    confidence: 0.9,
    frequency: entry.frequency,
    source: entry.source,
    license: "project-internal",
    reviewStatus: entry.source.includes("manual") ? "reviewed" : "generated"
  }));

  cachedAuthority = {
    entries: [...seedEntries, ...aliasEntries, ...readJsonl<LexiconEntry>(adminTermsRaw), ...readJsonl<LexiconEntry>(provincesRaw)],
    phrases: [
      ...tsvPhrases,
      ...readJsonl<PhraseEntry>(adminPhrasesRaw),
      ...readJsonl<PhraseEntry>(commonPhrasesRaw),
      ...readJsonl<PhraseEntry>(educationPhrasesRaw),
      ...readJsonl<PhraseEntry>(healthPhrasesRaw),
      ...readJsonl<PhraseEntry>(legalPhrasesRaw)
    ],
    loanwords: readJsonl<LoanwordEntry>(loanwordsRaw),
    englishPreserve: [
      ...readJsonl<EnglishPreserveEntry>(acronymsRaw),
      ...readJsonl<EnglishPreserveEntry>(developerTermsRaw),
      ...readJsonl<EnglishPreserveEntry>(officePhrasesRaw)
    ],
    sources: SOURCE_REGISTRY
  };

  return cachedAuthority;
}

function readJsonl<T>(raw: string): T[] {
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}
