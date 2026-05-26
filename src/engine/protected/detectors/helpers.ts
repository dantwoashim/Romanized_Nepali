import type { DetectedProtectedSpan } from "../types";
import type { ProtectedSpanClass, ProtectedSpanKind } from "../../types";

export function spansFromRegex(
  input: string,
  regex: RegExp,
  options: {
    kind: ProtectedSpanKind;
    spanClass: ProtectedSpanClass;
    confidence: number;
    reason: string;
    policy?: "preserve" | "warn";
  }
): DetectedProtectedSpan[] {
  const spans: DetectedProtectedSpan[] = [];
  for (const match of input.matchAll(regex)) {
    const original = match[0];
    const start = match.index ?? 0;
    if (!original) continue;
    spans.push({
      range: [start, start + original.length],
      original,
      kind: options.kind,
      spanClass: options.spanClass,
      policy: options.policy ?? "preserve",
      confidence: options.confidence,
      reason: options.reason
    });
  }
  return spans;
}

export function isMixedProtectionMode(mode: string): boolean {
  return mode === "auto" || mode.endsWith("-mixed") || mode === "unknown-diagnostic" || mode === "proofread-only";
}
