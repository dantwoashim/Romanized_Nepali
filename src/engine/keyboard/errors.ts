import type { SessionId } from "./types";

export class KeyboardSessionError extends Error {
  constructor(message: string, readonly sessionId?: SessionId) {
    super(message);
    this.name = "KeyboardSessionError";
  }
}

export function unknownSessionError(sessionId: SessionId): KeyboardSessionError {
  return new KeyboardSessionError(`Unknown keyboard session: ${sessionId}`, sessionId);
}
