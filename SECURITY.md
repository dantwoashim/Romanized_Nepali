# Security Policy

Lekh Assistant is a local-first web/PWA validation product. Security reports are welcome, especially around privacy boundaries, text leakage, dependency risk, service worker behavior, and cross-site scripting.

## Supported Version

The supported branch is `main`.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| older commits or forks | No |

## Reporting a Vulnerability

Please do not open a public issue with exploit details or private user text.

Preferred path:

1. Use GitHub private vulnerability reporting for this repository if it is enabled.
2. If private reporting is unavailable, contact the repository maintainer through the maintainer contact listed on GitHub and include `SECURITY` in the subject.

Include:

- affected area: Preeti converter, Romanized editor, feedback, service worker, dependency, build pipeline, or documentation
- reproduction steps
- expected vs actual behavior
- browser and operating system
- whether any text left the browser

Do not include real private documents, government IDs, phone numbers, addresses, or secrets.

## Security Expectations

- Typed text, converted text, dictionary queries, clipboard content, spell tokens, and output text must not leave the browser automatically.
- Feedback may contain text only after explicit user action.
- Local correction memory must stay in browser storage.
- New dependencies must have a clear license, active maintenance, and a reason to exist.
- Service worker changes must pass `npm run check:offline`.
