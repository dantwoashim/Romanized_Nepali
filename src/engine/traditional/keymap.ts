import type { KeyboardKeyEvent } from "../keyboard";
import { getTraditionalLayout } from "./layout";
import type { TraditionalKeymapResult } from "./types";

export function mapTraditionalKeyEvent(key: KeyboardKeyEvent, layoutId?: string): TraditionalKeymapResult {
  const layout = getTraditionalLayout(layoutId);
  if (layout.status !== "verified") {
    return {
      input: key,
      output: key.key.length === 1 ? key.key : "",
      committed: false,
      warnings: [`${layout.layoutId} mapping is pending source-of-truth audit; key passed through.`],
      layout
    };
  }

  return {
    input: key,
    output: "",
    committed: false,
    warnings: ["Verified Traditional layout loader is not populated in this build."],
    layout
  };
}
