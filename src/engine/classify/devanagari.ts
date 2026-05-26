import { ratio } from "./patterns";

export function devanagariRatio(input: string): number {
  const chars = [...input].filter((char) => !/\s/.test(char));
  const devanagari = chars.filter((char) => /[\u0900-\u097F]/.test(char)).length;
  return ratio(devanagari, chars.length);
}

export function isMostlyDevanagari(input: string): boolean {
  return devanagariRatio(input) > 0.55;
}
