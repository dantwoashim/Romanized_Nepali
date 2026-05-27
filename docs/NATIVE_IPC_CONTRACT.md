# Native IPC Contract

The Lekh native IPC contract maps directly to `KeyboardEngine`. It is local-only, versioned, and designed for fail-open keyboard behavior.

Schema and TypeScript definitions:

- `native/shared/ipc/lekh-keyboard-ipc.schema.json`
- `native/shared/ipc/messages.ts`

## Envelope

```ts
interface IpcRequest<T = unknown> {
  id: string;
  type: string;
  version: 1;
  sentAt: number;
  payload: T;
}

interface IpcResponse<T = unknown> {
  id: string;
  type: string;
  version: 1;
  ok: boolean;
  payload?: T;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  latencyMs?: number;
}
```

## Message Types

| IPC type | KeyboardEngine method |
| --- | --- |
| `health.check` | daemon health wrapper |
| `engine.warm` | `warm` |
| `session.begin` | `beginSession` |
| `session.processKeyStroke` | `processKeyStroke` |
| `session.updateComposition` | `updateComposition` |
| `session.commitCandidate` | `commitCandidate` |
| `session.commitRaw` | `commitRaw` |
| `session.cancel` | `cancelComposition` |
| `session.end` | `endSession` |
| `session.setMode` | `setMode` |
| `session.setLayout` | `setLayout` |
| `suggestions.get` | `getSuggestions` |
| `proofHints.get` | `getProofHints` |
| `dictionary.lookup` | `lookupDictionary` |
| `memory.learn` | `learnCorrection` |
| `engine.shutdown` | `shutdown` |

## Timeout Policy

- Common keystroke target: under 10 ms.
- Hard keystroke IPC timeout: 50 ms.
- On timeout, native shell passes through or preserves composition safely.
- Host apps must never freeze while waiting for the daemon.

## Encoding

- Production preference: length-prefixed CBOR or MessagePack.
- Debug mode: JSON.
- The schema is versioned as `version: 1`.

## Security

- IPC is local-only.
- Windows uses a per-user named pipe.
- macOS uses app-group scoped XPC.
- Cross-user connections are rejected.
- No remote TCP listener is allowed.
- No typed text telemetry is sent to network services.
