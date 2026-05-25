export interface FeedbackDraft {
  tool: "preeti" | "romanized" | "traditional" | "desktop-interest";
  workflow: string;
  expected: string;
  actual: string;
  notes: string;
  contact: string;
}

export function buildFeedbackBody(draft: FeedbackDraft): string {
  return [
    "Lekh Assistant feedback",
    "",
    `Tool: ${draft.tool}`,
    `Workflow: ${draft.workflow || "not specified"}`,
    `Expected output: ${draft.expected || "not specified"}`,
    `Actual output: ${draft.actual || "not specified"}`,
    `Notes: ${draft.notes || "not specified"}`,
    `Contact: ${draft.contact || "not provided"}`,
    "",
    "I understand this submission may be used to improve fixtures and examples."
  ].join("\n");
}
