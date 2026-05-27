import type { CandidateScore, EngineDiagnostic, EngineWarning } from "../types";
import type { ConversionAction } from "../segmentation/types";

export interface SpanCandidate {
  spanId: string;
  input: string;
  output: string;
  action: ConversionAction;
  source:
    | "protected"
    | "preeti"
    | "romanized"
    | "unicode-proofread"
    | "english-suffix"
    | "loanword"
    | "copy-through"
    | "memory"
    | "warning";
  confidence: number;
  score: CandidateScore;
  warnings: EngineWarning[];
  diagnostics: EngineDiagnostic[];
  alternatives: SpanCandidate[];
  trace: string[];
}

export interface DocumentLattice {
  output: string;
  action: ConversionAction;
  confidence: number;
  candidates: SpanCandidate[];
  warnings: EngineWarning[];
  diagnostics: EngineDiagnostic[];
  trace: string[];
}
