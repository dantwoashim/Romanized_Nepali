export type LegacyAtom =
  | { kind: "consonant"; value: string; source: string }
  | { kind: "vowel-sign"; value: string; source: string }
  | { kind: "halant"; value: string; source: string }
  | { kind: "ra-marker"; value: string; source: string }
  | { kind: "nukta"; value: string; source: string }
  | { kind: "digit"; value: string; source: string }
  | { kind: "punct"; value: string; source: string }
  | { kind: "ascii"; value: string; source: string }
  | { kind: "unknown"; value: string; source: string };

export function atomKindForUnicode(value: string): LegacyAtom["kind"] {
  if (/[\u0915-\u0939\u0958-\u095F]/.test(value)) return "consonant";
  if (/[\u093E-\u094C\u0901-\u0903]/.test(value)) return "vowel-sign";
  if (value.includes("\u094D")) return "halant";
  if (value.includes("र्") || value.includes("र")) return "ra-marker";
  if (/\d/.test(value)) return "digit";
  if (/^[,.;:!?।()\[\]{}-]+$/.test(value)) return "punct";
  if (/^[\x20-\x7E]+$/.test(value)) return "ascii";
  return "unknown";
}
