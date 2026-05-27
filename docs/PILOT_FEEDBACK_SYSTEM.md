# Pilot Feedback System

Generated: 2026-05-28

Status: ready for consented pilot setup; no real pilot data exists yet.

## Rules

- Opt-in only.
- No hidden typed-text collection.
- No background telemetry.
- Users submit examples manually.
- Examples must be redacted before import.
- Consent metadata is required for every submitted example.

## Feedback Form Fields

- mode: Romanized, Traditional Unicode, Traditional physical, proofread, dictionary, companion, native Windows, native macOS.
- input.
- expected output.
- current output.
- app/platform.
- protected tokens involved: yes/no.
- secure field involved: yes/no.
- screenshot optional.
- consent checkbox.
- redaction confirmation checkbox.

## Issue Template

```md
### Mode

### Input

### Expected output

### Current output

### App/platform

### Protected tokens involved

### Secure field involved

### Consent
- [ ] I consent to Lekh using this redacted example for debugging and benchmark fixtures.
- [ ] I removed private names, passwords, IDs, phone numbers, addresses, and account data.
```

## Metrics

- candidate acceptance rate.
- top-1 acceptance.
- top-3 inclusion.
- correction acceptance.
- ignored suggestions.
- dictionary misses.
- layout complaints.
- latency complaints.
- crash reports.
- mode preference.

## Import Path

Only consented/redacted examples may be converted into fixtures. Fixture additions must preserve source notes and must not include real personal data.
