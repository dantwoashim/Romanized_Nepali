import type { EngineDiagnostic, ProtectedSpan } from "../types";
import { atomsFromUnicodePreview } from "./atoms";
import { LegacyMappingTrie } from "./trie";
import type { LegacyToken, LegacyTokenMapping, SemanticLegacyFontProfile } from "./types";

export interface TokenizeLegacyOptions {
  protectedSpans?: ProtectedSpan[];
}

const WHITESPACE = /^\s$/;
const PUNCTUATION = /^[,.;:!?।()[\]{}\-_/]$/;

export function tokenizeLegacy(input: string, profile: SemanticLegacyFontProfile, options: TokenizeLegacyOptions = {}): LegacyToken[] {
  const protectedByStart = new Map<number, ProtectedSpan>();
  for (const span of options.protectedSpans ?? []) {
    protectedByStart.set(span.range[0], span);
  }

  const trie = buildTrie(profile);
  const tokens: LegacyToken[] = [];
  let index = 0;

  while (index < input.length) {
    const protectedSpan = protectedByStart.get(index);
    if (protectedSpan) {
      tokens.push({
        source: protectedSpan.placeholder,
        range: protectedSpan.range,
        atoms: [{ kind: "protected-placeholder", value: protectedSpan.placeholder, source: protectedSpan.original }],
        kind: "protected-placeholder",
        profileId: profile.profileId,
        confidence: protectedSpan.confidence,
        diagnostics: []
      });
      index = protectedSpan.range[1];
      continue;
    }

    const char = input[index];
    if (WHITESPACE.test(char)) {
      const start = index;
      while (index < input.length && WHITESPACE.test(input[index])) index += 1;
      tokens.push({
        source: input.slice(start, index),
        range: [start, index],
        atoms: [{ kind: "whitespace", value: input.slice(start, index), source: input.slice(start, index) }],
        kind: "whitespace",
        profileId: profile.profileId,
        confidence: 1,
        diagnostics: []
      });
      continue;
    }

    const match = trie.longest(input, index);
    if (match && !crossesProtectedBoundary(index, match.end, options.protectedSpans ?? [])) {
      tokens.push(tokenFromMapping(match.mapping, [index, match.end], profile.profileId));
      index = match.end;
      continue;
    }

    if (PUNCTUATION.test(char)) {
      const mapping = profile.punctuationMap[char] ?? fallbackMapping(char, char, "punctuation");
      tokens.push({ ...tokenFromMapping(mapping, [index, index + char.length], profile.profileId), kind: "punctuation" });
      index += char.length;
      continue;
    }

    if (/[0-9]/.test(char)) {
      const mapping = profile.digitMap[char] ?? fallbackMapping(char, char, "digit");
      tokens.push({ ...tokenFromMapping(mapping, [index, index + char.length], profile.profileId), kind: "digit" });
      index += char.length;
      continue;
    }

    const diagnostic: EngineDiagnostic = {
      code: "LEGACY_UNKNOWN_TOKEN",
      message: `No ${profile.profileId} profile mapping for "${char}".`,
      severity: "warning",
      data: { source: char, index }
    };
    tokens.push({
      source: char,
      range: [index, index + char.length],
      atoms: [{ kind: "unknown", value: char, source: char }],
      kind: "unknown",
      profileId: profile.profileId,
      confidence: 0,
      diagnostics: [diagnostic]
    });
    index += char.length;
  }

  return tokens;
}

function buildTrie(profile: SemanticLegacyFontProfile): LegacyMappingTrie {
  const trie = new LegacyMappingTrie();
  const groups = [
    profile.sequenceTokenMap,
    profile.conjunctMap,
    profile.matraMap,
    profile.singleTokenMap,
    profile.digitMap,
    profile.punctuationMap
  ];

  for (const group of groups) {
    for (const [token, mapping] of Object.entries(group).sort((a, b) => b[0].length - a[0].length)) {
      trie.add(token, mapping);
    }
  }

  return trie;
}

function tokenFromMapping(mapping: LegacyTokenMapping, range: [number, number], profileId: string): LegacyToken {
  const mappedKind = /^[०-९0-9]$/.test(mapping.unicodePreview)
    ? "digit"
    : /^[,.;:!?।()[\]{}\-_/]$/.test(mapping.unicodePreview)
      ? "punctuation"
      : "mapped";

  return {
    source: mapping.token,
    range,
    mapping,
    atoms: mapping.atoms,
    kind: mappedKind,
    profileId,
    confidence: mapping.confidence === "high" ? 1 : mapping.confidence === "medium" ? 0.72 : 0.45,
    diagnostics: mapping.reviewStatus === "unknown"
      ? [{
          code: "LEGACY_UNKNOWN_REVIEW_STATUS",
          message: `Mapping for "${mapping.token}" is not reviewed.`,
          severity: "warning"
        }]
      : []
  };
}

function fallbackMapping(token: string, unicodePreview: string, notes: string): LegacyTokenMapping {
  return {
    token,
    unicodePreview,
    atoms: atomsFromUnicodePreview(unicodePreview, token),
    confidence: "medium",
    reviewStatus: "provisional",
    evidence: ["fallback tokenizer class"],
    notes
  };
}

function crossesProtectedBoundary(start: number, end: number, spans: ProtectedSpan[]): boolean {
  return spans.some((span) => start < span.range[1] && end > span.range[0] && !(start === span.range[0] && end === span.range[1]));
}
