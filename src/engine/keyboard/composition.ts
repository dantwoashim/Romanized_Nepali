import { deleteAfterCaret, deleteBeforeCaret, insertAtCaret } from "./ranges";
import type { KeyboardKeyEvent } from "./types";

export interface CompositionMutation {
  text: string;
  caret: number;
  command?: "commit-primary" | "commit-raw" | "cancel" | "expand-candidates" | "pass-through";
  warning?: string;
}

export function applyKeyToComposition(input: string, caret: number, key: KeyboardKeyEvent): CompositionMutation {
  if (key.modifiers.meta || key.modifiers.ctrl || (key.modifiers.alt && key.key.length !== 1)) {
    return {
      text: input,
      caret,
      command: "pass-through",
      warning: "Modifier shortcut passed through to host application."
    };
  }

  if (key.key === "Backspace") {
    return deleteBeforeCaret(input, caret);
  }

  if (key.key === "Delete") {
    return deleteAfterCaret(input, caret);
  }

  if (key.key === "Escape") {
    return { text: "", caret: 0, command: "cancel" };
  }

  if (key.key === "Enter") {
    return { text: input, caret, command: "commit-primary" };
  }

  if (key.key === "Tab") {
    return { text: input, caret, command: "expand-candidates" };
  }

  if (key.key === " ") {
    return insertAtCaret(input, caret, " ");
  }

  if (key.key.length === 1) {
    return insertAtCaret(input, caret, key.key);
  }

  return {
    text: input,
    caret,
    command: "pass-through",
    warning: `Unhandled key ${key.key} passed through.`
  };
}
