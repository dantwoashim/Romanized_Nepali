import { clusterRules, consonantRules, explicitPunctuation, vowelRules, VIRAMA } from "../../core/transliteration/romanizationRules";
import type { MaxMatchRule } from "./maxMatch";

export { VIRAMA };

export const GENERIC_CONJUNCT_PAIRS = [
  "rk",
  "rs",
  "rv",
  "rm",
  "rn",
  "ry",
  "sw",
  "kt",
  "lt",
  "nd",
  "mb",
  "mp",
  "nm",
  "nt",
  "st",
  "sk",
  "sp",
  "rt",
  "rd",
  "lp",
  "rsh",
  "ksh",
  "ddh",
  "jny",
  "gny",
  "pr",
  "tr",
  "dy",
  "ty"
] as const;

export const ROMANIZED_MAX_MATCH_RULES: MaxMatchRule<string>[] = [
  ...Object.entries(explicitPunctuation).map(([input, output]) => ({ input, output, weight: 1 })),
  ...clusterRules.map((rule) => ({ input: rule.input, output: rule.output, weight: 4 })),
  ...consonantRules.map((rule) => ({ input: rule.input, output: rule.output, weight: 3 })),
  ...vowelRules.map((rule) => ({ input: rule.input, output: rule.independent, weight: 2 })),
  { input: "ri", output: "ऋ", weight: 2 },
  { input: "Ri", output: "ऋ", weight: 2 }
];
