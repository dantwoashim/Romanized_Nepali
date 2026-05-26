# Romanized Confidence Gate

Updated: 2026-05-26

## Contract

Lekh either:

1. auto-converts when correctness is justified,
2. exposes ranked candidates when ambiguous,
3. preserves/warns/refuses mutation when unsafe.

## Current Signals

- Latin residue outside protected spans
- close rank gap between top candidates
- missing candidates in strict mode
- protected-span survival
- selected output represented in candidate list

## Statuses

- `auto`: selected output can be used normally.
- `ambiguous`: alternatives should be exposed and the UI should avoid presenting the result as definitive.
- `preserve`: mixed/document context preserved text rather than forcing conversion.
- `unsafe`: reserved for future stricter refusal behavior.

## Current Limitations

- The gate is conservative but not a full probabilistic model.
- Imported Hunspell aliases can create many collisions; those are reported separately.
- Real-user correction memory is local and explicit; it is not promoted into global data.
