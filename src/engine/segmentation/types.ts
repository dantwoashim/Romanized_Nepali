import type { ConvertOptions, EngineDiagnostic } from "../types";

export type SpanKind =
  | "unicode-nepali"
  | "preeti-legacy"
  | "romanized-nepali"
  | "english-preserve"
  | "english-with-nepali-suffix"
  | "loanword-candidate"
  | "number"
  | "date"
  | "identifier"
  | "email"
  | "url"
  | "phone"
  | "file"
  | "quoted-example"
  | "punctuation"
  | "whitespace"
  | "unknown-risky";

export type ConversionAction = "auto" | "candidates" | "preserve" | "warn" | "refuse";

export interface TypedSpan {
  id: string;
  text: string;
  range: [number, number];
  kind: SpanKind;
  confidence: number;
  legalActions: ConversionAction[];
  reason: string;
  features: Record<string, number | string | boolean>;
  diagnostics: EngineDiagnostic[];
}

export interface SegmenterOptions extends ConvertOptions {
  surroundingMode?: "romanized" | "preeti" | "mixed-office" | "diagnostic";
}

export interface SegmentationTraceStep {
  spanId: string;
  kind: SpanKind;
  text: string;
  range: [number, number];
  reason: string;
  confidence: number;
  features: Record<string, number | string | boolean>;
}

export interface SegmentationResult {
  input: string;
  spans: TypedSpan[];
  diagnostics: EngineDiagnostic[];
  trace: SegmentationTraceStep[];
}

export interface ProtectedLikeMatch {
  kind: SpanKind;
  range: [number, number];
  text: string;
  confidence: number;
  reason: string;
  features?: Record<string, number | string | boolean>;
}
