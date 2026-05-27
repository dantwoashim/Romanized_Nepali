import type { ProtectedLikeMatch } from "./types";

const DETECTORS: Array<{ kind: ProtectedLikeMatch["kind"]; reason: string; confidence: number; regex: RegExp }> = [
  { kind: "url", reason: "URL must be preserved byte-exactly.", confidence: 0.99, regex: /https?:\/\/[^\s)]+/gi },
  { kind: "email", reason: "Email address must be preserved byte-exactly.", confidence: 0.99, regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { kind: "file", reason: "File-like token is protected.", confidence: 0.95, regex: /\b[A-Za-z0-9_-]+\.(?:pdf|docx?|xlsx?|csv|txt|png|jpe?g)\b/gi },
  { kind: "identifier", reason: "Form number is a structured identifier.", confidence: 0.96, regex: /\bForm\s+No\.\s*[A-Za-z0-9-]+\b/gi },
  { kind: "identifier", reason: "Ward label is a structured identifier.", confidence: 0.95, regex: /\bward-\d+\b/gi },
  { kind: "phone", reason: "Phone-like number is protected.", confidence: 0.94, regex: /\b(?:\+977[-\s]?)?9\d{9}\b/g },
  { kind: "date", reason: "Slash or dash date-like token is protected.", confidence: 0.84, regex: /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g },
  { kind: "identifier", reason: "All-caps acronym is protected.", confidence: 0.9, regex: /\b(?:PDF|NID|PAN|VAT|DOB|URL|ID|QR)\b/g },
  { kind: "quoted-example", reason: "Quoted example should be preserved unless explicitly edited.", confidence: 0.82, regex: /"[^"]+"/g }
];

export function findProtectedLikeSpans(input: string): ProtectedLikeMatch[] {
  const matches: ProtectedLikeMatch[] = [];
  for (const detector of DETECTORS) {
    detector.regex.lastIndex = 0;
    for (const match of input.matchAll(detector.regex)) {
      if (match.index === undefined) continue;
      matches.push({
        kind: detector.kind,
        range: [match.index, match.index + match[0].length],
        text: match[0],
        confidence: detector.confidence,
        reason: detector.reason
      });
    }
  }
  return resolveOverlaps(matches);
}

function resolveOverlaps(matches: ProtectedLikeMatch[]): ProtectedLikeMatch[] {
  const priority = new Map<ProtectedLikeMatch["kind"], number>([
    ["url", 100],
    ["email", 95],
    ["phone", 90],
    ["file", 85],
    ["identifier", 80],
    ["date", 75],
    ["quoted-example", 55]
  ]);
  const sorted = [...matches].sort((a, b) =>
    (priority.get(b.kind) ?? 0) - (priority.get(a.kind) ?? 0) ||
    (b.range[1] - b.range[0]) - (a.range[1] - a.range[0]) ||
    b.confidence - a.confidence ||
    a.range[0] - b.range[0]
  );
  const accepted: ProtectedLikeMatch[] = [];
  for (const match of sorted) {
    if (accepted.some((existing) => overlaps(existing.range, match.range))) continue;
    accepted.push(match);
  }
  return accepted.sort((a, b) => a.range[0] - b.range[0]);
}

function overlaps(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}
