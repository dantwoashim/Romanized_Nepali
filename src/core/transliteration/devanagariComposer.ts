import type { TokenTrace } from "../types";
import { VIRAMA, clusterRules, consonantRules, explicitPunctuation, vowelRules } from "./romanizationRules";

export interface ComposeOptions {
  clusterOverrides?: Record<string, string>;
  consonantOverrides?: Record<string, string>;
  forceInitialRiAsVowel?: boolean;
  genericHalanta?: boolean;
}

export interface ComposedToken {
  output: string;
  trace: TokenTrace[];
}

const GENERIC_CONJUNCT_PAIRS = new Set([
  "rk",
  "rm",
  "rn",
  "ry",
  "lt",
  "nd",
  "mb",
  "mp",
  "nt",
  "st",
  "sk",
  "sp",
  "rt",
  "rd",
  "lp"
]);

export function composeRomanizedToken(token: string, options: ComposeOptions = {}): ComposedToken {
  let index = 0;
  let output = "";
  const trace: TokenTrace[] = [];

  while (index < token.length) {
    const punctuation = matchExplicitPunctuation(token, index);
    if (punctuation) {
      output += punctuation.output;
      trace.push({ input: punctuation.input, output: punctuation.output, rule: "explicit-punctuation" });
      index += punctuation.input.length;
      continue;
    }

    if (options.forceInitialRiAsVowel && index === 0 && token.slice(0, 2).toLowerCase() === "ri") {
      output += "ऋ";
      trace.push({ input: token.slice(0, 2), output: "ऋ", rule: "ri-initial-variant" });
      index += 2;
      continue;
    }

    const cluster = matchCluster(token, index, options.clusterOverrides);
    if (cluster) {
      const { consumed, rendered, trace: consonantTrace } = appendWithOptionalVowel(
        token,
        index,
        cluster.input.length,
        cluster.output,
        `cluster:${cluster.input}`,
        cluster.notes,
        options
      );
      output += rendered;
      trace.push(consonantTrace);
      index += consumed;
      continue;
    }

    const consonant = matchConsonant(token, index, options.consonantOverrides);
    if (consonant) {
      const { consumed, rendered, trace: consonantTrace } = appendWithOptionalVowel(
        token,
        index,
        consonant.input.length,
        consonant.output,
        `consonant:${consonant.input}`,
        consonant.notes,
        options
      );
      output += rendered;
      trace.push(consonantTrace);
      index += consumed;
      continue;
    }

    const vowel = matchVowel(token, index);
    if (vowel) {
      output += vowel.independent;
      trace.push({ input: token.slice(index, index + vowel.input.length), output: vowel.independent, rule: `vowel:${vowel.input}` });
      index += vowel.input.length;
      continue;
    }

    const char = token[index];
    output += char;
    trace.push({
      input: char,
      output: char,
      rule: "preserve-unknown",
      notes: ["Unknown Latin segment preserved for manual correction."]
    });
    index += 1;
  }

  return { output, trace };
}

function appendWithOptionalVowel(
  token: string,
  start: number,
  consonantLength: number,
  consonantOutput: string,
  rule: string,
  notes?: string,
  options: ComposeOptions = {}
) {
  const vowel = matchVowel(token, start + consonantLength);
  if (vowel) {
    const input = token.slice(start, start + consonantLength + vowel.input.length);
    const rendered = consonantOutput + vowel.matra;
    return {
      consumed: consonantLength + vowel.input.length,
      rendered,
      trace: {
        input,
        output: rendered,
        rule,
        notes: [notes, vowel.matra ? `matra:${vowel.input}` : "inherent-vowel"].filter(Boolean) as string[]
      }
    };
  }

  const input = token.slice(start, start + consonantLength);
  const shouldJoinNext = options.genericHalanta !== false && hasConsonantOnset(token, start + consonantLength, input, options);
  const rendered = shouldJoinNext ? `${consonantOutput}${VIRAMA}` : consonantOutput;
  const traceNotes = [
    notes,
    shouldJoinNext ? "generic-halanta-before-consonant" : undefined
  ].filter(Boolean) as string[];

  return {
    consumed: consonantLength,
    rendered,
    trace: {
      input,
      output: rendered,
      rule,
      notes: traceNotes.length ? traceNotes : undefined
    }
  };
}

function matchCluster(token: string, index: number, overrides: Record<string, string> = {}) {
  const lower = token.slice(index).toLowerCase();
  for (const rule of clusterRules) {
    if (!lower.startsWith(rule.input)) continue;
    const input = token.slice(index, index + rule.input.length);
    const override = overrides[rule.input] ?? overrides[rule.input.toLowerCase()];
    return {
      ...rule,
      input,
      output: override ?? rule.output
    };
  }
  return undefined;
}

function matchConsonant(token: string, index: number, overrides: Record<string, string> = {}) {
  for (const rule of consonantRules) {
    const input = token.slice(index, index + rule.input.length);
    if (input === rule.input || input.toLowerCase() === rule.input) {
      const override = overrides[rule.input] ?? overrides[rule.input.toLowerCase()];
      return {
        ...rule,
        input,
        output: override ?? rule.output
      };
    }
  }
  return undefined;
}

function matchVowel(token: string, index: number) {
  for (const rule of vowelRules) {
    const input = token.slice(index, index + rule.input.length);
    if (input === rule.input || input.toLowerCase() === rule.input) {
      return rule;
    }
  }
  return undefined;
}

function matchExplicitPunctuation(token: string, index: number) {
  for (const [input, output] of Object.entries(explicitPunctuation)) {
    if (token.startsWith(input, index)) return { input, output };
  }
  return undefined;
}

function hasConsonantOnset(token: string, index: number, currentInput: string, options: ComposeOptions) {
  if (index >= token.length) return false;
  if (matchExplicitPunctuation(token, index)) return false;
  if (matchVowel(token, index)) return false;
  const cluster = matchCluster(token, index, options.clusterOverrides);
  const consonant = cluster ?? matchConsonant(token, index, options.consonantOverrides);
  if (!consonant) return false;

  const current = currentInput.toLowerCase();
  const next = consonant.input.toLowerCase();
  if (current.length > 1) return true;
  return GENERIC_CONJUNCT_PAIRS.has(`${current}${next[0]}`);
}
