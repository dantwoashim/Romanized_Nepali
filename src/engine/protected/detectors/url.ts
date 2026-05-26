import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const urlDetector: ProtectedSpanDetector = {
  name: "url",
  priority: 110,
  detect: (input) =>
    spansFromRegex(input, /\bhttps?:\/\/[^\s<>"']+/gi, {
      kind: "url",
      spanClass: "hard-preserve",
      confidence: 1,
      reason: "URLs must be preserved byte-exactly."
    })
};
