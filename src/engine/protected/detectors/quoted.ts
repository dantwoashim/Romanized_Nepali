import type { ProtectedSpanDetector } from "../types";
import { spansFromRegex } from "./helpers";

export const quotedDetector: ProtectedSpanDetector = {
  name: "quoted",
  priority: 52,
  detect: (input) =>
    spansFromRegex(input, /"[^"\n]{1,80}"|'[^'\n]{1,80}'/g, {
      kind: "quoted",
      spanClass: "quoted-example",
      confidence: 0.85,
      reason: "Quoted examples are preserved as literal examples in mixed/document modes."
    })
};
