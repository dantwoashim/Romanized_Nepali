import type { LegacyAtom } from "./types";

const INDEPENDENT_VOWEL = /[\u0904-\u0914]/;
const CONSONANT = /[\u0915-\u0939\u0958-\u095F]/;
const DEPENDENT_VOWEL = /[\u093E-\u094C]/;
const DIGIT = /[\u0966-\u096F0-9]/;
const PUNCTUATION = /^[,.;:!?।()[\]{}\-_/]+$/;

export type { LegacyAtom } from "./types";

export function atomsFromUnicodePreview(preview: string, source: string): LegacyAtom[] {
  if (preview === "") return [];
  const chars = Array.from(preview.normalize("NFC"));
  const atoms: LegacyAtom[] = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const next = chars[index + 1];

    if (char === "र" && next === "्") {
      atoms.push({ kind: "reph-marker", value: "र्", source });
      index += 1;
      continue;
    }

    if (char === "्" && next === "र") {
      atoms.push({ kind: "rakar-marker", value: "्र", source });
      index += 1;
      continue;
    }

    atoms.push(atomFromUnicodeChar(char, source));
  }

  return atoms;
}

export function atomFromUnicodeChar(value: string, source: string): LegacyAtom {
  if (value === "्") return { kind: "virama", value: "्", source };
  if (value === "़") return { kind: "nukta", value, source };
  if (value === "ं") return { kind: "anusvara", value, source };
  if (value === "ँ") return { kind: "chandrabindu", value, source };
  if (value === "ः") return { kind: "visarga", value, source };
  if (value === "ि") return { kind: "dependent-vowel", value, source, position: "prebase" };
  if (DEPENDENT_VOWEL.test(value)) return { kind: "dependent-vowel", value, source, position: dependentVowelPosition(value) };
  if (INDEPENDENT_VOWEL.test(value)) return { kind: "independent-vowel", value, source };
  if (CONSONANT.test(value)) return { kind: "consonant", value, source };
  if (DIGIT.test(value)) return { kind: "digit", value, source };
  if (/^\s+$/.test(value)) return { kind: "whitespace", value, source };
  if (PUNCTUATION.test(value)) return { kind: "punctuation", value, source };
  return { kind: "unknown", value, source };
}

export function atomUnicodeValue(atom: LegacyAtom): string {
  return atom.value;
}

export function atomKindForUnicode(value: string): LegacyAtom["kind"] {
  const atom = atomFromUnicodeChar(value, value);
  if (atom.kind === "punctuation") return "punctuation";
  if (atom.kind === "dependent-vowel") return "dependent-vowel";
  return atom.kind;
}

function dependentVowelPosition(value: string): "postbase" | "above" | "below" | "split" {
  if (value === "ु" || value === "ू" || value === "ृ") return "below";
  if (value === "े" || value === "ै") return "above";
  if (value === "ो" || value === "ौ") return "split";
  return "postbase";
}
