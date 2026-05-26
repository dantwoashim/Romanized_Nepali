import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";

export function normalizeProofreadOutput(input: string): string {
  return normalizeNepaliText(input).normalize("NFC");
}

export function isDevanagariWord(value: string): boolean {
  return /^[\u0900-\u097F]+$/.test(value);
}
