import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { isKnownEnglishPreserveWord } from "./english";

export interface EnglishSuffixParse {
  stem: string;
  suffixInput: string;
  suffixOutput: string;
  output: string;
  confidence: number;
  reason: string;
}

const RAW_SUFFIXES = [
  ["rakhnuparne", "राख्नुपर्ने", 0.92],
  ["garnuparne", "गर्नुपर्ने", 0.92],
  ["garnu", "गर्नु", 0.9],
  ["garna", "गर्न", 0.9],
  ["gare", " गरे", 0.9],
  ["garyo", " गर्‍यो", 0.86],
  ["bhayeko", "भएको", 0.9],
  ["bhayena", "भएन", 0.9],
  ["bhayo", " भयो", 0.9],
  ["parne", "पर्ने", 0.86],
  ["haru", "हरू", 0.94],
  ["sanga", "सँग", 0.9],
  ["bhitra", "भित्र", 0.86],
  ["bata", "बाट", 0.86],
  ["mathi", "माथि", 0.86],
  ["lai", "लाई", 0.9],
  ["maa", "मा", 0.9],
  ["ma", "मा", 0.86],
  ["kaa", "का", 0.9],
  ["ko", "को", 0.9],
  ["ki", "की", 0.86],
  ["le", "ले", 0.86]
] satisfies Array<[string, string, number]>;

const SUFFIXES: Array<[string, string, number]> = [...RAW_SUFFIXES].sort((a, b) => b[0].length - a[0].length);

export function parseEnglishNepaliSuffix(token: string, previousWord?: string): EnglishSuffixParse | undefined {
  if (!/^[A-Za-z][A-Za-z-]+$/.test(token)) return undefined;
  const lower = token.toLowerCase();
  for (const [suffixInput, suffixOutput, confidence] of SUFFIXES) {
    if (!lower.endsWith(suffixInput) || lower.length <= suffixInput.length + 1) continue;
    const stem = token.slice(0, token.length - suffixInput.length);
    const stemLower = stem.toLowerCase();
    const previousEnglish = previousWord ? isKnownEnglishPreserveWord(previousWord) || /^[A-Z][a-z]+$/.test(previousWord) : false;
    if (!isKnownEnglishPreserveWord(stemLower) && !previousEnglish) continue;
    const output = normalizeNepaliText(`${stem}${suffixOutput}`);
    return {
      stem,
      suffixInput: token.slice(token.length - suffixInput.length),
      suffixOutput,
      output,
      confidence,
      reason: `Preserved English stem "${stem}" and converted Nepali suffix "${suffixInput}".`
    };
  }
  return undefined;
}

export function suffixInventory(): string[] {
  return SUFFIXES.map(([suffix]) => suffix);
}
