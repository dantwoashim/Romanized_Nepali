const TECHNICAL_ENGLISH = new Set([
  "nid",
  "pdf",
  "excel",
  "word",
  "form",
  "field",
  "date",
  "email",
  "url",
  "http",
  "https"
]);

export function normalizeLatinInput(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRomanizedToken(token: string): string {
  return token.normalize("NFKC").toLowerCase();
}

export function isLikelyEnglishToken(token: string): boolean {
  if (/^https?:\/\//i.test(token)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token)) return true;
  if (/^[A-Z0-9]{2,}$/.test(token)) return true;
  return TECHNICAL_ENGLISH.has(token.toLowerCase());
}

export function hasIntentionalCapitalPhoneme(token: string): boolean {
  return /Sh|Th|Dh|(?<!^)[TDN]/.test(token);
}
