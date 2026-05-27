# Windows TSF Feasibility Spike

Generated: 2026-05-27

This document specifies the Windows feasibility spike for Prompt 3. It is not a production TSF implementation.

## Goal

Prove that a minimal Windows Text Services Framework input method can:

- receive a key event;
- start composition;
- show one dummy candidate;
- commit static Unicode;
- pass through safely when the engine daemon is unavailable;
- unregister cleanly.

## Acceptance

- A minimal TSF skeleton can type `क` into Notepad.
- A dummy candidate list can appear.
- Static Unicode commit works.
- Disable/unregister cleanup is documented.
- Host apps do not freeze if the daemon is unavailable.

## Non-Goals

- No full Romanized engine integration.
- No final candidate UI.
- No installer.
- No production signing.
- No private user-data collection.

## Prompt 1 Status

Prompt 1 only defines this specification and the `KeyboardEngine.processKeyStroke` contract that a future TSF bridge will call.
