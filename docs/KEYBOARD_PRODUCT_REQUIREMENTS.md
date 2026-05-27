# Keyboard Product Requirements

Generated: 2026-05-27

## Goal

Build Lekh Keyboard into a high-quality Nepali desktop keyboard for Windows and macOS while keeping all typing local-first and avoiding fake production claims.

## Required User Capabilities

| Capability | Prompt 1 status |
| --- | --- |
| Romanized typing | prototype exists through KeyboardEngine |
| Traditional typing | physical keymap pending source-of-truth audit |
| Unicode candidates | implemented for Romanized and Unicode-prefix paths |
| Romanized helper suggestions | implemented as secondary surface |
| Romanized labels | supported when enabled |
| Proofread while typing | implemented as conservative hints |
| Dictionary lookup | implemented without unsafe meanings |
| Personal correction memory | implemented locally and disabled in secure fields |
| Native Windows TSF | scaffold/docs only |
| Native macOS IMK | scaffold/docs only |
| Companion app | architecture scaffold only |
| Installer/release path | documented, not built |

## Non-Negotiable Product Rules

- Preeti conversion is a side utility, not the keyboard core.
- Browser Keyboard Lab is validation, not the shipped product.
- Companion app is settings/diagnostics, not an IME shortcut.
- No global keyboard hook may be described as a production IME.
- No unsafe dictionary meanings may be added.
- No hidden telemetry or typed-text collection.
- No production native claim without platform testing.

## Production Acceptance Themes

- stable local verification;
- honest scorecards;
- no duplicate candidates or shortcut gaps;
- verified Traditional layout;
- fail-open native shell behavior;
- strict IPC timeouts;
- redacted diagnostics;
- signed/notarized installers;
- pilot feedback with consent.
