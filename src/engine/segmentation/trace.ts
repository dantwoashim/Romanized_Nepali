import type { SegmentationTraceStep, TypedSpan } from "./types";

export function traceSpan(span: TypedSpan): SegmentationTraceStep {
  return {
    spanId: span.id,
    kind: span.kind,
    text: span.text,
    range: span.range,
    reason: span.reason,
    confidence: span.confidence,
    features: span.features
  };
}
