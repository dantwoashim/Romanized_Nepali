const FORBIDDEN_EVENT_KEYS = new Set([
  "text",
  "input",
  "output",
  "convertedText",
  "query",
  "keystroke",
  "clipboard",
  "content",
  "token",
  "spellToken",
  "dictionaryQuery"
]);

const ALLOWED_EVENT_KEYS = new Set([
  "eventName",
  "mode",
  "threshold",
  "clicked",
  "opened",
  "submitted",
  "timestamp",
  "buildVersion"
]);

export interface SafeEventPayload {
  eventName: string;
  mode?: "preeti" | "romanized" | "traditional" | "feedback" | "desktop-interest";
  threshold?: boolean;
  clicked?: boolean;
  opened?: boolean;
  submitted?: boolean;
  timestamp?: number;
  buildVersion?: string;
}

export function assertSafeEventPayload(payload: Record<string, unknown>): asserts payload is SafeEventPayload {
  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_EVENT_KEYS.has(key)) {
      throw new Error(`Unsafe event payload key "${key}" could contain user text.`);
    }
    if (!ALLOWED_EVENT_KEYS.has(key)) {
      throw new Error(`Unexpected event payload key "${key}".`);
    }
  }
}

export function sendSafeEvent(payload: SafeEventPayload): void {
  assertSafeEventPayload(payload);
  // Week one intentionally does not send analytics. This no-op keeps future metrics event-only.
}

export const forbiddenEventKeys = FORBIDDEN_EVENT_KEYS;
