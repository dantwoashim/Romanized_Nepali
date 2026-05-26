import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const emailDetector: ProtectedSpanDetector = {
  name: "email",
  priority: 100,
  detect: (input) =>
    spansFromRegex(input, /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, {
      kind: "email",
      spanClass: "hard-preserve",
      confidence: 1,
      reason: "Email addresses must be preserved byte-exactly."
    })
};
