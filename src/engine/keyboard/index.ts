import { CandidateCache } from "./cache";
import { buildCandidateUpdate } from "./candidates";
import { applyKeyToComposition } from "./composition";
import { commitCandidateResult, commitRawResult, emptyCommitResult } from "./commit";
import { nextWordCandidates } from "./followups";
import { getKeyboardProofHints } from "./proofHints";
import { lookupKeyboardDictionary } from "./dictionary";
import { importKeyboardMemoryEntry, recordKeyboardMemorySelection } from "./memory";
import { KeyboardSessionManager } from "./session";
import { getKeyboardSuggestions } from "./suggest";
import { warmKeyboard } from "./warm";
import type {
  Candidate,
  CandidateUpdate,
  CommitResult,
  KeyboardEngine,
  KeyboardKeyEvent,
  KeyboardMode,
  SessionId,
  TypingContext,
  WarmOptions,
  WarmResult
} from "./types";
import type { CorrectionMemoryEntry } from "../memory";

export class LocalKeyboardEngine implements KeyboardEngine {
  private readonly sessions = new KeyboardSessionManager();
  private readonly cache = new CandidateCache();
  private memoryEntries: CorrectionMemoryEntry[] = [];

  beginSession(context: TypingContext): SessionId {
    return this.sessions.beginSession(context);
  }

  updateComposition(sessionId: SessionId, input: string, cursor: number): CandidateUpdate {
    this.sessions.updateComposition(sessionId, input, cursor);
    return this.refresh(sessionId);
  }

  processKeyStroke(sessionId: SessionId, key: KeyboardKeyEvent): CandidateUpdate {
    const session = this.sessions.get(sessionId);
    const mutation = applyKeyToComposition(session.compositionText, session.caret, key);
    if (mutation.command === "cancel") {
      this.cancelComposition(sessionId);
      return this.refresh(sessionId);
    }
    if (mutation.command === "commit-primary") {
      const update = this.refresh(sessionId);
      if (update.primary && update.primary.confidence >= 0.86) {
        this.commitCandidate(sessionId, update.primary.id);
      } else if (key.key === "Enter") {
        this.commitRaw(sessionId);
      } else {
        const withSpace = `${session.compositionText} `;
        this.sessions.updateComposition(sessionId, withSpace, withSpace.length);
      }
      return this.refresh(sessionId);
    }
    this.sessions.updateComposition(sessionId, mutation.text, mutation.caret);
    const update = this.refresh(sessionId);
    if (mutation.warning) {
      return { ...update, warnings: Array.from(new Set([...update.warnings, mutation.warning])) };
    }
    if (mutation.command === "expand-candidates") {
      return { ...update, shouldShowCandidateUI: true };
    }
    return update;
  }

  commitCandidate(sessionId: SessionId, candidateId: string): CommitResult {
    const session = this.sessions.get(sessionId);
    const candidate = this.cache.find(sessionId, candidateId) ?? session.candidates.find((item) => item.id === candidateId);
    if (!candidate) return emptyCommitResult(sessionId);
    const result = commitCandidateResult(session, candidate);
    if (result.memoryRecorded) {
      this.memoryEntries = recordKeyboardMemorySelection(this.memoryEntries, session, candidate);
    }
    result.followupCandidates = nextWordCandidates(result.committedText, session);
    this.sessions.recordCommit(sessionId, result.committedText);
    this.cache.clear(sessionId);
    return result;
  }

  commitRaw(sessionId: SessionId): CommitResult {
    const session = this.sessions.get(sessionId);
    const result = commitRawResult(session);
    result.followupCandidates = nextWordCandidates(result.committedText, session);
    this.sessions.recordCommit(sessionId, result.committedText);
    this.cache.clear(sessionId);
    return result;
  }

  cancelComposition(sessionId: SessionId): void {
    this.sessions.cancelComposition(sessionId);
    this.cache.clear(sessionId);
  }

  endSession(sessionId: SessionId): void {
    this.sessions.endSession(sessionId);
    this.cache.clear(sessionId);
  }

  getSuggestions(context: TypingContext): Candidate[] {
    return getKeyboardSuggestions(context);
  }

  getProofHints(textWindow: string, context?: TypingContext) {
    return getKeyboardProofHints(textWindow, context);
  }

  lookupDictionary(query: string, context?: TypingContext) {
    return lookupKeyboardDictionary(query, context);
  }

  learnCorrection(entry: unknown): void {
    this.memoryEntries = importKeyboardMemoryEntry(this.memoryEntries, entry);
  }

  setMode(sessionId: SessionId, mode: KeyboardMode): void {
    this.sessions.setMode(sessionId, mode);
    this.cache.clear(sessionId);
  }

  setLayout(sessionId: SessionId, layoutId: string): void {
    this.sessions.setLayout(sessionId, layoutId);
  }

  warm(options?: WarmOptions): Promise<WarmResult> {
    return warmKeyboard(options);
  }

  async shutdown(): Promise<void> {
    this.sessions.shutdown();
    this.cache.clearAll();
    this.memoryEntries = [];
  }

  private refresh(sessionId: SessionId): CandidateUpdate {
    const session = this.sessions.get(sessionId);
    const textWindow = `${session.context.leftTextWindow}${session.compositionText}`;
    const proofHints = getKeyboardProofHints(textWindow, session.context);
    this.sessions.updateProofHints(sessionId, proofHints);
    const update = buildCandidateUpdate(this.sessions.get(sessionId), { memoryEntries: this.memoryEntries });
    this.sessions.updateCandidates(sessionId, update.candidates, update.warnings);
    this.cache.set(sessionId, update.candidates);
    return update;
  }
}

export function createKeyboardEngine(): KeyboardEngine {
  return new LocalKeyboardEngine();
}

export * from "./types";
export * from "./modes";
export * from "./ranges";
export * from "./warm";
