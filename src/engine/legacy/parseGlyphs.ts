import { FONT_MAPS } from "@nepalibhasha/converter";
import { getPreetiEntry } from "../../core/preeti/preetiMap";
import { atomFromUnicodeChar, atomsFromUnicodePreview, type LegacyAtom } from "./atoms";
import type { LegacyFontProfile } from "./profile";

const preetiBaselineMap = FONT_MAPS.preeti ?? {};

export function parseLegacyGlyphs(input: string, profile: LegacyFontProfile): LegacyAtom[] {
  return Array.from(input).map((char): LegacyAtom => {
    if (profile.id !== "preeti" || profile.status !== "supported") {
      return { kind: "unknown", value: char, source: profile.id };
    }

    const mapped = preetiBaselineMap[char] ?? getPreetiEntry(char)?.target;
    if (mapped) {
      return atomsFromUnicodePreview(mapped, char)[0] ?? { kind: "unknown", value: char, source: char };
    }
    if (/[\r\n\t ]/.test(char)) return { kind: "whitespace", value: char, source: char };
    if (/\d/.test(char)) return { kind: "digit", value: char, source: char };
    if (/^[A-Za-z]$/.test(char)) return { kind: "unknown", value: char, source: char };
    if (/^[,.;:!?()[\]{}-]$/.test(char)) return atomFromUnicodeChar(char, char);
    return { kind: "unknown", value: char, source: char };
  });
}
