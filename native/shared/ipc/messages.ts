import type {
  Candidate,
  CandidateUpdate,
  CommitResult,
  DictionaryResult,
  KeyboardKeyEvent,
  KeyboardMode,
  ProofHint,
  SessionId,
  TypingContext,
  WarmOptions,
  WarmResult
} from "../../../src/engine/keyboard/types";

export const IPC_SCHEMA_VERSION = 1 as const;

export type IpcMessageType =
  | "health.check"
  | "engine.warm"
  | "session.begin"
  | "session.processKeyStroke"
  | "session.updateComposition"
  | "session.commitCandidate"
  | "session.commitRaw"
  | "session.cancel"
  | "session.end"
  | "session.setMode"
  | "session.setLayout"
  | "suggestions.get"
  | "proofHints.get"
  | "dictionary.lookup"
  | "memory.learn"
  | "engine.shutdown";

export interface IpcRequest<T = unknown> {
  id: string;
  type: IpcMessageType;
  version: typeof IPC_SCHEMA_VERSION;
  sentAt: number;
  payload: T;
}

export interface IpcResponse<T = unknown> {
  id: string;
  type: IpcMessageType;
  version: typeof IPC_SCHEMA_VERSION;
  ok: boolean;
  payload?: T;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  latencyMs?: number;
}

export interface HealthCheckPayload {
  client: "windows-tsf" | "macos-imk" | "companion" | "daemon-test";
}

export interface HealthCheckResult {
  status: "ok" | "degraded";
  daemonVersion?: string;
  engineReady: boolean;
  warnings: string[];
}

export interface BeginSessionPayload {
  context: TypingContext;
}

export interface BeginSessionResult {
  sessionId: SessionId;
}

export interface ProcessKeyStrokePayload {
  sessionId: SessionId;
  key: KeyboardKeyEvent;
}

export interface UpdateCompositionPayload {
  sessionId: SessionId;
  input: string;
  cursor: number;
}

export interface CommitCandidatePayload {
  sessionId: SessionId;
  candidateId: string;
}

export interface SessionPayload {
  sessionId: SessionId;
}

export interface SetModePayload {
  sessionId: SessionId;
  mode: KeyboardMode;
}

export interface SetLayoutPayload {
  sessionId: SessionId;
  layoutId: string;
}

export interface SuggestionsPayload {
  context: TypingContext;
}

export interface ProofHintsPayload {
  textWindow: string;
  context?: TypingContext;
}

export interface DictionaryLookupPayload {
  query: string;
  context?: TypingContext;
}

export interface MemoryLearnPayload {
  entry: unknown;
}

export type IpcPayloadByType = {
  "health.check": HealthCheckPayload;
  "engine.warm": WarmOptions | undefined;
  "session.begin": BeginSessionPayload;
  "session.processKeyStroke": ProcessKeyStrokePayload;
  "session.updateComposition": UpdateCompositionPayload;
  "session.commitCandidate": CommitCandidatePayload;
  "session.commitRaw": SessionPayload;
  "session.cancel": SessionPayload;
  "session.end": SessionPayload;
  "session.setMode": SetModePayload;
  "session.setLayout": SetLayoutPayload;
  "suggestions.get": SuggestionsPayload;
  "proofHints.get": ProofHintsPayload;
  "dictionary.lookup": DictionaryLookupPayload;
  "memory.learn": MemoryLearnPayload;
  "engine.shutdown": undefined;
};

export type IpcResultByType = {
  "health.check": HealthCheckResult;
  "engine.warm": WarmResult;
  "session.begin": BeginSessionResult;
  "session.processKeyStroke": CandidateUpdate;
  "session.updateComposition": CandidateUpdate;
  "session.commitCandidate": CommitResult;
  "session.commitRaw": CommitResult;
  "session.cancel": { cancelled: true };
  "session.end": { ended: true };
  "session.setMode": { mode: KeyboardMode };
  "session.setLayout": { layoutId: string };
  "suggestions.get": Candidate[];
  "proofHints.get": ProofHint[];
  "dictionary.lookup": DictionaryResult[];
  "memory.learn": { learned: boolean };
  "engine.shutdown": { shutdown: true };
};

export type TypedIpcRequest<T extends IpcMessageType> = IpcRequest<IpcPayloadByType[T]> & {
  type: T;
};

export type TypedIpcResponse<T extends IpcMessageType> = IpcResponse<IpcResultByType[T]> & {
  type: T;
};

export function createIpcRequest<T extends IpcMessageType>(
  type: T,
  payload: IpcPayloadByType[T],
  id = cryptoSafeId(),
  sentAt = Date.now()
): TypedIpcRequest<T> {
  return {
    id,
    type,
    version: IPC_SCHEMA_VERSION,
    sentAt,
    payload
  };
}

function cryptoSafeId(): string {
  return `ipc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
