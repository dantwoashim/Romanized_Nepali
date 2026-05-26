import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import type { EngineMode, ProtectedNode, ProtectedResult, ProtectedSpan } from "../types";
import { EngineCorruption } from "../types";
import { acronymDetector } from "./detectors/acronym";
import { codeDetector } from "./detectors/code";
import { dateDetector } from "./detectors/date";
import { emailDetector } from "./detectors/email";
import { englishPreserveDetector } from "./detectors/englishPreserve";
import { fileDetector } from "./detectors/file";
import { idDetector } from "./detectors/id";
import { officePhraseDetector } from "./detectors/officePhrase";
import { phoneDetector } from "./detectors/phone";
import { quotedDetector } from "./detectors/quoted";
import { urlDetector } from "./detectors/url";
import { resolveProtectedSpanConflicts } from "./conflict";
import { assertNoSentinelLeakage, countPlaceholder, createSentinel, createSentinelSalt } from "./sentinel";
import type { ProtectedSpanDetector } from "./types";

const DETECTORS: ProtectedSpanDetector[] = [
  urlDetector,
  emailDetector,
  fileDetector,
  phoneDetector,
  idDetector,
  dateDetector,
  acronymDetector,
  officePhraseDetector,
  quotedDetector,
  codeDetector,
  englishPreserveDetector
];

export function extractProtectedSpans(input: string, mode: EngineMode = "auto"): ProtectedResult {
  const salt = createSentinelSalt();
  const detected = DETECTORS.flatMap((detector) =>
    detector.detect(input, { mode }).map((span) => ({ span, detector }))
  );
  const resolved = resolveProtectedSpanConflicts(detected);
  const spans = resolved.map((span, index): ProtectedSpan => ({
    ...span,
    id: `ps-${salt}-${index}`,
    placeholder: createSentinel(salt, index)
  }));
  const nodes = toProtectedNodes(input, spans);
  const protectedText = nodes.map((node) => node.kind === "text" ? node.text : node.span.placeholder).join("");

  return { input, mode, protectedText, nodes, spans, salt };
}

export function restoreProtectedSpans(text: string, spans: ProtectedSpan[]): string {
  const ordered = spans
    .map((span) => ({ span, index: text.indexOf(span.placeholder), count: countPlaceholder(text, span.placeholder) }))
    .sort((a, b) => a.index - b.index);

  for (const item of ordered) {
    if (item.count === 0) throw new EngineCorruption(`Missing placeholder for protected ${item.span.kind} span.`);
    if (item.count > 1) throw new EngineCorruption(`Duplicate placeholder for protected ${item.span.kind} span.`);
  }

  let restored = "";
  let cursor = 0;
  for (const { span, index } of ordered) {
    if (index < cursor) throw new EngineCorruption("Protected span placeholders overlap or are out of order.");
    restored += normalizeNepaliText(text.slice(cursor, index));
    restored += span.original;
    cursor = index + span.placeholder.length;
  }
  restored += normalizeNepaliText(text.slice(cursor));

  assertNoSentinelLeakage(restored);
  for (const span of spans) {
    if (span.spanClass === "hard-preserve" && !restored.includes(span.original)) {
      throw new EngineCorruption(`Hard-protected ${span.kind} span was not restored byte-exactly.`);
    }
  }

  return restored;
}

export function toProtectedNodes(input: string, spans: ProtectedSpan[]): ProtectedNode[] {
  const nodes: ProtectedNode[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (cursor < span.range[0]) {
      nodes.push({ kind: "text", text: input.slice(cursor, span.range[0]), range: [cursor, span.range[0]] });
    }
    nodes.push({ kind: "protected", span });
    cursor = span.range[1];
  }

  if (cursor < input.length) {
    nodes.push({ kind: "text", text: input.slice(cursor), range: [cursor, input.length] });
  }

  return nodes;
}

export { loanwordRoutingPolicy } from "./detectors/loanwordRouting";
