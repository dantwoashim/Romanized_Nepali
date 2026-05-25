import nspell from "nspell";
import aff from "../../../node_modules/dictionary-ne/index.aff?raw";
import dic from "../../../node_modules/dictionary-ne/index.dic?raw";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Suggestion } from "../types";

const DEVANAGARI_WORD = /^[\u0900-\u097F]+$/;
let spell: ReturnType<typeof nspell> | undefined;

export function getNepaliHunspell() {
  if (!spell) spell = nspell({ aff, dic });
  return spell;
}

export function isKnownNepaliHunspellWord(word: string): boolean {
  const normalized = normalizeNepaliText(word);
  if (!DEVANAGARI_WORD.test(normalized)) return false;
  return getNepaliHunspell().correct(normalized);
}

export function suggestNepaliHunspellWords(word: string, limit = 5): Suggestion[] {
  const normalized = normalizeNepaliText(word);
  if (!DEVANAGARI_WORD.test(normalized)) return [];

  return getNepaliHunspell()
    .suggest(normalized)
    .map((suggestion) => normalizeNepaliText(suggestion))
    .filter((suggestion, index, suggestions) => DEVANAGARI_WORD.test(suggestion) && suggestions.indexOf(suggestion) === index)
    .slice(0, limit)
    .map((suggestion, index) => ({
      word: suggestion,
      normalizedWord: suggestion,
      romanized: undefined,
      score: 520 - index * 10,
      domain: "common",
      source: "dictionary-ne:nspell"
    }));
}
