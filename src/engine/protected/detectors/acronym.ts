import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const acronymDetector: ProtectedSpanDetector = {
  name: "acronym",
  priority: 68,
  detect: (input) =>
    spansFromRegex(input, /\b(?:PDF|NID|PAN|VAT|DOB|URL|ID|QR|SMS|[A-Z]{2,})\b/g, {
      kind: "acronym",
      spanClass: "hard-preserve",
      confidence: 0.9,
      reason: "Uppercase acronym-like tokens are protected."
    })
};
