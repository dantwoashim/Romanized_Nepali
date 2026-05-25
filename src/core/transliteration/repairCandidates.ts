import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate } from "../types";
import { composeRomanizedToken } from "./devanagariComposer";

const LONG_I_SUFFIXES = [
  "chari",
  "dhikari",
  "kari",
  "shmi",
  "laxmi",
  "lakshmi"
];

export function weightedRepairCandidates(token: string, defaultOutput: string): Candidate[] {
  const lower = token.toLowerCase();
  const candidates: Candidate[] = [];

  const broadConjunct = composeRomanizedToken(token, { genericConjunctMode: "all" }).output;
  pushIfDifferent(candidates, broadConjunct, defaultOutput, 515, "Broad consonant-lattice conjunct candidate");

  if (LONG_I_SUFFIXES.some((suffix) => lower.endsWith(suffix))) {
    const longI = repairFinalLongI(lower, defaultOutput);
    pushIfDifferent(candidates, longI, defaultOutput, 535, "Common final long-ii suffix repair candidate");
  }

  if (/(janm|sampark|sambandh|nirnay|karm|shabd)/.test(lower)) {
    const conjunctRepair = composeRomanizedToken(token, { genericConjunctMode: "all", genericHalanta: true }).output;
    pushIfDifferent(candidates, conjunctRepair, defaultOutput, 505, "Conservative consonant-cluster repair candidate");
  }

  if (lower.endsWith("shasan")) {
    pushIfDifferent(candidates, defaultOutput.replace(/शसन$/, "शासन"), defaultOutput, 525, "Common shasan long-aa repair candidate");
  }

  if (lower.endsWith("stav")) {
    pushIfDifferent(candidates, defaultOutput.replace(/स्तव$/, "स्ताव"), defaultOutput, 520, "Common stav long-aa repair candidate");
  }

  return candidates;
}

function repairFinalLongI(lowerToken: string, output: string): string {
  if (lowerToken.endsWith("chari")) return output.replace(/चरि$/, "चारी");
  if (lowerToken.endsWith("dhikari")) return output.replace(/धिकरि$/, "धिकारी");
  if (lowerToken.endsWith("kari")) return output.replace(/करि$/, "कारी");
  return output.endsWith("ि") ? `${output.slice(0, -1)}ी` : output;
}

function pushIfDifferent(candidates: Candidate[], output: string, defaultOutput: string, score: number, reason: string) {
  const normalized = normalizeNepaliText(output);
  if (!normalized || normalized === normalizeNepaliText(defaultOutput)) return;
  candidates.push({
    text: output,
    normalizedText: normalized,
    score,
    source: "variant",
    reason
  });
}
