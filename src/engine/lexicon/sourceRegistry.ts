import type { LexiconSourceManifest } from "./types";

export const SOURCE_REGISTRY: LexiconSourceManifest[] = [
  {
    id: "manual-curation",
    name: "Lekh manual curation",
    sourceType: "manual",
    license: "project-internal",
    importDate: "2026-05-26",
    importedBy: "Lekh project",
    bundleEligible: true,
    reviewStatus: "reviewed",
    notes: "Project-authored names, phrases, places, loanwords, and English-preserve policies."
  },
  {
    id: "dictionary-ne",
    name: "dictionary-ne Nepali Hunspell dictionary",
    sourceType: "third-party",
    sourceUrl: "https://github.com/wooorm/dictionaries/tree/main/dictionaries/ne",
    license: "LGPL-2.1 dictionary data; MIT package wrapper",
    version: "2.0.0",
    importDate: "2026-05-26",
    importedBy: "rank-hunspell-by-frequency.ts",
    bundleEligible: true,
    reviewStatus: "imported-unreviewed",
    notes: "May improve recall, but imported/generated rows must rank below reviewed manual phrase and alias rows."
  },
  {
    id: "local-wikipedia-frequency",
    name: "Local Nepali Wikipedia frequency artifact",
    sourceType: "local-research-input",
    license: "CC BY-SA/GFDL source obligations; raw corpus not bundled",
    importDate: "2026-05-26",
    importedBy: "local research artifact",
    bundleEligible: false,
    reviewStatus: "generated",
    notes: "Used only as local frequency evidence when present under data/generated/frequency; raw corpus and frequency TSV are not runtime data."
  }
];

export function sourceManifestById(id: string): LexiconSourceManifest | undefined {
  return SOURCE_REGISTRY.find((source) => source.id === id);
}
