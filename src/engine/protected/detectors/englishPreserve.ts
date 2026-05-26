import type { ProtectedSpanDetector } from "../types";
import { isMixedProtectionMode, spansFromRegex } from "./helpers";

const WORDS = [
  "user",
  "correct",
  "wrong",
  "candidate",
  "phrase",
  "detect",
  "output",
  "upload",
  "submit",
  "final",
  "record",
  "system",
  "online",
  "form",
  "address",
  "email",
  "date",
  "phone",
  "number",
  "field",
  "file",
  "report"
];

export const englishPreserveDetector: ProtectedSpanDetector = {
  name: "english-preserve",
  priority: 30,
  detect: (input, context) => {
    if (!isMixedProtectionMode(context.mode)) return [];
    return spansFromRegex(input, new RegExp(`\\b(?:${WORDS.join("|")})\\b`, "gi"), {
      kind: "english-preserve",
      spanClass: "soft-preserve",
      confidence: 0.74,
      reason: "Known English/document term is preserved in mixed mode."
    });
  }
};
