# Engine Contract

This contract mirrors the shared project shapes and is the source imported by the TypeScript app.

```ts
export interface TextWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
}

export interface NepaliTextResult {
  input: string;
  output: string;
  normalizedOutput: string;
  warnings: TextWarning[];
}

export interface Candidate {
  text: string;
  normalizedText: string;
  score: number;
  source: "rule" | "dictionary" | "variant" | "user-feedback";
  reason: string;
}

export interface TokenTrace {
  input: string;
  output: string;
  rule: string;
  notes?: string[];
}

export interface RomanizedResult extends NepaliTextResult {
  candidates: Candidate[];
  trace: TokenTrace[];
}

export interface ConversionWarning extends TextWarning {
  sourceChar?: string;
  position?: number;
}

export interface PreetiResult extends NepaliTextResult {
  changedCount: number;
  uncertainMappings: ConversionWarning[];
}

export interface Suggestion {
  word: string;
  normalizedWord: string;
  romanized?: string;
  score: number;
  domain: "common" | "government" | "education" | "legal" | "office" | "names" | "places";
  source: string;
}
```

Rules:

- Every output path returns normalized output.
- Romanized behavior follows `docs/PHONOLOGY_CONTRACT.md`.
- Romanized output is ranked through a candidate lattice: local correction memory, reviewed phrase candidates, dictionary candidates, rule candidates, and ambiguity variants.
- Local correction memory stays in browser storage and is written only after an explicit candidate choice.
- Engines expose warnings instead of claiming perfection.
- Dictionary ranking may promote known words, but must not silently contradict the phonology contract.
