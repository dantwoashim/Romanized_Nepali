const PRESERVE_WORDS = new Set([
  "address",
  "browser",
  "cache",
  "candidate",
  "check",
  "code",
  "correct",
  "data",
  "date",
  "detect",
  "document",
  "email",
  "english",
  "field",
  "file",
  "final",
  "folder",
  "form",
  "id",
  "link",
  "mobile",
  "no",
  "number",
  "office",
  "online",
  "output",
  "pdf",
  "phone",
  "phrase",
  "record",
  "report",
  "save",
  "submit",
  "system",
  "test",
  "token",
  "upload",
  "url",
  "user",
  "ward",
  "wrong",
  "xray",
  "x-ray"
]);

const LOANWORD_WORDS = new Set([
  "convert",
  "digital",
  "font",
  "grade",
  "online",
  "report",
  "system",
  "unicode"
]);

export function isKnownEnglishPreserveWord(input: string): boolean {
  return PRESERVE_WORDS.has(input.toLowerCase());
}

export function isKnownLoanwordCandidate(input: string): boolean {
  return LOANWORD_WORDS.has(input.toLowerCase());
}

export function isAllCapsAcronym(input: string): boolean {
  return /^[A-Z][A-Z0-9]{1,}$/.test(input);
}

export function isLikelyEnglishRun(input: string): boolean {
  if (isKnownEnglishPreserveWord(input)) return true;
  if (isAllCapsAcronym(input)) return true;
  return /^[A-Z][a-z]+$/.test(input);
}

export function englishPreserveWords(): string[] {
  return [...PRESERVE_WORDS].sort();
}
