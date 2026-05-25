const ZERO_WIDTH_SAFE_REMOVE = /[\u200B\u2060\uFEFF]/g;
const HORIZONTAL_SPACE_RUN = /[ \t\f\v]+/g;
const SPACE_BEFORE_NEWLINE = /[ \t]+\n/g;
const NEWLINE_SPACE = /\n[ \t]+/g;

const punctuationMap: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u00A0": " "
};

export function normalizeNepaliText(input: string): string {
  if (!input) return "";

  const normalizedPunctuation = Array.from(input)
    .map((char) => punctuationMap[char] ?? char)
    .join("");

  return normalizedPunctuation
    .replace(ZERO_WIDTH_SAFE_REMOVE, "")
    .replace(/\r\n?/g, "\n")
    .replace(HORIZONTAL_SPACE_RUN, " ")
    .replace(SPACE_BEFORE_NEWLINE, "\n")
    .replace(NEWLINE_SPACE, "\n")
    .normalize("NFC");
}

export function normalizeCopyOutput(input: string): string {
  return normalizeNepaliText(input).trim();
}
