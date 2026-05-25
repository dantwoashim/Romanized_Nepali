import { assertSafeEventPayload, sendSafeEvent } from "./safeEvents";

describe("safe event guard", () => {
  it("allows event-only payloads", () => {
    expect(() => sendSafeEvent({ eventName: "copy_clicked", mode: "preeti", clicked: true })).not.toThrow();
  });

  it("rejects text-like payload keys", () => {
    expect(() => assertSafeEventPayload({ eventName: "bad", text: "नेपाल" })).toThrow(/Unsafe event/);
    expect(() => assertSafeEventPayload({ eventName: "bad", dictionaryQuery: "sarkar" })).toThrow(/Unsafe event/);
  });

  it("rejects unexpected payload keys", () => {
    expect(() => assertSafeEventPayload({ eventName: "bad", raw: true })).toThrow(/Unexpected event/);
  });
});
