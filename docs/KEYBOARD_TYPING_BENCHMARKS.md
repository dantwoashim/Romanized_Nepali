# Keyboard Typing Benchmarks

Updated: 2026-05-27

The typing-session benchmark measures live `KeyboardEngine` behavior. It is separate from paste-based conversion benchmarks.

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
- `bench/fixtures/typing-session/romanized-live-basic.jsonl`
- `bench/fixtures/typing-session/romanized-live-government.jsonl`
- `bench/fixtures/typing-session/romanized-helper.jsonl`
- `bench/fixtures/typing-session/romanized-protected.jsonl`
- `bench/fixtures/typing-session/traditional-unicode-suggestions.jsonl`
- `bench/fixtures/typing-session/proofread-live.jsonl`
- `bench/fixtures/typing-session/dictionary-lookup.jsonl`
- `bench/fixtures/typing-session/memory-ranking.jsonl`
- `bench/fixtures/typing-session/next-word.jsonl`

Traditional physical key mapping remains pending. Traditional Unicode suggestions are measured separately from placeholder physical-key sessions.

## Metrics

The report includes:

- total sessions;
- suite-separated pass counts;
- top-1 and top-3 hit rates;
- proof hint hit rate;
- dictionary hit rate;
- memory boost success rate;
- next-word success rate;
- candidate/update/commit latency;
- keystroke savings ratio baseline;
- warnings and failed sessions.

## Keystroke Savings Ratio

```text
KSR = 1 - (keystrokes_to_commit / committed_Devanagari_character_count)
```

KSR is currently a baseline signal for the browser Keyboard Lab. It is not a product claim.

## Current Status

Latest Prompt 2 run:

- fixtures: 33;
- failed sessions: 0;
- Romanized top-1/top-3: 1.0 on locked typing fixtures;
- Traditional placeholder sessions: 2;
- Traditional Unicode suggestion sessions: 3;
- proofread, dictionary, memory, and next-word fixture hit rates: 1.0;
- candidate p95: about 2 ms in the latest report.

## Safety Notes

- No fixture file may silently pass with zero cases.
- Placeholder Traditional success does not mean physical Traditional typing is implemented.
- Protected tokens such as `NID form`, email addresses, and `Form No. 2079-080` must remain byte-exact.
