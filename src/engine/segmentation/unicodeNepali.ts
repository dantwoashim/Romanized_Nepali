export function isDevanagari(char: string | undefined): boolean {
  return Boolean(char && /[\u0900-\u097F]/.test(char));
}

export function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

export function devanagariRatio(text: string): number {
  const chars = [...text].filter((char) => !/\s/.test(char));
  if (chars.length === 0) return 0;
  return chars.filter(isDevanagari).length / chars.length;
}
