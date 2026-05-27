import type { EngineDiagnostic } from "../types";

export function verifyUnicodeStructure(output: string): EngineDiagnostic[] {
  const diagnostics: EngineDiagnostic[] = [];
  if (/[^\S\r\n]\u093F/.test(output) || /^\u093F/.test(output)) {
    diagnostics.push({
      code: "DANGLING_PREBASE_MATRA",
      message: "Output contains a dangling prebase matra.",
      severity: "error"
    });
  }
  if (/आः/.test(output)) {
    diagnostics.push({
      code: "MALFORMED_FINAL_AA",
      message: "Output contains malformed आः from Romanized final-aa handling.",
      severity: "error"
    });
  }
  if (/[\uE000-\uF8FF]/.test(output)) {
    diagnostics.push({
      code: "LEFTOVER_SENTINEL",
      message: "Output contains a leftover private sentinel.",
      severity: "error"
    });
  }
  return diagnostics;
}
