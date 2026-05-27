import type { EngineDiagnostic } from "../types";
import type { ConversionAction } from "../segmentation/types";

export function gateAction(confidence: number, diagnostics: EngineDiagnostic[], preferred: ConversionAction): ConversionAction {
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) return "refuse";
  if (preferred === "preserve") return "preserve";
  if (preferred === "warn") return "warn";
  if (confidence >= 0.86) return "auto";
  if (confidence >= 0.52) return "candidates";
  return "warn";
}
