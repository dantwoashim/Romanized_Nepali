export type CorrectionMemorySource =
  | "user-accept"
  | "user-edit"
  | "user-add-dictionary"
  | "proofread-accept"
  | "import";

export interface CorrectionMemoryEntry {
  id: string;
  inputRomanized?: string;
  inputPreeti?: string;
  normalizedInput: string;
  chosenOutput: string;
  normalizedOutput: string;
  rejectedAlternatives: string[];
  context: {
    leftWindow: string;
    rightWindow: string;
    domain?: string;
  };
  source: CorrectionMemorySource;
  frequency: number;
  confidenceAtSelection: number;
  timestamps: {
    firstSeen: string;
    lastUsed: string;
  };
  pinned?: boolean;
  decayWeight?: number;
}

export interface CorrectionMemorySnapshot {
  schemaVersion: 2;
  migratedFrom?: string[];
  migrationCompletedAt?: string;
  entries: CorrectionMemoryEntry[];
}

export interface CorrectionMemoryStore {
  load(): Promise<CorrectionMemorySnapshot>;
  save(snapshot: CorrectionMemorySnapshot): Promise<void>;
  reset(): Promise<void>;
}

export interface MemoryScoringContext {
  input: string;
  leftWindow?: string;
  rightWindow?: string;
  domain?: string;
  protectedOriginals?: string[];
  now?: string;
}
