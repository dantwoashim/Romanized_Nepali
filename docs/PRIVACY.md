# Privacy

Lekh Assistant is local-first.

## Local Processing

Preeti conversion, Romanized typing, suggestions, spell hints, normalization, and copy output run in the browser. The app does not send typed text, converted text, dictionary queries, raw keystrokes, spell tokens, clipboard content, or output text to a server.

## Feedback

Feedback is explicit. The feedback form prepares a message from fields the user chooses to submit. If no feedback email is configured for deployment, the form copies or exports the report locally instead of sending it anywhere.

## Metrics

The week-1 app does not send analytics. A local guard exists for any future event-only metrics. If metrics are added later, they may include event names such as mode selection or copy clicked, but never text content.

## Offline

The app registers a service worker and caches the app shell after first load. Core engines and seed data are bundled with the app, so the main tools continue to work offline after the first successful load.
