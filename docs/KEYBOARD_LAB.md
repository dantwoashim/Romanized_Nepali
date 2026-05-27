# Keyboard Lab

Updated: 2026-05-27

Keyboard Lab is the browser simulator for the `KeyboardEngine` session API. It is not the final native keyboard app.

## How To Open

1. Run the web app.
2. Open the `Keyboard Lab` tab.
3. Choose Romanized, Traditional, Proofread, or Diagnostic mode.

## Visible Surfaces

Keyboard Lab shows:

- raw `compositionText`;
- Unicode `displayText`;
- confidence and latency;
- top candidates;
- optional Romanized labels;
- candidate reasons;
- proof hints;
- dictionary lookup;
- memory recording status;
- next-word followups after commit;
- warnings.

## Commit Controls

- Candidate chips commit the selected candidate.
- `Commit raw` commits the active buffer.
- `Cancel` clears composition.
- `New session` resets local session state.
- `Warm` exercises the warm-start contract.

## Current Caveats

- Traditional physical key mapping remains pending.
- Dictionary meanings are omitted unless a safe licensed source is added.
- Native candidate windows and OS composition are Prompt 3 scope.
