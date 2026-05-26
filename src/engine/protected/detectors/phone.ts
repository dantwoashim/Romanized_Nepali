import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const phoneDetector: ProtectedSpanDetector = {
  name: "phone",
  priority: 80,
  detect: (input) =>
    spansFromRegex(input, /(?<![\w-])(?:\+977[-\s]?)?9\d{9}(?![\w-])/g, {
      kind: "phone",
      spanClass: "hard-preserve",
      confidence: 0.96,
      reason: "Phone-like numbers are protected in mixed Nepali office text."
    })
};
