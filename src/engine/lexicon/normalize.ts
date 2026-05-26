import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";

export function normalizeLexiconWord(word: string): string {
  return normalizeNepaliText(word).trim();
}

export function normalizeRomanizedKey(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function frequencyBandFor(frequency?: number) {
  if (!Number.isFinite(frequency)) return "unknown" as const;
  if ((frequency ?? 0) >= 930) return "very-common" as const;
  if ((frequency ?? 0) >= 850) return "common" as const;
  if ((frequency ?? 0) >= 700) return "medium" as const;
  return "rare" as const;
}
