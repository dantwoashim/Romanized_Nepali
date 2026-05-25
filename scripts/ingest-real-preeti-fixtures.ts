import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ingestRealPreetiManifest,
  type RealPreetiManifest
} from "../src/core/validation/preetiRealFixturePipeline";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = process.argv[2] ?? join(root, "data/private/preeti-real-manifest.json");
const outputPath = process.argv[3] ?? join(root, "data/generated/preeti-real-fixtures.json");

if (!existsSync(manifestPath)) {
  throw new Error(
    `Real Preeti manifest not found: ${manifestPath}\n` +
      "Create it from src/data/validation/preeti-real-manifest.example.json after collecting consented, de-identified source notes."
  );
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as RealPreetiManifest;
const result = ingestRealPreetiManifest(manifest);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Ingested ${result.documentCount} real Preeti documents into ${result.fixtureCount} fixtures.`);
console.log(`Wrote ${outputPath}`);

if (result.documentCount < 30) {
  console.warn(`Release gate warning: ${result.documentCount}/30 minimum consented Preeti documents collected.`);
}
