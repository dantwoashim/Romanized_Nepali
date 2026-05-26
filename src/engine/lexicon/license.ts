import type { LexiconSourceManifest } from "./types";

export function assertBundleEligible(source: LexiconSourceManifest): void {
  if (!source.bundleEligible) {
    throw new Error(`Lexicon source "${source.id}" is not bundle-eligible.`);
  }
  if (/GPL-3|non-?commercial|unknown|blocked/i.test(source.license)) {
    throw new Error(`Lexicon source "${source.id}" has a blocked or unclear license: ${source.license}`);
  }
}

export function canRankStrongly(reviewStatus: string): boolean {
  return reviewStatus === "approved" || reviewStatus === "reviewed";
}

export function isRejected(reviewStatus: string): boolean {
  return reviewStatus === "quarantined" || reviewStatus === "rejected";
}
