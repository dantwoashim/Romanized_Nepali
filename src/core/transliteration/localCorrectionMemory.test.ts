import { describe, expect, it } from "vitest";
import {
  clearLocalCorrections,
  loadLocalCorrections,
  localCorrectionCandidates,
  recordLocalCorrection,
  type MinimalStorage
} from "./localCorrectionMemory";

class MemoryStorage implements MinimalStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("local correction memory", () => {
  it("stores explicit corrections locally and returns ranked candidates", () => {
    const storage = new MemoryStorage();

    recordLocalCorrection("niraj bhusal", "नीरज भुसाल", storage);
    recordLocalCorrection("niraj bhusal", "नीरज भुसाल", storage);

    const corrections = loadLocalCorrections(storage);
    const candidates = localCorrectionCandidates("Niraj   Bhusal", corrections);

    expect(corrections).toHaveLength(1);
    expect(corrections[0].count).toBe(2);
    expect(candidates[0].normalizedText).toBe("नीरज भुसाल");
    expect(candidates[0].source).toBe("user-feedback");
  });

  it("can be cleared without touching any network path", () => {
    const storage = new MemoryStorage();
    recordLocalCorrection("lakshmi", "लक्ष्मी", storage);
    clearLocalCorrections(storage);

    expect(loadLocalCorrections(storage)).toEqual([]);
  });
});
