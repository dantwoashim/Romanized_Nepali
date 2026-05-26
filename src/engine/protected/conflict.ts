import type { DetectedProtectedSpan, ProtectedSpanDetector } from "./types";

interface PrioritizedSpan extends DetectedProtectedSpan {
  detectorPriority: number;
}

export function resolveProtectedSpanConflicts(
  detected: Array<{ span: DetectedProtectedSpan; detector: ProtectedSpanDetector }>
): DetectedProtectedSpan[] {
  const prioritized = detected
    .map(({ span, detector }): PrioritizedSpan => ({ ...span, detectorPriority: detector.priority }))
    .sort((a, b) => {
      const priority = b.detectorPriority - a.detectorPriority;
      if (priority !== 0) return priority;
      const confidence = b.confidence - a.confidence;
      if (confidence !== 0) return confidence;
      const length = spanLength(b) - spanLength(a);
      if (length !== 0) return length;
      return a.range[0] - b.range[0];
    });

  const accepted: PrioritizedSpan[] = [];
  for (const span of prioritized) {
    if (accepted.some((existing) => overlaps(existing, span))) continue;
    accepted.push(span);
  }

  return accepted
    .sort((a, b) => a.range[0] - b.range[0])
    .map(({ detectorPriority: _detectorPriority, ...span }) => span);
}

function overlaps(a: DetectedProtectedSpan, b: DetectedProtectedSpan): boolean {
  return a.range[0] < b.range[1] && b.range[0] < a.range[1];
}

function spanLength(span: DetectedProtectedSpan): number {
  return span.range[1] - span.range[0];
}
