import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const idDetector: ProtectedSpanDetector = {
  name: "id",
  priority: 76,
  detect: (input) => [
    ...spansFromRegex(input, /\b(?:ward-\d{1,3}|form-\d+(?:-[A-Za-z])?|[A-Z]{2,}-\d+|\d{4}-\d{2,})\b/gi, {
      kind: "identifier",
      spanClass: "hard-preserve",
      confidence: 0.95,
      reason: "Structured IDs and ward/form references are protected."
    }),
    ...spansFromRegex(input, /\b(?:NID|PAN|VAT|DOB)\b/g, {
      kind: "identifier",
      spanClass: "hard-preserve",
      confidence: 0.98,
      reason: "Official acronyms used as identifiers are protected."
    })
  ]
};
