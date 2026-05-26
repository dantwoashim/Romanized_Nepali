import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSemanticLegacyProfile } from "../src/engine/legacy/profile";
import { assertNonEmptySuite } from "./lib/cli";

const root = process.cwd();
const outputPath = join(root, "bench/fixtures/preeti/generated/map-fixtures.json");

export function generatePreetiMapFixtures() {
  const profile = getSemanticLegacyProfile("preeti");
  const groups = [
    ["single", profile.singleTokenMap],
    ["sequence", profile.sequenceTokenMap],
    ["conjunct", profile.conjunctMap],
    ["matra", profile.matraMap],
    ["digit", profile.digitMap],
    ["punctuation", profile.punctuationMap]
  ] as const;
  const seen = new Set<string>();
  const fixtures = groups.flatMap(([group, mappings]) =>
    Object.values(mappings)
      .filter((mapping) => {
        const key = `${mapping.token}:${mapping.unicodePreview}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return mapping.reviewStatus === "reviewed" || mapping.reviewStatus === "provisional";
      })
      .map((mapping, index) => ({
        id: `preeti-map-${group}-${index + 1}`,
        type: "generated-map",
        group,
        profileId: profile.profileId,
        input: mapping.token,
        expected: mapping.unicodePreview,
        expectedAtoms: mapping.atoms,
        reviewStatus: mapping.reviewStatus,
        source: "semantic-profile-map"
      }))
  );
  assertNonEmptySuite("preeti generated map fixtures", fixtures.length);
  return fixtures;
}

if (process.env.LEKH_SCRIPT === "generate-preeti-map-fixtures") {
  const fixtures = generatePreetiMapFixtures();
  mkdirSync(join(root, "bench/fixtures/preeti/generated"), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(fixtures, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, fixtureCount: fixtures.length }, null, 2));
}
