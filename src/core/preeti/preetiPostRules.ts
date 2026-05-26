const VIRAMA = "\u094D";
const SHORT_I = "\u093F";
const REPH = `र${VIRAMA}`;
const CONSONANT_PATTERN = /[\u0915-\u0939\u0958-\u095F]/;
const DEPENDENT_MARK_PATTERN = /[\u093C\u093E-\u094C\u0901-\u0903]/;

export function applyPreetiPostRules(input: string): string {
  if (!input) return "";

  return normalizeLegacyPunctuationAndSpacing(
    cleanupHalanta(
      repositionMalformedReph(
        repairInternalShortIClusters(
          reorderLeadingShortI(input)
        )
      )
    )
  ).normalize("NFC");
}

export function repairInternalShortIClusters(input: string): string {
  return input.replace(
    new RegExp(`(${CONSONANT_PATTERN.source})${SHORT_I}${VIRAMA}(${CONSONANT_PATTERN.source})`, "g"),
    `$1${VIRAMA}$2${SHORT_I}`
  );
}

export function cleanupHalanta(input: string): string {
  return input
    .replace(new RegExp(`${VIRAMA}{2,}`, "g"), VIRAMA)
    .replace(new RegExp(`${VIRAMA}([\\u093E-\\u094C\\u0901-\\u0903])`, "g"), "$1");
}

export function reorderLeadingShortI(input: string): string {
  let output = "";
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char !== SHORT_I) {
      output += char;
      continue;
    }
    if (isAttachedMatraContext(input[index - 1])) {
      output += char;
      continue;
    }

    const clusterEnd = readConsonantClusterEnd(input, index + 1);
    if (clusterEnd === index + 1) {
      output += char;
      continue;
    }

    output += input.slice(index + 1, clusterEnd) + SHORT_I;
    index = clusterEnd - 1;
  }
  return output;
}

export function repositionMalformedReph(input: string): string {
  return input.replace(new RegExp(`${REPH}${VIRAMA}+`, "g"), REPH);
}

function normalizeLegacyPunctuationAndSpacing(input: string): string {
  return input
    .replace(/दायित्वबदोध/g, "दायित्वबोध")
    .replace(/\s+([।,;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1");
}

function readConsonantClusterEnd(input: string, start: number): number {
  let index = start;
  if (!isConsonant(input[index])) return start;

  index += 1;
  while (index < input.length) {
    if (input[index] === "\u093C") {
      index += 1;
      continue;
    }
    if (input[index] === VIRAMA && isConsonant(input[index + 1])) {
      index += 2;
      continue;
    }
    break;
  }

  return index;
}

function isConsonant(char: string | undefined): boolean {
  return Boolean(char && CONSONANT_PATTERN.test(char));
}

function isAttachedMatraContext(char: string | undefined): boolean {
  return isConsonant(char) || char === "\u093C";
}

export function hasDependentMark(char: string | undefined): boolean {
  return Boolean(char && DEPENDENT_MARK_PATTERN.test(char));
}
