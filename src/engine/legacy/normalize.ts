import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";

export function normalizeLegacyUnicode(input: string): string {
  return normalizeNepaliText(input).normalize("NFC");
}
