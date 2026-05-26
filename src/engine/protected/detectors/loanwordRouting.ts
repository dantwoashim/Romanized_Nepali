import type { SpanRoutingPolicy } from "../../types";

const LOANWORD_CANDIDATES = new Set(["digital", "unicode", "convert", "font", "grade", "online", "form", "system"]);

export function loanwordRoutingPolicy(token: string): SpanRoutingPolicy | undefined {
  return LOANWORD_CANDIDATES.has(token.toLowerCase()) ? "convert-loanword" : undefined;
}
