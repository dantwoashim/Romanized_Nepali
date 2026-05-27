# Release Channels And Updates

No public release is claimed.

## Channels

| Channel | Purpose | Requirements |
| --- | --- | --- |
| internal dev build | engineering smoke tests | local signing or debug install |
| private pilot | controlled user feedback | consent policy, crash fallback, uninstall path |
| LTK/Niraj review build | Traditional layout and workflow review | layout audit package, feedback template |
| public beta | broader validation | signed builds, privacy review, update path |
| stable release | general users | native QA, signing/notarization, pilot evidence |

## Update Policy

- Updates are signed.
- Daemon restarts outside hot path.
- Rollback is possible.
- User data migrations are versioned.
- Privacy defaults remain local-first.
