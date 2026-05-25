export interface VowelRule {
  input: string;
  independent: string;
  matra: string;
}

export interface ConsonantRule {
  input: string;
  output: string;
  notes?: string;
}

export const VIRAMA = "\u094D";

const conjunct = (...parts: string[]) => parts.join(VIRAMA);

export const vowelRules: VowelRule[] = [
  { input: "aa", independent: "आ", matra: "ा" },
  { input: "A", independent: "आ", matra: "ा" },
  { input: "ee", independent: "ई", matra: "ी" },
  { input: "ii", independent: "ई", matra: "ी" },
  { input: "I", independent: "ई", matra: "ी" },
  { input: "oo", independent: "ऊ", matra: "ू" },
  { input: "uu", independent: "ऊ", matra: "ू" },
  { input: "U", independent: "ऊ", matra: "ू" },
  { input: "ai", independent: "ऐ", matra: "ै" },
  { input: "au", independent: "औ", matra: "ौ" },
  { input: "a", independent: "अ", matra: "" },
  { input: "i", independent: "इ", matra: "ि" },
  { input: "u", independent: "उ", matra: "ु" },
  { input: "e", independent: "ए", matra: "े" },
  { input: "o", independent: "ओ", matra: "ो" }
].sort((a, b) => b.input.length - a.input.length);

export const clusterRules: ConsonantRule[] = [
  { input: "ksh", output: conjunct("क", "ष"), notes: "PHONOLOGY_CONTRACT ksh default" },
  { input: "jny", output: conjunct("ज", "ञ"), notes: "jnya known conjunct" },
  { input: "gy", output: conjunct("ज", "ञ"), notes: "gya known conjunct" },
  { input: "shr", output: conjunct("श", "र"), notes: "shra known conjunct" },
  { input: "tr", output: conjunct("त", "र"), notes: "tra known conjunct" },
  { input: "ddh", output: conjunct("द", "ध"), notes: "ddha conjunct" },
  { input: "tt", output: conjunct("त", "त"), notes: "tta conjunct" },
  { input: "dy", output: conjunct("द", "य"), notes: "dya conjunct" },
  { input: "ty", output: conjunct("त", "य"), notes: "tya conjunct" },
  { input: "ky", output: conjunct("क", "य"), notes: "kya conjunct" },
  { input: "ny", output: conjunct("न", "य"), notes: "nya conjunct" },
  { input: "bhr", output: `${conjunct("भ", "र")}`, notes: "bhr conjunct" },
  { input: "pr", output: conjunct("प", "र"), notes: "pra/pr conjunct" },
  { input: "kr", output: conjunct("क", "र"), notes: "kra/kr conjunct" },
  { input: "gr", output: conjunct("ग", "र"), notes: "gra/gr conjunct" },
  { input: "str", output: `${conjunct("स", "त")}${VIRAMA}र`, notes: "str candidate conjunct" }
].sort((a, b) => b.input.length - a.input.length);

export const consonantRules: ConsonantRule[] = [
  { input: "chh", output: "छ" },
  { input: "kh", output: "ख" },
  { input: "gh", output: "घ" },
  { input: "jh", output: "झ" },
  { input: "Th", output: "ठ" },
  { input: "Dh", output: "ढ" },
  { input: "th", output: "थ" },
  { input: "dh", output: "ध" },
  { input: "ph", output: "फ" },
  { input: "bh", output: "भ" },
  { input: "Sh", output: "ष" },
  { input: "sh", output: "श" },
  { input: "ng", output: "ङ" },
  { input: "T", output: "ट" },
  { input: "D", output: "ड" },
  { input: "N", output: "ण" },
  { input: "k", output: "क" },
  { input: "g", output: "ग" },
  { input: "c", output: "च" },
  { input: "ch", output: "च" },
  { input: "j", output: "ज" },
  { input: "t", output: "त" },
  { input: "d", output: "द" },
  { input: "n", output: "न" },
  { input: "p", output: "प" },
  { input: "f", output: "फ" },
  { input: "b", output: "ब" },
  { input: "m", output: "म" },
  { input: "y", output: "य" },
  { input: "r", output: "र" },
  { input: "l", output: "ल" },
  { input: "w", output: "व" },
  { input: "v", output: "व" },
  { input: "s", output: "स" },
  { input: "S", output: "ष" },
  { input: "h", output: "ह" },
  { input: "L", output: "ळ", notes: "candidate-only in contract; exposed by explicit capital." }
].sort((a, b) => b.input.length - a.input.length);

export const explicitPunctuation: Record<string, string> = {
  "||": "।"
};
