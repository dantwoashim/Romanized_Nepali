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
    if (!this.sessions.has(sessionId)) return unknownSessionUpdate(sessionId, input, cursor);
    this.sessions.updateComposition(sessionId, input, cursor);
    return this.refresh(sessionId);
  }

  processKeyStroke(sessionId: SessionId, key: KeyboardKeyEvent): CandidateUpdate {
    if (!this.sessions.has(sessionId)) return unknownSessionUpdate(sessionId, "", 0);
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
    if (!this.sessions.has(sessionId)) return emptyCommitResult(sessionId);
    const session = this.sessions.get(sessionId);
    const candidate = this.cache.find(sessionId, candidateId) ?? session.candidates.find((item) => item.id === candidateId);
    if (!candidate) return emptyCommitResult(sessionId);
    if (candidate.type === "romanized-helper") {
      this.sessions.updateComposition(sessionId, candidate.text, candidate.text.length);
      this.cache.set(sessionId, this.refresh(sessionId).candidates);
      return {
        sessionId,
        committedText: "",
        consumedRange: candidate.replaceRange ?? [0, session.compositionText.length],
        followupCandidates: [],
        memoryRecorded: false,
        schemaVersion: 1
      };
    }
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
    if (!this.sessions.has(sessionId)) return emptyCommitResult(sessionId);
    const session = this.sessions.get(sessionId);
    const result = commitRawResult(session);
    result.followupCandidates = nextWordCandidates(result.committedText, session);
    this.sessions.recordCommit(sessionId, result.committedText);
    this.cache.clear(sessionId);
    return result;
  }

  cancelComposition(sessionId: SessionId): void {
    if (!this.sessions.has(sessionId)) return;
    this.sessions.cancelComposition(sessionId);
    this.cache.clear(sessionId);
  }

  endSession(sessionId: SessionId): void {
    if (!this.sessions.has(sessionId)) return;
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
    if (!this.sessions.has(sessionId)) return;
    this.sessions.setMode(sessionId, mode);
    this.cache.clear(sessionId);
  }

  setLayout(sessionId: SessionId, layoutId: string): void {
    if (!this.sessions.has(sessionId)) return;
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

function unknownSessionUpdate(sessionId: SessionId, input: string, cursor: number): CandidateUpdate {
  return {
    sessionId,
    mode: "diagnostic",
    surface: "romanized-to-unicode",
    compositionText: input,
    displayText: input,
    caret: Math.max(0, Math.min(input.length, Math.trunc(cursor))),
    candidates: [],
    proofHints: [],
    shouldShowCandidateUI: false,
    confidence: 0,
    warnings: [`Unknown keyboard session: ${sessionId}; preserving input.`],
    latencyMs: 0,
    schemaVersion: 1
  };
}

export function createKeyboardEngine(): KeyboardEngine {
  return new LocalKeyboardEngine();
}

export * from "./types";
export * from "./modes";
export * from "./ranges";
export * from "./warm";
export * from "./storage";
