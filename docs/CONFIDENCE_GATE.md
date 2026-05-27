# Confidence Gate

The confidence gate turns span and document evidence into one of five actions:

| Action | Meaning |
| --- | --- |
| `auto` | High confidence and validators pass. |
| `candidates` | Multiple plausible outputs or low margin. |
| `preserve` | Protected or policy-preserved span. |
| `warn` | Risky or incomplete evidence; output is not silently trusted. |
| `refuse` | Validators detect likely corruption. |

Validators include protected span integrity, Unicode combining sanity, leftover sentinel detection, malformed final `aa` detection, and unsafe low-confidence span detection.

Silent corruption is counted when output is wrong, the action is `auto`, and no warning/candidate/refusal was emitted. The locked mixed-span mutation suite currently reports a silent corruption rate of `0`.
