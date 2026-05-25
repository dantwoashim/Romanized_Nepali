import phrasesRaw from "../../data/phrases/romanized-phrases.tsv?raw";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate } from "../types";
import { normalizeCorrectionInput } from "./localCorrectionMemory";

interface PhraseOverride {
  input: string;
  output: string;
  frequency: number;
  domain: string;
  source: string;
  reason: string;
}

const PHRASE_SCORE_BASE = 2200;
const PHRASE_OVERRIDES = parsePhraseOverrides();

export function phraseCandidatesForInput(input: string): Candidate[] {
  if (/\r?\n/.test(input)) return [];
  const normalizedInput = normalizeCorrectionInput(input);
  return PHRASE_OVERRIDES
    .filter((entry) => normalizeCorrectionInput(entry.input) === normalizedInput)
    .map((entry) => ({
      text: entry.output,
      normalizedText: normalizeNepaliText(entry.output),
      score: PHRASE_SCORE_BASE + Math.floor(entry.frequency / 10),
      source: "dictionary",
      reason: entry.reason
    }));
}

export function parsePhraseOverrides(raw = phrasesRaw): PhraseOverride[] {
  const [header, ...rows] = raw.trim().split(/\n/);
  if (header.split("\t").join("|") !== "input|output|domain|frequency|source") {
    throw new Error("Phrase pack header must be input, output, domain, frequency, source.");
  }

  return rows.map((line) => {
    const [input, output, domain, frequencyRaw, source] = line.split("\t");
    return {
      input,
      output,
      domain,
      source,
      frequency: Number(frequencyRaw),
      reason: source.includes("mixed") ? "Reviewed mixed English phrase override" : `Reviewed ${domain} phrase override`
    };
  });
}
