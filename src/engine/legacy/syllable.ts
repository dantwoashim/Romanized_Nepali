import type { LegacyAtom } from "./types";

const CONSONANT = /[\u0915-\u0939\u0958-\u095F]/;
const VIRAMA = "्";

export function reorderPrebaseMatraWindow(value: string): string {
  return value.replace(/ि((?:[\u0915-\u0939\u0958-\u095F]़?्)*[\u0915-\u0939\u0958-\u095F]़?)/g, "$1ि");
}

export function hasDanglingPrebaseMatra(value: string): boolean {
  return /(^|[^\u0915-\u0939\u0958-\u095F])ि/.test(value);
}

export function hasDanglingVirama(value: string): boolean {
  return new RegExp(`${VIRAMA}(?![\\u0915-\\u0939\\u0958-\\u095F])`).test(value);
}

export function atomLooksSyllabic(atom: LegacyAtom): boolean {
  return atom.kind === "consonant" || atom.kind === "independent-vowel" || atom.kind === "dependent-vowel" || atom.kind === "reph-marker" || atom.kind === "rakar-marker";
}

export function isConsonantValue(value: string): boolean {
  return CONSONANT.test(value);
}
