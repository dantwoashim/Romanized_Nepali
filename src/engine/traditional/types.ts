import type { KeyboardKeyEvent } from "../keyboard";

export type TraditionalLayoutStatus = "verified" | "pending-audit";

export interface TraditionalLayoutMetadata {
  layoutId: "traditional-ltk-compatible" | "traditional-standard";
  status: TraditionalLayoutStatus;
  sourceArtifact: string;
  notes: string;
}

export interface TraditionalKeymapResult {
  input: KeyboardKeyEvent;
  output: string;
  committed: boolean;
  warnings: string[];
  layout: TraditionalLayoutMetadata;
}
