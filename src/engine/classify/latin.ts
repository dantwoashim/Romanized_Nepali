import { clamp01, ratio, ROMANIZED_CUES, ROMANIZED_POSTPOSITIONS } from "./patterns";

export function latinRatio(input: string): number {
  const chars = [...input].filter((char) => !/\s/.test(char));
  const latin = chars.filter((char) => /[A-Za-z]/.test(char)).length;
  return ratio(latin, chars.length);
}

export function digitSymbolRatio(input: string): number {
  const chars = [...input].filter((char) => !/\s/.test(char));
  const digitSymbol = chars.filter((char) => /[0-9()[\]{}:;.,!?/@#%&+_=|-]/.test(char)).length;
  return ratio(digitSymbol, chars.length);
}

export function romanizedLikelihood(input: string): number {
  const tokens = input.toLowerCase().match(/[a-z]+/g) ?? [];
  if (tokens.length === 0) return 0;
  const cueHits = tokens.filter((token) => ROMANIZED_CUES.some((cue) => token.includes(cue))).length;
  const postpositionHits = tokens.filter((token) => ROMANIZED_POSTPOSITIONS.includes(token)).length;
  const commonWordHits = tokens.filter((token) =>
    /^(?:mero|naam|nam|ramro|cha|chha|ho|ma|ko|le|lai|yo|tyo|ghar|pani|sathi|nagarikta|pramanpatra|karyalaya|miti)$/.test(token)
  ).length;
  const nepaliShapeHits = tokens.filter((token) => /(?:chha|cha|ko|ma|lai|haru|sanga|karyalaya|praman|patra|miti)$/.test(token)).length;
  return clamp01((cueHits * 0.38 + postpositionHits * 0.42 + commonWordHits * 0.36 + nepaliShapeHits * 0.35) / Math.max(1, tokens.length * 0.65));
}

export function englishDigitalLikelihood(input: string, protectedTokenCount: number): number {
  const tokens = input.match(/[A-Za-z0-9._%+-]+/g) ?? [];
  if (tokens.length === 0) return 0;
  const englishHits = tokens.filter((token) =>
    /^[A-Z0-9]{2,}$/.test(token) ||
    /^https?:\/\//i.test(token) ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token) ||
    /^(?:file|form|field|report|online|system|record|output|user|candidate|phrase|detect)$/i.test(token)
  ).length;
  return clamp01((englishHits + protectedTokenCount) / Math.max(1, tokens.length));
}
