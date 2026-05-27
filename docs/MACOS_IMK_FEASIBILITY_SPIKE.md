# macOS InputMethodKit Feasibility Spike

Generated: 2026-05-27

This document specifies the macOS feasibility spike for Prompt 3. It is not a production InputMethodKit implementation.

## Goal

Prove that a minimal macOS input method can:

- receive a key event;
- update marked text;
- show one dummy candidate;
- commit static Unicode;
- pass through safely when XPC/engine is unavailable;
- document uninstall behavior.

## Architecture Requirement

The macOS input method bundle should communicate with the engine through XPC.

Do not leave this as vague local IPC. Input method bundles are sandboxed/restricted, and the XPC boundary must be explicit before production integration.

## Acceptance

- Minimal IMK skeleton receives key events.
- Marked text works.
- Dummy candidate appears.
- Static Unicode commit works.
- If XPC is unavailable, the input method fails open and passes through.

## Non-Goals

- No production IMK implementation in Prompt 1.
- No final candidate panel.
- No notarization.
- No settings companion integration.

## Prompt 1 Status

Prompt 1 only defines this specification and the `KeyboardEngine.processKeyStroke` contract that a future IMK bridge will call.
