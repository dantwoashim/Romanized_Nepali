import { describe, expect, it } from "vitest";
import { convertPreeti } from "./index";
import { assembleLegacyUnicode } from "./assembleUnicode";
import { atomsFromUnicodePreview } from "./atoms";
import { decodeLegacyWithAtoms } from "./decoder";
import { getLegacyProfile, getSemanticLegacyProfile } from "./profile";
import { detectLegacyProfile } from "./profileDetection";
import { tokenizeLegacy } from "./tokenizer";
import { verifyLegacyOutput } from "./verifier";

describe("deterministic Preeti decoder foundation", () => {
  it("loads a semantic Preeti profile with reviewed maps and provenance", () => {
    const profile = getSemanticLegacyProfile("preeti");
    expect(profile.status).toBe("supported");
    expect(profile.sourceProvenance.license).toContain("MIT");
    expect(Object.keys(profile.singleTokenMap).length).toBeGreaterThan(50);
    expect(profile.singleTokenMap.R.unicodePreview).toBe("च्च");
    expect(profile.conjunctMap.R.unicodePreview).toBe("च्च");
  });

  it("tokenizes with longest reviewed sequence before single-token fallback", () => {
    const profile = getSemanticLegacyProfile("preeti");
    const tokens = tokenizeLegacy("pRtd\\", profile);
    expect(tokens.map((token) => token.source)).toContain("R");
    expect(tokens.find((token) => token.source === "R")?.mapping?.unicodePreview).toBe("च्च");
  });

  it("emits unknown token diagnostics instead of silent fallback", () => {
    const profile = getSemanticLegacyProfile("preeti");
    const tokens = tokenizeLegacy("☃", profile);
    expect(tokens[0].kind).toBe("unknown");
    expect(tokens[0].diagnostics[0].code).toBe("LEGACY_UNKNOWN_TOKEN");
  });

  it("assembles atoms into NFC Unicode and reorders prebase matra smoke cases", () => {
    const tokens = [
      {
        source: "manual",
        range: [0, 2] as [number, number],
        atoms: atomsFromUnicodePreview("िक", "manual"),
        kind: "mapped" as const,
        profileId: "preeti",
        confidence: 1,
        diagnostics: []
      }
    ];
    expect(assembleLegacyUnicode(tokens).output).toBe("कि");
  });

  it("verifier rejects unknown tokens and low-confidence unsupported profiles", () => {
    const profile = getSemanticLegacyProfile("preeti");
    const tokens = tokenizeLegacy("☃", profile);
    const result = verifyLegacyOutput("☃", "☃", tokens, profile, { profileConfidence: 1 });
    expect(result.status).toBe("unsafe");
    expect(result.unknownSequences).toEqual(["☃"]);
  });

  it("detects planned profiles as diagnostic-only", () => {
    const detection = detectLegacyProfile("sfof{no", "kantipur");
    expect(detection.selectedProfileId).toBeUndefined();
    expect(detection.reason).toContain("diagnostic");
  });

  it("keeps baseline selected in compare mode while exposing atom diagnostics", () => {
    const result = convertPreeti("sfof{no", { mode: "preeti-mixed", legacyDecoder: "compare" });
    expect(result.normalizedOutput).toBe("कार्यालय");
    expect(result.diagnostics.some((diagnostic) => diagnostic.code === "LEGACY_DECODER_SELECTION")).toBe(true);
  });

  it("allows explicit atom mode for verifier-accepted spans", () => {
    const result = convertPreeti("pRtd\\", { mode: "preeti-strict", legacyDecoder: "atom" });
    expect(result.normalizedOutput).toContain("उच्चतम्");
  });

  it("preserves mixed-document protected spans through the user-facing Preeti wrapper", () => {
    const result = convertPreeti("sfof{no PDF NID Form No. 2079-080 ward-05 email@test.com", {
      mode: "preeti-mixed",
      legacyDecoder: "auto"
    });
    for (const expected of ["PDF", "NID", "Form No.", "2079-080", "ward-05", "email@test.com"]) {
      expect(result.normalizedOutput).toContain(expected);
    }
  });

  it("keeps old profile listing compatible", () => {
    expect(getLegacyProfile("preeti").id).toBe("preeti");
  });
});
