# Preeti Deterministic Decoder

Checked: 2026-05-26

The verifier-gated deterministic decoder runs beside the existing baseline converter. It does not remove the baseline and it does not cut over by optimism.

## Architecture

Runtime path:

1. Detect/select legacy profile.
2. Tokenize with greedy longest-match semantic mappings.
3. Emit `LegacyToken[]` with typed `LegacyAtom[]`.
4. Assemble Unicode from reviewed token previews/atoms.
5. Verify output structure and profile confidence.
6. Compare atom output with the baseline converter.
7. Select output according to `legacyDecoder`.

Supported option:

```ts
legacyDecoder?: "baseline" | "atom" | "compare" | "auto";
```

Selection policy:

- `baseline`: always uses the existing converter.
- `compare`: runs both paths but selects baseline.
- `auto`: selects atom output only when verifier status is clean.
- `atom`: selects atom output when verifier does not mark it unsafe.

Default user-facing behavior remains conservative: the baseline is preserved while atom diagnostics are surfaced.

## Core Files

- `src/engine/legacy/profile.ts`: semantic profile generation from safe bundled maps.
- `src/engine/legacy/types.ts`: profile, token, atom, verification contracts.
- `src/engine/legacy/tokenizer.ts`: greedy longest-match tokenizer.
- `src/engine/legacy/assembleUnicode.ts`: atom/token Unicode assembly.
- `src/engine/legacy/verifier.ts`: structural safety checks.
- `src/engine/legacy/decoder.ts`: parallel deterministic decode path.
- `src/engine/legacy/profileDetection.ts`: profile selection and unsupported-profile diagnostics.

## Verifier Checks

The verifier catches:

- unknown tokens
- unsupported profiles
- low profile confidence when coverage is also low
- dangling prebase matra
- malformed/repeated reph markers
- dangling virama warnings
- protected-span mutation
- non-NFC output

Unsafe output does not silently replace the baseline.

## Current Scope

Preeti is the only supported semantic profile. Kantipur, Sagarmatha, and Himali remain planned/diagnostic-only because no verified bundle-safe maps are present.

Generated oracle and fuzz suites are regression pressure. They are not a substitute for consented real documents.
