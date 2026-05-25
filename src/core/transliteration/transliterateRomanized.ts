import { lookupByRomanized } from "../dictionary/loadSeedWords";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate, RomanizedResult, TokenTrace } from "../types";
import { uniqueRankedCandidates } from "./candidateRanker";
import {
  hasIntentionalCapitalPhoneme,
  isLikelyEnglishToken,
  normalizeRomanizedToken
} from "./latinNormalize";
import { composeRomanizedToken } from "./devanagariComposer";

export type RomanizationProfile = "common-nepali" | "google-like" | "strict-phonetic" | "experimental";

interface TokenConversion {
  output: string;
  candidates: Candidate[];
  trace: TokenTrace[];
}

const TOKEN_PATTERN =
  /(https?:\/\/\S+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z]+|\|\||\d+|\r?\n|[^\S\r\n]+|.)/g;

export function transliterateRomanized(
  input: string,
  profile: RomanizationProfile = "common-nepali"
): RomanizedResult {
  const tokens = input.match(TOKEN_PATTERN) ?? [];
  const conversions = tokens.map((token) => convertToken(token, profile));
  const output = conversions.map((conversion) => conversion.output).join("");
  const normalizedOutput = normalizeNepaliText(output);
  const candidates = uniqueRankedCandidates(
    [
      {
        text: normalizedOutput,
        normalizedText: normalizedOutput,
        score: 1000,
        source: conversions.some((conversion) => conversion.candidates.some((candidate) => candidate.source === "dictionary"))
          ? "dictionary"
          : "rule",
        reason: "Default full output"
      },
      ...conversions.flatMap((conversion) => conversion.candidates)
    ],
    12
  );

  return {
    input,
    output,
    normalizedOutput,
    warnings: [],
    candidates,
    trace: conversions.flatMap((conversion) => conversion.trace)
  };
}

function convertToken(token: string, profile: RomanizationProfile): TokenConversion {
  if (!/[A-Za-z]/.test(token)) {
    const output = token === "||" ? "।" : token;
    return {
      output,
      candidates: output === token ? [] : [{ text: output, normalizedText: output, score: 700, source: "rule", reason: "Explicit danda notation" }],
      trace: output === token ? [] : [{ input: token, output, rule: "explicit-punctuation" }]
    };
  }

  if (isLikelyEnglishToken(token)) {
    const dictionaryCandidates = dictionaryCandidatesForToken(token, "Preserved likely English token; Nepali loanword candidate");
    return {
      output: token,
      candidates: dictionaryCandidates,
      trace: [{ input: token, output: token, rule: "preserve-english", notes: ["Likely technical English, URL, email, or acronym."] }]
    };
  }

  const normalizedToken = normalizeRomanizedToken(token);
  const dictionaryEntries = hasIntentionalCapitalPhoneme(token) ? [] : lookupByRomanized(normalizedToken);
  const ruleConversion = composeRomanizedToken(token);
  const variantCandidates = ambiguityCandidates(token, ruleConversion.output);

  if (dictionaryEntries.length > 0) {
    const top = dictionaryEntries[0];
    const dictionaryCandidates: Candidate[] = dictionaryEntries.map((entry, index) => ({
      text: entry.word,
      normalizedText: entry.normalizedWord,
      score: entry.frequency + 300 - index,
      source: entry.source.includes("alias") ? "variant" : "dictionary",
      reason: entry.source.includes("alias") ? "Dictionary alias matched this spelling" : "Exact local dictionary match"
    }));

    if (normalizeNepaliText(ruleConversion.output) !== top.normalizedWord) {
      dictionaryCandidates.push({
        text: ruleConversion.output,
        normalizedText: normalizeNepaliText(ruleConversion.output),
        score: 620,
        source: "rule",
        reason: "Rule-only parse candidate"
      });
    }

    return {
      output: top.word,
      candidates: uniqueRankedCandidates([...dictionaryCandidates, ...variantCandidates], 8),
      trace: [
        {
          input: token,
          output: top.word,
          rule: "dictionary-rank",
          notes: [`profile:${profile}`, `romanized:${top.romanized}`]
        },
        ...ruleConversion.trace
      ]
    };
  }

  return {
    output: ruleConversion.output,
    candidates: uniqueRankedCandidates(
      [
        {
          text: ruleConversion.output,
          normalizedText: normalizeNepaliText(ruleConversion.output),
          score: 700,
          source: "rule",
          reason: "Longest-match common-nepali rule parse"
        },
        ...variantCandidates
      ],
      8
    ),
    trace: ruleConversion.trace
  };
}

function dictionaryCandidatesForToken(token: string, reason: string): Candidate[] {
  return lookupByRomanized(normalizeRomanizedToken(token)).map((entry, index) => ({
    text: entry.word,
    normalizedText: entry.normalizedWord,
    score: entry.frequency + 120 - index,
    source: "dictionary",
    reason
  }));
}

function ambiguityCandidates(token: string, defaultOutput: string): Candidate[] {
  const lower = token.toLowerCase();
  const candidates: Candidate[] = [];

  if (lower.includes("sh")) {
    pushVariant(candidates, token, { sh: "ष" }, 560, "plain sh can have a formal ष variant");
    pushVariant(candidates, token, { sh: "स" }, 520, "plain sh can be typed where users expect स");
  }

  if (token.includes("Sh") || token.includes("S")) {
    pushVariant(candidates, token, { Sh: "श", S: "श" }, 555, "capital Sh/S has a श secondary candidate");
  }

  if (lower.includes("ch") && !lower.includes("chh")) {
    pushVariant(candidates, token, { ch: "छ" }, 540, "ch has छ as a secondary candidate");
  }

  if (lower.startsWith("ri")) {
    const riVariant = composeRomanizedToken(token, { forceInitialRiAsVowel: true }).output;
    candidates.push({
      text: riVariant,
      normalizedText: normalizeNepaliText(riVariant),
      score: 550,
      source: "variant",
      reason: "initial ri can be ऋ for known classical/formal words"
    });
  }

  if (lower.includes("gya")) {
    const literal = defaultOutput.replace(/ज्ञ/g, "ग्या");
    candidates.push({
      text: literal,
      normalizedText: normalizeNepaliText(literal),
      score: 500,
      source: "variant",
      reason: "literal ग्या secondary candidate for gya"
    });
  }

  if (lower.includes("x") || lower.includes("ksh")) {
    const rare = defaultOutput.replace(/क्ष/g, "क्श");
    candidates.push({
      text: rare,
      normalizedText: normalizeNepaliText(rare),
      score: 480,
      source: "variant",
      reason: "rare क्श spelling candidate for x/ksh"
    });
  }

  return uniqueRankedCandidates(candidates, 8);
}

function pushVariant(
  candidates: Candidate[],
  token: string,
  overrides: Record<string, string>,
  score: number,
  reason: string
) {
  const variant = composeRomanizedToken(token, { consonantOverrides: overrides }).output;
  candidates.push({
    text: variant,
    normalizedText: normalizeNepaliText(variant),
    score,
    source: "variant",
    reason
  });
}
