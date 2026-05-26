import { normalizeRomanizedToken } from "../../core/transliteration/latinNormalize";
import type { RomanizedToken } from "./types";

const TOKEN_PATTERN =
  /(https?:\/\/\S+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|ward-\d+|[A-Za-z]+(?:[-'][A-Za-z]+)*|\d+(?:-\d+)*|\r?\n|[^\S\r\n]+|.)/g;

export function tokenizeRomanized(input: string): RomanizedToken[] {
  const tokens: RomanizedToken[] = [];
  for (const match of input.matchAll(TOKEN_PATTERN)) {
    const text = match[0];
    const start = match.index ?? 0;
    tokens.push({
      text,
      normalized: normalizeRomanizedToken(text),
      range: [start, start + text.length],
      kind: classifyToken(text)
    });
  }
  return tokens;
}

function classifyToken(text: string): RomanizedToken["kind"] {
  if (/^\s+$/.test(text)) return "space";
  if (/^(https?:\/\/\S+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(text)) return "protected";
  if (/^ward-\d+$/i.test(text)) return "protected";
  if (/^\d+(?:-\d+)*$/.test(text)) return "number";
  if (/^[A-Za-z]+(?:[-'][A-Za-z]+)*$/.test(text)) return "word";
  if (/^[^\p{L}\p{N}\s]+$/u.test(text)) return "punctuation";
  return "unknown";
}
