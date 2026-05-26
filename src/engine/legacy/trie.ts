import type { LegacyTokenMapping } from "./types";

export interface LegacyTrieMatch {
  token: string;
  mapping: LegacyTokenMapping;
  end: number;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  mapping?: LegacyTokenMapping;
}

export class LegacyMappingTrie {
  private readonly root: TrieNode = { children: new Map() };

  add(token: string, mapping: LegacyTokenMapping): void {
    let node = this.root;
    for (const char of Array.from(token)) {
      const next = node.children.get(char) ?? { children: new Map() };
      node.children.set(char, next);
      node = next;
    }
    node.mapping = mapping;
  }

  longest(input: string, start: number): LegacyTrieMatch | undefined {
    let node = this.root;
    let best: LegacyTrieMatch | undefined;
    const chars = Array.from(input.slice(start));
    let offset = 0;

    for (const char of chars) {
      const next = node.children.get(char);
      if (!next) break;
      offset += char.length;
      node = next;
      if (node.mapping) {
        best = {
          token: input.slice(start, start + offset),
          mapping: node.mapping,
          end: start + offset
        };
      }
    }

    return best;
  }
}
