import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { normalizeRomanizedToken } from "../../core/transliteration/latinNormalize";
import { loadLexicalAuthority } from "../lexicon";

export interface WeightedAliasVariant {
  alias: string;
  word: string;
  weight: number;
  source: string;
  reason: string;
}

export function generateAliasVariants(word: string, baseAliases: string[] = []): WeightedAliasVariant[] {
  const normalizedWord = normalizeNepaliText(word);
  const variants = new Map<string, WeightedAliasVariant>();

  for (const alias of baseAliases) {
    addVariant(variants, alias, normalizedWord, 1_000, "curated", "Existing curated alias");
  }

  for (const alias of baseAliases) {
    for (const variant of spellingVariants(alias)) {
      addVariant(variants, variant.alias, normalizedWord, variant.weight, "weighted-variant", variant.reason);
    }
  }

  return Array.from(variants.values()).sort((a, b) => b.weight - a.weight || a.alias.localeCompare(b.alias));
}

export function buildApprovedAliasVariants(): WeightedAliasVariant[] {
  const authority = loadLexicalAuthority();
  return authority.entries
    .filter((entry) => entry.reviewStatus === "approved" || entry.reviewStatus === "reviewed" || entry.reviewStatus === "imported-unreviewed")
    .flatMap((entry) => generateAliasVariants(entry.word, entry.romanizations)
      .map((variant) => ({
        ...variant,
        source: entry.source,
        weight: Math.round(variant.weight * reviewMultiplier(entry.reviewStatus))
      })));
}

function spellingVariants(alias: string): Array<{ alias: string; weight: number; reason: string }> {
  const normalized = normalizeRomanizedToken(alias).replace(/[^a-z]/g, "");
  const variants: Array<{ alias: string; weight: number; reason: string }> = [];
  const add = (next: string, weight: number, reason: string) => {
    if (next.length >= 2 && next !== normalized) variants.push({ alias: next, weight, reason });
  };

  add(stripFinalSchwa(normalized), 930, "Final schwa dropped");
  add(normalized.replace(/v/g, "b"), 760, "v/b common typing variant");
  add(normalized.replace(/b/g, "v"), 740, "b/v common typing variant");
  add(normalized.replace(/v/g, "w"), 700, "v/w common typing variant");
  add(normalized.replace(/ph/g, "f"), 720, "ph/f common typing variant");
  add(normalized.replace(/chh/g, "ch"), 670, "chh/ch casual variant");
  add(normalized.replace(/sh/g, "s"), 650, "sh/s casual variant");
  add(normalized.replace(/ksh/g, "x"), 640, "ksh/x compact variant");
  add(normalized.replace(/aa/g, "a"), 610, "aa/a vowel-length variant");
  add(normalized.replace(/ii/g, "ee"), 600, "ii/ee vowel variant");

  return variants;
}

function addVariant(
  variants: Map<string, WeightedAliasVariant>,
  alias: string,
  word: string,
  weight: number,
  source: string,
  reason: string
): void {
  const normalized = normalizeRomanizedToken(alias).replace(/[^a-z]/g, "");
  if (normalized.length < 2) return;
  const current = variants.get(normalized);
  if (!current || current.weight < weight) {
    variants.set(normalized, { alias: normalized, word, weight, source, reason });
  }
}

function stripFinalSchwa(alias: string): string {
  return alias.length > 2 && alias.endsWith("a") ? alias.slice(0, -1) : alias;
}

function reviewMultiplier(status: string): number {
  if (status === "approved" || status === "reviewed") return 1;
  if (status === "imported-unreviewed") return 0.58;
  return 0.4;
}
