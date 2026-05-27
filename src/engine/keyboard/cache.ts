import type { Candidate, SessionId } from "./types";

export class CandidateCache {
  private readonly bySession = new Map<SessionId, Candidate[]>();

  set(sessionId: SessionId, candidates: Candidate[]): void {
    this.bySession.set(sessionId, candidates.slice(0, 12));
  }

  get(sessionId: SessionId): Candidate[] {
    return this.bySession.get(sessionId) ?? [];
  }

  find(sessionId: SessionId, candidateId: string): Candidate | undefined {
    return this.get(sessionId).find((candidate) => candidate.id === candidateId);
  }

  clear(sessionId: SessionId): void {
    this.bySession.delete(sessionId);
  }

  clearAll(): void {
    this.bySession.clear();
  }
}
