import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import type { ConversionWarning, PreetiResult } from "../types";
import { getPreetiEntry } from "./preetiMap";

const PASS_THROUGH = /[\r\n\t 0-9A-Za-z]/;

export function convertPreetiToUnicode(input: string): PreetiResult {
  const warnings: ConversionWarning[] = [];
  let output = "";
  let changedCount = 0;

  for (let index = 0; index < input.length; index += 1) {
    const sourceChar = input[index];
    const entry = getPreetiEntry(sourceChar);

    if (entry) {
      output += entry.target;
      changedCount += entry.target !== sourceChar ? 1 : 0;
      if (entry.confidence !== "high") {
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

    output += sourceChar;

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

  const normalizedOutput = normalizeNepaliText(output);
  return {
    input,
    output,
    normalizedOutput,
    warnings,
    changedCount,
    uncertainMappings: warnings
  };
}
