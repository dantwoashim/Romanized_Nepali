# Validation Plan

## Target Users

- 5 government/admin users
- 5 school/admin users
- 5 writers/journalists/content users
- 5 legal/accounting/office users
- 5 Nepali tech/Mac/developer users

## Preeti Real-Document Gate

Before claiming real-document Preeti quality, collect and process 30-50 consented Preeti documents through `docs/REAL_PREETI_VALIDATION.md`.

Track per document:

- domain, source format, permission id, and de-identified source label
- segment type: sentence, table row, form field, or paragraph
- failure type: matra reordering, half-letter, reph, punctuation, layout, mixed English, font variant, or unknown
- exact conversion result, warning codes, and manual acceptance status

Raw documents and private manifests stay out of git.

## Romanized Quality Gate

Run `npm run report:quality` after fixture or engine changes. Public comparison claims require named baselines and measured precision@1, precision@5, suggestion hit rate, and p95 latency on a frozen fixture set.

No public "best" or similar claim is allowed until measured against named tools under the same test inputs.

## Pre-Demo Questions

1. What do you use today to type Nepali on desktop?
2. Do you use Preeti, Unicode Traditional, Romanized web tools, Google Input Tools, mobile copy/paste, or something else?
3. Where does it waste the most time?
4. Do you ever need to convert old Preeti text to Unicode?
5. Would you try a local/private desktop version if the web demo works well?

## Outreach Message

I am testing Lekh, a local-first Nepali typing workspace for desktop workflows. It converts old Preeti text to Unicode and includes a preview Romanized Nepali editor with local suggestions. Would you try the web demo for five minutes and tell me where it fails your real work?

## Continue Criteria

Continue to a 30-day preview if several of these are true:

- 10 qualified users try the demo.
- 5 submit specific feedback.
- 3 ask for a desktop version or installer.
- 2 mention a real Preeti/Unicode workflow.
- 1 office/government/school/legal user gives concrete workflow detail.
- Someone submits bad-conversion or bad-romanization examples.

## Pause or Narrow Criteria

Pause or narrow if feedback is only generic praise, qualified users do not use it, no one wants a desktop version, Preeti conversion is not useful, Romanized output feels worse than current tools, or data licensing blocks useful functionality.
