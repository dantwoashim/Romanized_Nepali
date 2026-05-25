import type { TokenTrace } from "../types";
import { clusterRules, consonantRules, explicitPunctuation, vowelRules } from "./romanizationRules";

export interface ComposeOptions {
  consonantOverrides?: Record<string, string>;
  forceInitialRiAsVowel?: boolean;
}

export interface ComposedToken {
  output: string;
  trace: TokenTrace[];
}

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

    const cluster = matchCluster(token, index);
    if (cluster) {
      const { consumed, rendered, trace: consonantTrace } = appendWithOptionalVowel(
        token,
        index,
        cluster.input.length,
        cluster.output,
        `cluster:${cluster.input}`,
        cluster.notes
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
        consonant.notes
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
  notes?: string
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
  return {
    consumed: consonantLength,
    rendered: consonantOutput,
    trace: {
      input,
      output: consonantOutput,
      rule,
      notes: notes ? [notes] : undefined
    }
  };
}

function matchCluster(token: string, index: number) {
  const lower = token.slice(index).toLowerCase();
  return clusterRules.find((rule) => lower.startsWith(rule.input));
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
