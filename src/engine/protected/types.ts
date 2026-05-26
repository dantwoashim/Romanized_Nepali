import type { EngineMode, ProtectedSpan } from "../types";

export interface DetectorContext {
  mode: EngineMode;
}

export type DetectedProtectedSpan = Omit<ProtectedSpan, "id" | "placeholder">;

export interface ProtectedSpanDetector {
  name: string;
  priority: number;
  detect(input: string, context: DetectorContext): DetectedProtectedSpan[];
}
