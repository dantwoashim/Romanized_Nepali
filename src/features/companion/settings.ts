import type { KeyboardMode } from "../../engine/keyboard";

export interface CompanionSettings {
  defaultMode: KeyboardMode;
  showRomanizedLabels: boolean;
  enableRomanizedHelpers: boolean;
  enableProofreadHints: boolean;
  enableDictionaryPanel: boolean;
  enableLocalMemory: boolean;
  secureInputPassThrough: boolean;
  traditionalLayoutStatus: "pending-audit" | "verified";
  preetiUtilityEnabled: boolean;
}

export const defaultCompanionSettings: CompanionSettings = {
  defaultMode: "romanized",
  showRomanizedLabels: false,
  enableRomanizedHelpers: true,
  enableProofreadHints: true,
  enableDictionaryPanel: true,
  enableLocalMemory: true,
  secureInputPassThrough: true,
  traditionalLayoutStatus: "pending-audit",
  preetiUtilityEnabled: true
};

export const companionPages = [
  "Home/status",
  "Mode settings",
  "Romanized preferences",
  "Traditional layout settings",
  "Layout preview",
  "Candidate behavior",
  "Proofread settings",
  "Dictionary manager",
  "Personal memory",
  "Privacy",
  "Diagnostics",
  "Preeti side utility",
  "Import/export",
  "Updates/about"
] as const;
