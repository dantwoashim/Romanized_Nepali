import type { WeightedAliasVariant } from "./aliasFactory";

export interface AliasTrieMatch {
  alias: string;
  entries: WeightedAliasVariant[];
}

interface AliasTrieNode {
  children: Map<string, AliasTrieNode>;
  entries: WeightedAliasVariant[];
}

export class AliasTrie {
  private readonly root: AliasTrieNode = { children: new Map(), entries: [] };

  constructor(variants: WeightedAliasVariant[] = []) {
    for (const variant of variants) this.add(variant);
  }

  add(variant: WeightedAliasVariant): void {
    let node = this.root;
    for (const char of variant.alias) {
      const next = node.children.get(char) ?? { children: new Map(), entries: [] };
      node.children.set(char, next);
      node = next;
    }
    node.entries.push(variant);
    node.entries.sort((a, b) => b.weight - a.weight || a.word.localeCompare(b.word, "ne"));
  }

  lookup(alias: string): WeightedAliasVariant[] {
    let node = this.root;
    for (const char of alias.toLowerCase()) {
      const next = node.children.get(char);
      if (!next) return [];
      node = next;
    }
    return node.entries.slice();
  }

  longestPrefix(input: string, start = 0): AliasTrieMatch | undefined {
    let node = this.root;
    let best: AliasTrieMatch | undefined;
    for (let index = start; index < input.length; index += 1) {
      const next = node.children.get(input[index].toLowerCase());
      if (!next) break;
      node = next;
      if (node.entries.length > 0) {
        best = { alias: input.slice(start, index + 1).toLowerCase(), entries: node.entries.slice() };
      }
    }
    return best;
  }
}
