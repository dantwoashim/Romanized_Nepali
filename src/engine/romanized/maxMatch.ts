export interface MaxMatchRule<T = string> {
  input: string;
  output: T;
  weight?: number;
}

export interface MaxMatchResult<T = string> {
  input: string;
  output: T;
  start: number;
  end: number;
  weight: number;
}

export class MaxMatchTrie<T = string> {
  private readonly root: TrieNode<T> = { children: new Map() };

  constructor(rules: MaxMatchRule<T>[] = []) {
    for (const rule of rules) this.add(rule);
  }

  add(rule: MaxMatchRule<T>): void {
    let node = this.root;
    for (const char of Array.from(rule.input.toLowerCase())) {
      const next = node.children.get(char) ?? { children: new Map() };
      node.children.set(char, next);
      node = next;
    }
    node.rule = rule;
  }

  match(input: string, start: number): MaxMatchResult<T> | undefined {
    let node = this.root;
    let best: MaxMatchResult<T> | undefined;
    const lower = input.toLowerCase();

    for (let index = start; index < lower.length; index += 1) {
      const next = node.children.get(lower[index]);
      if (!next) break;
      node = next;
      if (node.rule) {
        best = {
          input: input.slice(start, index + 1),
          output: node.rule.output,
          start,
          end: index + 1,
          weight: node.rule.weight ?? 1
        };
      }
    }

    return best;
  }
}

interface TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  rule?: MaxMatchRule<T>;
}
