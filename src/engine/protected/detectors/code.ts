import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const codeDetector: ProtectedSpanDetector = {
  name: "code",
  priority: 50,
  detect: (input) =>
    spansFromRegex(input, /(?:<[^>\n]{1,80}>|\$\{[^}\n]{1,80}\}|\{[A-Za-z0-9_.-]{1,80}\}|\[[A-Za-z0-9_.:-]{1,80}\])/g, {
      kind: "code",
      spanClass: "hard-preserve",
      confidence: 0.82,
      reason: "Code-like references are protected."
    })
};
