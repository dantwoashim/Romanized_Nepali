import { evaluateWithVarnavinyas, isVarnavinyasEvaluationEnabled } from "./varnavinyasWorkerClient";

describe("varnavinyas local worker prototype", () => {
  it("is disabled by default", async () => {
    expect(isVarnavinyasEvaluationEnabled({ DEV: true })).toBe(false);

    const result = await evaluateWithVarnavinyas("नेपाल", { DEV: true });
    expect(result.status).toBe("disabled");
    expect(result.diagnostics).toHaveLength(0);
  });

  it("cannot be enabled in production", () => {
    expect(isVarnavinyasEvaluationEnabled({ DEV: false, VITE_ENABLE_VARNAVINYAS_EVAL: "true" })).toBe(false);
  });
});
