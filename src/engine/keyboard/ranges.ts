export type Utf16Range = [number, number];

export function validateRange(input: string, range: Utf16Range): boolean {
  const [start, end] = range;
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end <= input.length;
}

export function clampRange(input: string, range: Utf16Range): Utf16Range {
  const start = Math.max(0, Math.min(input.length, Math.trunc(range[0])));
  const end = Math.max(start, Math.min(input.length, Math.trunc(range[1])));
  return [start, end];
}

export function sliceByUtf16Range(input: string, range: Utf16Range): string {
  const [start, end] = clampRange(input, range);
  return input.slice(start, end);
}

export function replaceByUtf16Range(input: string, range: Utf16Range, replacement: string): string {
  const [start, end] = clampRange(input, range);
  return `${input.slice(0, start)}${replacement}${input.slice(end)}`;
}

export function clampCaret(input: string, caret: number): number {
  return Math.max(0, Math.min(input.length, Math.trunc(caret)));
}

export function deleteBeforeCaret(input: string, caret: number): { text: string; caret: number } {
  const safeCaret = clampCaret(input, caret);
  if (safeCaret === 0) return { text: input, caret: 0 };
  const start = previousCodePointBoundary(input, safeCaret);
  return {
    text: replaceByUtf16Range(input, [start, safeCaret], ""),
    caret: start
  };
}

export function deleteAfterCaret(input: string, caret: number): { text: string; caret: number } {
  const safeCaret = clampCaret(input, caret);
  if (safeCaret >= input.length) return { text: input, caret: input.length };
  const end = nextCodePointBoundary(input, safeCaret);
  return {
    text: replaceByUtf16Range(input, [safeCaret, end], ""),
    caret: safeCaret
  };
}

export function insertAtCaret(input: string, caret: number, value: string): { text: string; caret: number } {
  const safeCaret = clampCaret(input, caret);
  return {
    text: replaceByUtf16Range(input, [safeCaret, safeCaret], value),
    caret: safeCaret + value.length
  };
}

function previousCodePointBoundary(input: string, caret: number): number {
  const previous = caret - 1;
  if (previous <= 0) return 0;
  const code = input.charCodeAt(previous);
  const before = input.charCodeAt(previous - 1);
  if (code >= 0xdc00 && code <= 0xdfff && before >= 0xd800 && before <= 0xdbff) {
    return previous - 1;
  }
  return previous;
}

function nextCodePointBoundary(input: string, caret: number): number {
  const current = input.charCodeAt(caret);
  const next = input.charCodeAt(caret + 1);
  if (current >= 0xd800 && current <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) {
    return caret + 2;
  }
  return caret + 1;
}
