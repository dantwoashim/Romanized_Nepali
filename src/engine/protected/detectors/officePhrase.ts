import type { ProtectedSpanDetector } from "../types";
import { isMixedProtectionMode, spansFromRegex } from "./helpers";

export const officePhraseDetector: ProtectedSpanDetector = {
  name: "office-phrase",
  priority: 58,
  detect: (input, context) => {
    if (!isMixedProtectionMode(context.mode)) return [];
    return spansFromRegex(input, /\b(?:Form No\.?|Ward No\.?)(?=\s|$)|\b(?:X-ray report|online form|record system|final output|correct output)\b/gi, {
      kind: "office-phrase",
      spanClass: "soft-preserve",
      confidence: 0.88,
      reason: "Mixed office/document phrase is preserved in mixed mode."
    });
  }
};
