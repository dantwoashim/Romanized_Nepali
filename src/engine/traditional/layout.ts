import type { TraditionalLayoutMetadata } from "./types";

export const TRADITIONAL_LAYOUTS: TraditionalLayoutMetadata[] = [
  {
    layoutId: "traditional-ltk-compatible",
    status: "pending-audit",
    sourceArtifact: "data/layouts/traditional-ltk-compatible.pending.json",
    notes: "Pending manual source-of-truth capture from LTK-compatible behavior."
  },
  {
    layoutId: "traditional-standard",
    status: "pending-audit",
    sourceArtifact: "data/layouts/traditional-standard.pending.json",
    notes: "Pending cross-check against an authoritative Nepali Unicode keyboard standard."
  }
];

export function getTraditionalLayout(layoutId = "traditional-ltk-compatible"): TraditionalLayoutMetadata {
  return TRADITIONAL_LAYOUTS.find((layout) => layout.layoutId === layoutId) ?? TRADITIONAL_LAYOUTS[0];
}

export function hasVerifiedTraditionalLayout(layoutId?: string): boolean {
  return getTraditionalLayout(layoutId).status === "verified";
}
