# Keyboard Typing Benchmarks

Generated: 2026-05-27

The typing-session benchmark measures the `KeyboardEngine` session API. It is separate from one-shot conversion benchmarks.

## Command

```bash
npm run benchmark:typing-session
```

The command writes:

```text
bench/reports/typing-session-report.json
```

## Fixture Sets

- `bench/fixtures/typing-session/romanized-basic.jsonl`
- `bench/fixtures/typing-session/romanized-government.jsonl`
- `bench/fixtures/typing-session/traditional-placeholder.jsonl`

Traditional sessions are intentionally reported as placeholders until the source-of-truth layout audit is complete.

## Metrics

The benchmark reports:

- total sessions;
- top-1 hit rate;
- top-3 hit rate;
- candidate latency p50/p95;
- update latency p95;
- commit latency p95;
- keystroke savings ratio baseline;
- failed sessions;
- warnings;
- placeholder Traditional sessions separately.

## Keystroke Savings Ratio

Prompt 1 reports a baseline KSR:

```text
KSR = 1 - (keystrokes_to_commit / committed_Devanagari_character_count)
```

This number is only a baseline for the browser/web-lab simulator. The final product metric should compare Romanized typing to the audited Traditional layout fixture once the layout audit is complete.

Initial future target:

```text
> 50% keystroke savings for common government/office vocabulary in Romanized mode
```

That target is not enforced in Prompt 1.

## Current Status

Latest Prompt 1 run:

- fixtures: 11;
- Romanized sessions: 9;
- Traditional placeholder sessions: 2;
- Romanized top-1: 1.0;
- Romanized top-3: 1.0;
- failed sessions: 0;
- candidate p95: about 14 ms in the scorecard run.

## Safety Notes

- No benchmark fixture may silently pass with zero cases.
- Traditional placeholder success does not mean Traditional typing is implemented.
- Mixed protected tokens such as `NID form` are expected to remain byte-exact in Romanized office examples.
