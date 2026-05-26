import type { CorrectionMemorySnapshot, CorrectionMemoryStore } from "./types";

export const CORRECTION_MEMORY_SCHEMA_VERSION = 2;

export function emptyMemorySnapshot(): CorrectionMemorySnapshot {
  return {
    schemaVersion: CORRECTION_MEMORY_SCHEMA_VERSION,
    entries: []
  };
}

export class InMemoryCorrectionMemoryStore implements CorrectionMemoryStore {
  private snapshot: CorrectionMemorySnapshot;

  constructor(initial: CorrectionMemorySnapshot = emptyMemorySnapshot()) {
    this.snapshot = initial;
  }

  async load(): Promise<CorrectionMemorySnapshot> {
    return structuredCloneSafe(this.snapshot);
  }

  async save(snapshot: CorrectionMemorySnapshot): Promise<void> {
    this.snapshot = structuredCloneSafe(snapshot);
  }

  async reset(): Promise<void> {
    this.snapshot = emptyMemorySnapshot();
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
