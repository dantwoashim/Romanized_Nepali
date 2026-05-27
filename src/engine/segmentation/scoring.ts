import type { ConversionAction, SpanKind } from "./types";

export function legalActionsForKind(kind: SpanKind, confidence: number): ConversionAction[] {
  switch (kind) {
    case "url":
    case "email":
    case "phone":
    case "file":
    case "identifier":
    case "date":
    case "english-preserve":
    case "quoted-example":
    case "number":
    case "punctuation":
    case "whitespace":
      return ["preserve"];
    case "unknown-risky":
      return confidence < 0.2 ? ["warn", "preserve"] : ["candidates", "warn", "preserve"];
    case "loanword-candidate":
      return ["candidates", "preserve"];
    default:
      return confidence >= 0.8 ? ["auto", "candidates"] : ["candidates", "warn"];
  }
}

export function spanKindPriority(kind: SpanKind): number {
  const priority: Record<SpanKind, number> = {
    url: 100,
    email: 98,
    phone: 96,
    file: 94,
    identifier: 92,
    date: 90,
    "quoted-example": 88,
    "english-preserve": 84,
    "preeti-legacy": 78,
    "english-with-nepali-suffix": 74,
    "romanized-nepali": 70,
    "unicode-nepali": 68,
    "loanword-candidate": 64,
    number: 60,
    punctuation: 30,
    whitespace: 28,
    "unknown-risky": 10
  };
  return priority[kind];
}
