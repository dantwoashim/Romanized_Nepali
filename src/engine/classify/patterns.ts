export const ROMANIZED_CUES = [
  "chh",
  "kh",
  "gh",
  "nya",
  "gya",
  "tra",
  "shr",
  "sh",
  "ksh",
  "pr",
  "kr"
];

export const ROMANIZED_POSTPOSITIONS = ["ko", "le", "lai", "ma", "haru", "bata", "sanga", "ra"];

export const PREETI_SEQUENCES = ["]f", ";]", "cf", "8f", "}f", ";f", "g]", "k|", "l/"];

export const OFFICE_PATTERNS = [
  /\bForm No\.?\b/i,
  /\bWard No\.?\b/i,
  /\bNID\b/,
  /\bPAN\b/,
  /\bVAT\b/,
  /\bPDF\b/,
  /\bX-ray\b/i,
  /\bemail\b/i,
  /\bfile\b/i,
  /\breport\b/i,
  /\b\d{4}-\d{2,}\b/
];

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function ratio(part: number, total: number): number {
  return total === 0 ? 0 : part / total;
}
