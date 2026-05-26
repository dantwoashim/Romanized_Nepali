import { buildApprovedAliasVariants, type WeightedAliasVariant } from "./aliasFactory";

export interface AliasCollision {
  alias: string;
  outputs: string[];
  variants: WeightedAliasVariant[];
  severity: "expected-ambiguous" | "review-needed";
}

export interface AliasGraphReport {
  generatedAt: string;
  variantCount: number;
  aliasCount: number;
  collisionCount: number;
  collisions: AliasCollision[];
}

export function buildAliasCollisionReport(variants = buildApprovedAliasVariants()): AliasGraphReport {
  const byAlias = new Map<string, WeightedAliasVariant[]>();
  for (const variant of variants) {
    const list = byAlias.get(variant.alias) ?? [];
    list.push(variant);
    byAlias.set(variant.alias, list);
  }

  const collisions: AliasCollision[] = [];
  for (const [alias, entries] of byAlias.entries()) {
    const outputs = Array.from(new Set(entries.map((entry) => entry.word)));
    if (outputs.length <= 1) continue;
    collisions.push({
      alias,
      outputs,
      variants: entries.sort((a, b) => b.weight - a.weight),
      severity: entries.some((entry) => entry.source.includes("manual")) ? "expected-ambiguous" : "review-needed"
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    variantCount: variants.length,
    aliasCount: byAlias.size,
    collisionCount: collisions.length,
    collisions: collisions.sort((a, b) => b.outputs.length - a.outputs.length || a.alias.localeCompare(b.alias))
  };
}
