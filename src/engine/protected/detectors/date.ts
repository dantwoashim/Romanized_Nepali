import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const dateDetector: ProtectedSpanDetector = {
  name: "date",
  priority: 72,
  detect: (input) =>
    spansFromRegex(input, /\b(?:\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g, {
      kind: "date",
      spanClass: "hard-preserve",
      confidence: 0.9,
      reason: "Date-like numeric spans are protected in mixed documents."
    })
};
