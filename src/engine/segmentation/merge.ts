import type { TypedSpan } from "./types";

export function mergeAdjacentCompatibleSpans(spans: TypedSpan[]): TypedSpan[] {
  const merged: TypedSpan[] = [];
  for (const span of spans) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.kind === span.kind &&
      previous.reason === span.reason &&
      previous.range[1] === span.range[0] &&
      canMergeKind(span.kind)
    ) {
      previous.text += span.text;
      previous.range = [previous.range[0], span.range[1]];
      previous.confidence = Math.min(previous.confidence, span.confidence);
      continue;
    }
    merged.push({ ...span, range: [span.range[0], span.range[1]] });
  }
  return merged.map((span, index) => ({ ...span, id: `span-${index + 1}` }));
}

function canMergeKind(kind: TypedSpan["kind"]): boolean {
  return kind === "unicode-nepali" || kind === "romanized-nepali" || kind === "preeti-legacy" || kind === "whitespace";
}
