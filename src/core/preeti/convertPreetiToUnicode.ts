import { convert as convertLegacyFont, FONT_MAPS } from "@nepalibhasha/converter";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { ConversionWarning, PreetiResult } from "../types";
import { getPreetiEntry } from "./preetiMap";
import { applyPreetiPostRules } from "./preetiPostRules";

const PASS_THROUGH = /[\r\n\t 0-9A-Za-z]/;
const TECHNICAL_ENGLISH_TOKENS = new Set([
  "NID",
  "PDF",
  "URL",
  "Excel",
  "Word",
  "file",
  "folder",
  "report",
  "office",
  "system",
  "record",
  "data",
  "copy",
  "link",
  "address",
  "desk",
  "biometrics",
  "status",
  "minutes",
  "QR",
  "code",
  "scan",
  "bank",
  "voucher",
  "meeting",
  "check",
  "update",
  "upload",
  "row",
  "draft",
  "final",
  "result",
  "publish",
  "entry",
  "photo",
  "slow",
  "branch",
  "campus",
  "card",
  "number",
  "print",
  "save",
  "format",
  "table",
  "sheet",
  "document",
  "doc",
  "docx",
  "email",
  "form",
  "field",
  "date",
  "ID",
  "No",
  "Phone",
  "phone",
  "mobile",
  "passport"
]);
const preetiBaselineMap = FONT_MAPS.preeti ?? {};

export function convertPreetiToUnicode(input: string): PreetiResult {
  const warnings: ConversionWarning[] = [];
  let rawOutput = "";
  let changedCount = 0;

  try {
    const converted = convertPreservingKnownEnglish(input);
    rawOutput = converted.output;
    for (const token of converted.preservedTokens) {
      warnings.push({
        code: "PRESERVED_ENGLISH_TOKEN",
        message: `Preserved likely English/acronym token "${token.token}".`,
        severity: "info",
        sourceChar: token.token,
        position: token.position
      });
    }
  } catch (error) {
    warnings.push({
      code: "BASELINE_CONVERTER_ERROR",
      message: "Baseline converter failed; local fallback map was used.",
      severity: "warning"
    });
    rawOutput = convertWithLocalMap(input);
  }

  for (let index = 0; index < input.length; index += 1) {
    const sourceChar = input[index];
    const entry = getPreetiEntry(sourceChar);
    const baselineTarget = preetiBaselineMap[sourceChar];

    if (entry || baselineTarget) {
      changedCount += (baselineTarget ?? entry?.target) !== sourceChar ? 1 : 0;
      if (entry && entry.confidence !== "high") {
        warnings.push({
          code: "UNCERTAIN_PREETI_MAPPING",
          message: `Mapping for "${sourceChar}" is ${entry.confidence}-confidence.`,
          severity: "info",
          sourceChar,
          position: index
        });
      }
      continue;
    }

    if (!PASS_THROUGH.test(sourceChar)) {
      warnings.push({
        code: "UNKNOWN_PREETI_CHAR",
        message: `No Preeti mapping for "${sourceChar}". Character was preserved.`,
        severity: "warning",
        sourceChar,
        position: index
      });
    }
  }

  rawOutput = applyPreetiPostRules(rawOutput);
  const normalizedOutput = normalizeNepaliText(rawOutput);
  return {
    input,
    output: rawOutput,
    normalizedOutput,
    warnings,
    changedCount,
    uncertainMappings: warnings
  };
}

function convertPreservingKnownEnglish(input: string): { output: string; preservedTokens: Array<{ token: string; position: number }> } {
  const preservedTokens: Array<{ token: string; position: number }> = [];
  let position = 0;
  const tokens = input.split(/(\s+)/);
  const output = tokens
    .map((token, tokenIndex) => {
      const start = position;
      position += token.length;
      if (!token || /^\s+$/.test(token)) return token;
      const hasPhraseContext = tokens.some((part, index) => index !== tokenIndex && /\s+/.test(part));
      const preserved = preserveEnglishToken(token);
      if (preserved) {
        preservedTokens.push({ token: preserved, position: start });
        return preserved;
      }
      const embeddedEnglish = preserveEmbeddedEnglishSuffix(token);
      if (embeddedEnglish) {
        preservedTokens.push({ token: embeddedEnglish.preserved, position: start + embeddedEnglish.prefix.length });
        return `${convertLegacyFont(embeddedEnglish.prefix, "preeti")}${embeddedEnglish.preserved}`;
      }
      const embeddedEnglishPrefix = preserveEmbeddedEnglishPrefix(token);
      if (embeddedEnglishPrefix) {
        preservedTokens.push({ token: embeddedEnglishPrefix.preserved, position: start });
        return `${embeddedEnglishPrefix.preserved}${convertLegacyFont(embeddedEnglishPrefix.suffix, "preeti")}`;
      }
      if (/^[0-9]{2,}(?:[.,/-][0-9]+)*$/.test(token) || (/^[0-9]$/.test(token) && hasEnglishNeighbor(tokens, tokenIndex))) {
        preservedTokens.push({ token, position: start });
        return token;
      }
      if (TECHNICAL_ENGLISH_TOKENS.has(token)) {
        preservedTokens.push({ token, position: start });
        return token;
      }
      const terminalQuestion = token.endsWith("?") && token.length > 1 && hasPhraseContext;
      const core = terminalQuestion ? token.slice(0, -1) : token;
      if (terminalQuestion) {
        const coreOutput = convertLegacyFont(core, "preeti");
        return coreOutput.endsWith("ु") ? convertLegacyFont(token, "preeti") : `${coreOutput}?`;
      }
      return convertLegacyFont(core, "preeti");
    })
    .join("");
  return { output, preservedTokens };
}

function hasEnglishNeighbor(tokens: string[], tokenIndex: number): boolean {
  const previous = previousNonSpaceToken(tokens, tokenIndex);
  const next = nextNonSpaceToken(tokens, tokenIndex);
  return Boolean(previous && preserveEnglishToken(previous)) || Boolean(next && preserveEnglishToken(next));
}

function previousNonSpaceToken(tokens: string[], tokenIndex: number): string | undefined {
  for (let index = tokenIndex - 1; index >= 0; index -= 1) {
    if (tokens[index] && !/^\s+$/.test(tokens[index])) return tokens[index];
  }
  return undefined;
}

function nextNonSpaceToken(tokens: string[], tokenIndex: number): string | undefined {
  for (let index = tokenIndex + 1; index < tokens.length; index += 1) {
    if (tokens[index] && !/^\s+$/.test(tokens[index])) return tokens[index];
  }
  return undefined;
}

function convertWithLocalMap(input: string): string {
  let output = "";
  for (const sourceChar of input) {
    output += getPreetiEntry(sourceChar)?.target ?? sourceChar;
  }
  return output;
}

function preserveEnglishToken(token: string): string | undefined {
  const match = token.match(/^([("'[]*)([A-Za-z0-9]+(?:[-.][A-Za-z0-9]+)*)([)"'\].,:;!?]*)$/);
  if (!match) return undefined;
  const [, prefix, core, suffix] = match;
  if (isPreservedEnglishCore(core)) return `${prefix}${core}${suffix}`;
  return undefined;
}

function preserveEmbeddedEnglishSuffix(token: string): { prefix: string; preserved: string } | undefined {
  for (const english of [...TECHNICAL_ENGLISH_TOKENS].sort((a, b) => b.length - a.length)) {
    if (english.length < 4) continue;
    if (!token.endsWith(english) || token.length === english.length) continue;
    return { prefix: token.slice(0, -english.length), preserved: english };
  }
  return undefined;
}

function preserveEmbeddedEnglishPrefix(token: string): { preserved: string; suffix: string } | undefined {
  for (const english of [...TECHNICAL_ENGLISH_TOKENS].sort((a, b) => b.length - a.length)) {
    if (english.length < 4) continue;
    if (!token.startsWith(english) || token.length === english.length) continue;
    return { preserved: english, suffix: token.slice(english.length) };
  }
  return undefined;
}

function isPreservedEnglishCore(core: string): boolean {
  if (/^[A-Z][A-Z0-9]{1,}$/.test(core)) return true;
  if (/^[Xx]-?ray$/.test(core)) return true;
  return TECHNICAL_ENGLISH_TOKENS.has(core) || TECHNICAL_ENGLISH_TOKENS.has(core.toLowerCase());
}
