import type { EngineDiagnostic } from "../types";

export function verifyProtectedIntegrity(input: string, output: string, protectedTexts: string[]): EngineDiagnostic[] {
  return protectedTexts
    .filter((text) => input.includes(text) && !output.includes(text))
    .map((text): EngineDiagnostic => ({
      code: "PROTECTED_SPAN_CORRUPTION",
      message: `Protected span "${text}" was not preserved byte-exactly.`,
      severity: "error"
    }));
}
