import { describe, expect, it } from "vitest";
import { convertPreeti } from "./index";
import { diagnoseLegacyInput } from "./diagnostics";
import { parseLegacyGlyphs } from "./parseGlyphs";
import { getLegacyProfile, listLegacyProfiles } from "./profile";

describe("legacy font profile abstraction", () => {
  it("keeps strict Preeti conversion behavior available", () => {
    const result = convertPreeti("sfof{no", { mode: "preeti-strict" });
    expect(result.normalizedOutput).toBe("कार्यालय");
  });

  it("diagnoses Preeti profile confidence without unsafe external maps", () => {
    const diagnostic = diagnoseLegacyInput("sfof{no");
    expect(diagnostic.supported).toBe(true);
    expect(diagnostic.selectedProfile).toBe("preeti");
    expect(diagnostic.mappedGlyphRatio).toBeGreaterThan(0.5);
  });

  it("returns planned diagnostics for unverified profiles", () => {
    const diagnostic = diagnoseLegacyInput("sfof{no", "kantipur");
    expect(diagnostic.supported).toBe(false);
    expect(diagnostic.selectedProfile).toBeUndefined();
    expect(diagnostic.warnings[0]).toContain("planned only");
  });

  it("parses glyphs into typed atoms", () => {
    const profile = getLegacyProfile("preeti");
    const atoms = parseLegacyGlyphs("sfof{no", profile);
    expect(atoms.some((atom) => atom.kind === "consonant")).toBe(true);
    expect(atoms.every((atom) => atom.source.length > 0)).toBe(true);
  });

  it("lists unsupported profiles as planned rather than supported", () => {
    const profiles = listLegacyProfiles();
    expect(profiles.find((profile) => profile.id === "preeti")?.status).toBe("supported");
    expect(profiles.filter((profile) => profile.id !== "preeti").every((profile) => profile.status === "planned")).toBe(true);
  });
});
