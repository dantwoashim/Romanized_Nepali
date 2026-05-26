import { applyPreetiPostRules } from "../../core/preeti/preetiPostRules";
import type { EngineDiagnostic } from "../types";
import { atomUnicodeValue } from "./atoms";
import { reorderPrebaseMatraWindow } from "./syllable";
import type { LegacyAtom, LegacyToken } from "./types";

export interface LegacyAssemblyResult {
  output: string;
  diagnostics: EngineDiagnostic[];
  trace: Array<{ name: string; message: string; data?: Record<string, unknown> }>;
}

export function assembleLegacyUnicode(tokens: LegacyToken[]): LegacyAssemblyResult {
  const diagnostics: EngineDiagnostic[] = [];
  let output = "";

  for (const token of tokens) {
    diagnostics.push(...token.diagnostics);
    if (token.kind === "unknown") {
      output += token.source;
      continue;
    }
    output += token.mapping?.unicodePreview ?? assembleAtoms(token.atoms);
  }

  const reordered = reorderPrebaseMatraWindow(output);
  const normalized = applyPreetiPostRules(reordered).normalize("NFC");
  return {
    output: normalized,
    diagnostics,
    trace: [
      {
        name: "legacy-assemble",
        message: "Assembled LegacyAtom stream into NFC Unicode.",
        data: { tokenCount: tokens.length, diagnosticCount: diagnostics.length }
      }
    ]
  };
}

export function assembleAtoms(atoms: LegacyAtom[]): string {
  let output = "";
  for (const atom of atoms) {
    output += atomUnicodeValue(atom);
  }
  return output;
}
