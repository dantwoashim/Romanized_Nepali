import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { getSemanticLegacyProfile } from "../src/engine/legacy/profile";

const root = process.cwd();
const reportPath = join(root, "bench/reports/legacy-font-inspection-report.json");

export interface LegacyFontInspectionReport {
  generatedAt: string;
  fontProvided: boolean;
  status: "not-provided" | "inspected" | "missing";
  fontPath?: string;
  fileName?: string;
  byteLength?: number;
  sfntVersion?: string;
  profileCompared: string;
  reviewedMappingCount: number;
  notes: string[];
}

export function inspectLegacyFont(fontPathArg?: string): LegacyFontInspectionReport {
  const profile = getSemanticLegacyProfile("preeti");
  const reviewedMappingCount =
    Object.keys(profile.singleTokenMap).length +
    Object.keys(profile.sequenceTokenMap).length +
    Object.keys(profile.conjunctMap).length;

  if (!fontPathArg) {
    return {
      generatedAt: new Date().toISOString(),
      fontProvided: false,
      status: "not-provided",
      profileCompared: profile.profileId,
      reviewedMappingCount,
      notes: [
        "No local font file was provided; semantic profile map remains the conversion authority.",
        "Font inspection is a coverage/fingerprinting tool only and does not infer final Unicode semantics."
      ]
    };
  }

  const fontPath = resolve(fontPathArg);
  if (!existsSync(fontPath)) {
    return {
      generatedAt: new Date().toISOString(),
      fontProvided: true,
      status: "missing",
      fontPath,
      profileCompared: profile.profileId,
      reviewedMappingCount,
      notes: ["Provided font path does not exist; no font data was read."]
    };
  }

  const bytes = readFileSync(fontPath);
  const sfntVersion = bytes.subarray(0, 4).toString("latin1");
  return {
    generatedAt: new Date().toISOString(),
    fontProvided: true,
    status: "inspected",
    fontPath,
    fileName: basename(fontPath),
    byteLength: bytes.length,
    sfntVersion,
    profileCompared: profile.profileId,
    reviewedMappingCount,
    notes: [
      "Basic local font inventory was inspected without copying or bundling the font.",
      "Glyph names/cmap inventory are diagnostic hints only; semantic mappings still come from reviewed profile data."
    ]
  };
}

if (process.env.LEKH_SCRIPT === "inspect-legacy-font") {
  const report = inspectLegacyFont(process.argv[2]);
  mkdirSync(join(root, "bench/reports"), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
