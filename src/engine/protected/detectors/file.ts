import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const fileDetector: ProtectedSpanDetector = {
  name: "file",
  priority: 86,
  detect: (input) =>
    spansFromRegex(input, /\b[A-Za-z0-9._-]+\.(?:pdf|docx?|xlsx?|csv|txt|jpg|jpeg|png)\b/gi, {
      kind: "file",
      spanClass: "hard-preserve",
      confidence: 0.98,
      reason: "File names must be preserved byte-exactly."
    })
};
