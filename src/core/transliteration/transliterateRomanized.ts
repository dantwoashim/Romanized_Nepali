import { lookupByRomanized } from "../dictionary/loadSeedWords";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { Candidate, RomanizedResult, TokenTrace } from "../types";
import { uniqueRankedCandidates } from "./candidateRanker";
import { localCorrectionCandidates, type LocalCorrection } from "./localCorrectionMemory";
import {
  canonicalEnglishToken,
  hasIntentionalCapitalPhoneme,
  isLikelyEnglishToken,
  normalizeRomanizedToken,
  normalizeRomanizedTokenForParsing
} from "./latinNormalize";
import { composeRomanizedToken } from "./devanagariComposer";
import { phraseCandidatesForInput } from "./phraseRanker";
import { weightedRepairCandidates } from "./repairCandidates";

export type RomanizationProfile = "common-nepali" | "google-like" | "strict-phonetic" | "experimental";

export interface TransliterateOptions {
  useDictionary?: boolean;
  localCorrections?: LocalCorrection[];
}

const SCORE = {
  exactAlias: 1800,
  domainDictionary: 1200,
  defaultFullOutput: 1000,
  rule: 700
};

const BEAM_ALTERNATIVE_MAX_SCORE = SCORE.defaultFullOutput - 1;

interface TokenConversion {
  input: string;
  output: string;
  candidates: Candidate[];
  trace: TokenTrace[];
}

interface BeamPath {
  parts: string[];
  score: number;
  replacements: number;
  reasons: string[];
  sources: Set<Candidate["source"]>;
}

const TOKEN_PATTERN =
  /(https?:\/\/\S+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z]+|\|\||\d+|\r?\n|[^\S\r\n]+|.)/g;

export function transliterateRomanized(
  input: string,
  profile: RomanizationProfile = "common-nepali",
  options: TransliterateOptions = {}
): RomanizedResult {
  const tokens = input.match(TOKEN_PATTERN) ?? [];
  const conversions = tokens.map((token) => convertToken(token, profile, options));
  const defaultOutput = conversions.map((conversion) => conversion.output).join("");
  const normalizedDefaultOutput = normalizeNepaliText(defaultOutput);
  const latticeCandidates = buildFullOutputCandidates(input, conversions, normalizedDefaultOutput, options.localCorrections ?? []);
  const selectedOutput = latticeCandidates[0]?.normalizedText ?? normalizedDefaultOutput;
  const output = selectedOutput;
  const normalizedOutput = normalizeNepaliText(selectedOutput);
  const candidates = uniqueRankedCandidates(
    [
      ...latticeCandidates,
      ...buildTokenReplacementCandidates(conversions)
    ],
    12
  );

  return {
    input,
    output,
    normalizedOutput,
    warnings: [],
    candidates,
    trace: [
      {
        input,
        output: normalizedOutput,
        rule: "candidate-lattice",
        notes: ["full-output ranking", `profile:${profile}`, `winner:${latticeCandidates[0]?.reason ?? "default"}`]
      },
      ...conversions.flatMap((conversion) => conversion.trace)
    ]
  };
}

function convertToken(token: string, profile: RomanizationProfile, options: TransliterateOptions): TokenConversion {
  if (!/[A-Za-z]/.test(token)) {
    const output = token === "||" ? "।" : token;
    return {
      input: token,
      output,
      candidates: output === token ? [] : [{ text: output, normalizedText: output, score: 700, source: "rule", reason: "Explicit danda notation" }],
      trace: output === token ? [] : [{ input: token, output, rule: "explicit-punctuation" }]
    };
  }

  if (isLikelyEnglishToken(token)) {
    const output = canonicalEnglishToken(token);
    const dictionaryCandidates = options.useDictionary === false
      ? []
      : dictionaryCandidatesForToken(token, "Preserved likely English token; Nepali loanword candidate");
    return {
      input: token,
      output,
      candidates: dictionaryCandidates,
      trace: [{ input: token, output, rule: "preserve-english", notes: ["Likely technical English, URL, email, or acronym."] }]
    };
  }

  const normalizedToken = normalizeRomanizedToken(token);
  const dictionaryEntries = options.useDictionary === false || hasIntentionalCapitalPhoneme(token) ? [] : lookupByRomanized(normalizedToken);
  const parseToken = normalizeRomanizedTokenForParsing(token);
  const ruleConversion = composeRomanizedToken(parseToken);
  const variantCandidates = ambiguityCandidates(parseToken, ruleConversion.output);

  if (dictionaryEntries.length > 0) {
    const top = dictionaryEntries[0];
    const dictionaryCandidates: Candidate[] = dictionaryEntries.map((entry, index) => ({
      text: entry.word,
      normalizedText: entry.normalizedWord,
      score: (entry.source.includes("alias") ? SCORE.exactAlias : SCORE.domainDictionary) + Math.floor(entry.frequency / 10) - index,
      source: entry.source.includes("alias") ? "variant" : "dictionary",
      reason: entry.source.includes("alias") ? "Exact reviewed alias matched this spelling" : "Domain/frequency local dictionary match"
    }));

    if (normalizeNepaliText(ruleConversion.output) !== top.normalizedWord) {
      dictionaryCandidates.push({
        text: ruleConversion.output,
        normalizedText: normalizeNepaliText(ruleConversion.output),
        score: SCORE.rule,
        source: "rule",
        reason: "Rule-only parse candidate"
      });
    }

    return {
      input: token,
      output: top.word,
      candidates: uniqueRankedCandidates([...dictionaryCandidates, ...nameVariantCandidates(normalizedToken), ...variantCandidates], 8),
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

  const compoundCandidates = options.useDictionary === false ? [] : compoundCandidatesForToken(normalizedToken);
  if (compoundCandidates.length > 0) {
    const top = compoundCandidates[0];
    return {
      input: token,
      output: top.text,
      candidates: uniqueRankedCandidates([...compoundCandidates, ...variantCandidates], 8),
      trace: [
        {
          input: token,
          output: top.text,
          rule: "compound-dictionary-rank",
          notes: [`profile:${profile}`, "split known romanized pieces before falling back to rule-only parse"]
        },
        ...ruleConversion.trace
      ]
    };
  }

  if (normalizedToken.includes("x")) {
    return {
      input: token,
      output: token,
      candidates: uniqueRankedCandidates(
        [
          {
            text: token,
            normalizedText: token,
            score: 710,
            source: "rule",
            reason: "x is preserved unless a dictionary/profile candidate is selected"
          },
          ...variantCandidates
        ],
        8
      ),
      trace: [
        {
          input: token,
          output: token,
          rule: "preserve-x",
          notes: ["x is candidate/profile-dependent in the common-nepali profile."]
        }
      ]
    };
  }

  return {
    input: token,
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

function buildFullOutputCandidates(
  input: string,
  conversions: TokenConversion[],
  normalizedDefaultOutput: string,
  localCorrections: LocalCorrection[]
): Candidate[] {
  const usedDictionary = conversions.some((conversion) =>
    conversion.candidates.some((candidate) => candidate.source === "dictionary")
  );

  return uniqueRankedCandidates(
    [
      ...localCorrectionCandidates(input, localCorrections),
      ...phraseCandidatesForInput(input),
      ...buildBeamFullOutputCandidates(conversions, normalizedDefaultOutput),
      {
        text: normalizedDefaultOutput,
        normalizedText: normalizedDefaultOutput,
        score: SCORE.defaultFullOutput,
        source: usedDictionary ? "dictionary" : "rule",
        reason: "Default full output from lattice top path"
      }
    ],
    8
  );
}

function buildBeamFullOutputCandidates(conversions: TokenConversion[], normalizedDefaultOutput: string): Candidate[] {
  let beams: BeamPath[] = [
    {
      parts: [],
      score: 0,
      replacements: 0,
      reasons: [],
      sources: new Set()
    }
  ];

  for (const conversion of conversions) {
    const alternatives = tokenBeamAlternatives(conversion);
    const nextBeams: BeamPath[] = [];

    for (const beam of beams) {
      for (const alternative of alternatives) {
        const isReplacement = alternative.normalizedText !== normalizeNepaliText(conversion.output);
        const nextSources = new Set(beam.sources);
        if (isReplacement) nextSources.add(alternative.source);
        nextBeams.push({
          parts: [...beam.parts, alternative.normalizedText],
          score: beam.score + (isReplacement ? Math.max(2, (alternative.score - 650) / 10) : 0),
          replacements: beam.replacements + (isReplacement ? 1 : 0),
          reasons: isReplacement ? [...beam.reasons, `${conversion.input}:${alternative.reason}`] : beam.reasons,
          sources: nextSources
        });
      }
    }

    beams = nextBeams.sort((a, b) => scoreBeam(b) - scoreBeam(a)).slice(0, 16);
  }

  return uniqueRankedCandidates(
    beams
      .filter((beam) => beam.replacements > 0 && (beam.sources.has("dictionary") || beam.sources.has("user-feedback")))
      .map((beam): Candidate => {
        const normalizedText = normalizeNepaliText(beam.parts.join(""));
        const source = beam.sources.has("user-feedback")
          ? "user-feedback"
          : beam.sources.has("dictionary")
            ? "dictionary"
            : beam.sources.has("variant")
              ? "variant"
              : "rule";

        return {
          text: normalizedText,
          normalizedText,
          score: Math.min(BEAM_ALTERNATIVE_MAX_SCORE, 930 + Math.round(scoreBeam(beam) / 4)),
          source,
          reason: `Combined ${beam.replacements} token-level candidates: ${beam.reasons.slice(0, 4).join("; ")}`
        };
      })
      .filter((candidate) => candidate.normalizedText !== normalizedDefaultOutput),
    8
  );
}

function tokenBeamAlternatives(conversion: TokenConversion): Candidate[] {
  const base = normalizeNepaliText(conversion.output);
  if (conversion.trace.some((trace) => trace.rule === "preserve-english")) {
    return [
      {
        text: base,
        normalizedText: base,
        score: SCORE.defaultFullOutput,
        source: "rule",
        reason: "preserved English token path"
      }
    ];
  }

  return uniqueRankedCandidates(
    [
      {
        text: base,
        normalizedText: base,
        score: SCORE.defaultFullOutput,
        source: "rule",
        reason: "default token path"
      },
      ...conversion.candidates
    ],
    5
  );
}

function scoreBeam(beam: BeamPath): number {
  return beam.score + beam.replacements * 8;
}

function buildTokenReplacementCandidates(conversions: TokenConversion[]): Candidate[] {
  const baseParts = conversions.map((conversion) => conversion.output);
  const candidates: Candidate[] = [];

  conversions.forEach((conversion, index) => {
    for (const candidate of conversion.candidates) {
      if (candidate.normalizedText === normalizeNepaliText(conversion.output)) continue;
      const nextParts = [...baseParts];
      nextParts[index] = candidate.normalizedText;
      const fullOutput = normalizeNepaliText(nextParts.join(""));
      candidates.push({
        ...candidate,
        text: fullOutput,
        normalizedText: fullOutput,
        score: Math.min(candidate.score, 990),
        reason: `${candidate.reason}; token alternative for "${conversion.input}"`
      });
    }
  });

  return uniqueRankedCandidates(candidates, 12);
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

function nameVariantCandidates(token: string): Candidate[] {
  if (token === "niraj") {
    return [
      {
        text: "नीरज",
        normalizedText: "नीरज",
        score: 650,
        source: "variant",
        reason: "Common name spelling variant for Niraj/Neeraj"
      }
    ];
  }
  if (token === "neeraj") {
    return [
      {
        text: "निरज",
        normalizedText: "निरज",
        score: 640,
        source: "variant",
        reason: "Common name spelling variant for Niraj/Neeraj"
      }
    ];
  }
  return [];
}

function compoundCandidatesForToken(token: string): Candidate[] {
  if (token.length < 6 || !/^[a-z]+$/.test(token)) return [];
  const candidates: Candidate[] = [];

  for (let split = 2; split <= token.length - 2; split += 1) {
    const left = token.slice(0, split);
    const right = token.slice(split);
    const leftEntries = lookupByRomanized(left);
    const rightEntries = lookupByRomanized(right);
    const rightEnglish = isLikelyEnglishToken(right) ? canonicalEnglishToken(right) : undefined;
    const leftEnglish = isLikelyEnglishToken(left) ? canonicalEnglishToken(left) : undefined;

    if (leftEntries.length > 0 && rightEnglish) {
      pushCompoundCandidate(candidates, left, right, leftEntries[0].normalizedWord, rightEnglish, leftEntries[0].frequency + 2200);
      continue;
    }
    if (leftEnglish && rightEntries.length > 0) {
      pushCompoundCandidate(candidates, left, right, leftEnglish, rightEntries[0].normalizedWord, rightEntries[0].frequency + 2200);
      continue;
    }
    if (leftEntries.length > 0 && rightEntries.length > 0) {
      pushCompoundCandidate(candidates, left, right, leftEntries[0].normalizedWord, rightEntries[0].normalizedWord, leftEntries[0].frequency + rightEntries[0].frequency);
    }
  }

  return uniqueRankedCandidates(candidates, 6);
}

function pushCompoundCandidate(
  candidates: Candidate[],
  leftInput: string,
  rightInput: string,
  leftOutput: string,
  rightOutput: string,
  scoreBasis: number
) {
  const normalizedText = normalizeNepaliText(`${leftOutput}${rightOutput}`);
  candidates.push({
    text: normalizedText,
    normalizedText,
    score: 1080 + Math.min(180, Math.floor(scoreBasis / 20)),
    source: "dictionary",
    reason: `Compound candidate from "${leftInput}" + "${rightInput}"`
  });
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
    const literalToken = token.replace(/gya/gi, (match) => `${match.slice(0, 2)}aa`);
    const literal = composeRomanizedToken(literalToken, { clusterOverrides: { gy: "ग्य" } }).output;
    candidates.push({
      text: literal,
      normalizedText: normalizeNepaliText(literal),
      score: 500,
      source: "variant",
      reason: "literal ग्या secondary candidate for gya"
    });
  }

  if (lower.includes("x")) {
    const kshCandidate = composeRomanizedToken(token.replace(/x/gi, "ksh")).output;
    candidates.push({
      text: kshCandidate,
      normalizedText: normalizeNepaliText(kshCandidate),
      score: 540,
      source: "variant",
      reason: "x can be selected as क्ष by profile or dictionary candidate"
    });
  }

  if (lower.includes("ksh")) {
    const rare = composeRomanizedToken(token, { clusterOverrides: { ksh: "क्" + "श" } }).output;
    candidates.push({
      text: rare,
      normalizedText: normalizeNepaliText(rare),
      score: 480,
      source: "variant",
      reason: "rare क्श spelling candidate for ksh"
    });
  }

  if (/[bcdfghjklmnpqrstvwxyz]/i.test(token) && /्/.test(defaultOutput)) {
    const noGenericHalanta = composeRomanizedToken(token, { genericHalanta: false }).output;
    if (normalizeNepaliText(noGenericHalanta) !== normalizeNepaliText(defaultOutput)) {
      candidates.push({
        text: noGenericHalanta,
        normalizedText: normalizeNepaliText(noGenericHalanta),
        score: 455,
        source: "variant",
        reason: "non-conjunct parse candidate for ambiguous consonant sequence"
      });
    }
  }

  return uniqueRankedCandidates([...candidates, ...weightedRepairCandidates(token, defaultOutput)], 8);
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
