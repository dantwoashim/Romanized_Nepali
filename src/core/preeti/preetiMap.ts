import rawMap from "../../data/mappings/preeti-map.json";

export interface PreetiMappingEntry {
  source: string;
  target: string;
  notes?: string;
  confidence: "high" | "medium" | "low";
}

interface RawPreetiMap {
  metadata: {
    name: string;
    source: string;
    license: string;
    notes: string;
  };
  entries: Record<string, PreetiMappingEntry>;
}

export const preetiMap = rawMap as RawPreetiMap;

export function getPreetiEntry(char: string): PreetiMappingEntry | undefined {
  return preetiMap.entries[char];
}

export function getPreetiEntries(): Array<[string, PreetiMappingEntry]> {
  return Object.entries(preetiMap.entries);
}
