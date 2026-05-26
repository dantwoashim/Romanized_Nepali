export type RomanizedNumberPolicy = "preserve-ascii" | "convert-devanagari" | "context-dependent";

const DEVANAGARI_ZERO = "०".charCodeAt(0);

export function applyRomanizedNumberPolicy(
  token: string,
  policy: RomanizedNumberPolicy,
  context = ""
): string {
  if (!/\d/.test(token)) return token;
  if (shouldPreserveAsciiNumber(token, context)) return token;
  if (policy === "convert-devanagari") return toDevanagariDigits(token);
  if (policy === "context-dependent" && isNepaliProseNumberContext(context)) return toDevanagariDigits(token);
  return token;
}

export function toDevanagariDigits(input: string): string {
  return input.replace(/\d/g, (digit) => String.fromCharCode(DEVANAGARI_ZERO + Number(digit)));
}

export function shouldPreserveAsciiNumber(token: string, context = ""): boolean {
  const contextText = `${context} ${token}`.toLowerCase();
  if (/^\d{7,}$/.test(token)) return true;
  if (/^\d+-\d+$/.test(token)) return true;
  if (/\b(?:form\s+no\.?|ward-|phone|mobile|nid|pan|vat|dob|id|url|email)\b/.test(contextText)) return true;
  return false;
}

function isNepaliProseNumberContext(context: string): boolean {
  return /\b(?:bi\.?sam\.?|bs|saal|sambat|bikram|arthik|barsa|barsha|miti)\b/i.test(context);
}
