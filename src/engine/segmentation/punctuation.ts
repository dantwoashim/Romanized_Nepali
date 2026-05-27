export function isWhitespace(text: string): boolean {
  return /^\s+$/.test(text);
}

export function isPunctuationOnly(text: string): boolean {
  return /^[।,.:;!?()[\]{}"“”‘’\-–—/\\]+$/.test(text);
}

export function isHardBoundaryPunctuation(char: string): boolean {
  return /[।,()\r\n\t]/.test(char);
}
