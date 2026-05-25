import { convert as convertLegacyFont, FONT_MAPS } from "@nepalibhasha/converter";
import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { ConversionWarning, PreetiResult } from "../types";
import { getPreetiEntry } from "./preetiMap";

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
    rawOutput = convertPreservingKnownEnglish(input);
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

function convertPreservingKnownEnglish(input: string): string {
  return input
    .split(/(\s+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token)) return token;
      if (TECHNICAL_ENGLISH_TOKENS.has(token)) return token;
      return convertLegacyFont(token, "preeti");
    })
    .join("");
}

function convertWithLocalMap(input: string): string {
  let output = "";
  for (const sourceChar of input) {
    output += getPreetiEntry(sourceChar)?.target ?? sourceChar;
  }
  return output;
}
