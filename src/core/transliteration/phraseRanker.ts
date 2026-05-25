import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate } from "../types";
import { normalizeCorrectionInput } from "./localCorrectionMemory";

interface PhraseOverride {
  input: string;
  output: string;
  score: number;
  reason: string;
}

const PHRASE_OVERRIDES: PhraseOverride[] = [
  {
    input: "janma miti",
    output: "जन्म मिति",
    score: 1180,
    reason: "Reviewed office phrase override"
  },
  {
    input: "nagarikta pramanpatra",
    output: "नागरिकता प्रमाणपत्र",
    score: 1170,
    reason: "Reviewed government phrase override"
  },
  {
    input: "karyalaya ko karmachari",
    output: "कार्यालय को कर्मचारी",
    score: 1160,
    reason: "Reviewed office phrase override"
  },
  {
    input: "pramanpatra vitaran",
    output: "प्रमाणपत्र वितरण",
    score: 1160,
    reason: "Reviewed legal/admin phrase override"
  },
  {
    input: "nirnaya ra prastav",
    output: "निर्णय र प्रस्ताव",
    score: 1140,
    reason: "Reviewed admin phrase override"
  },
  {
    input: "niraj bhusal",
    output: "निरज भुसाल",
    score: 1105,
    reason: "Default name spelling candidate"
  }
];

export function phraseCandidatesForInput(input: string): Candidate[] {
  if (/\r?\n/.test(input)) return [];
  const normalizedInput = normalizeCorrectionInput(input);
  return PHRASE_OVERRIDES
    .filter((entry) => normalizeCorrectionInput(entry.input) === normalizedInput)
    .map((entry) => ({
      text: entry.output,
      normalizedText: normalizeNepaliText(entry.output),
      score: entry.score,
      source: "dictionary",
      reason: entry.reason
    }));
}
