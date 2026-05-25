import type { VarnavinyasEvaluationResult } from "./varnavinyasWorkerClient";

self.onmessage = () => {
  const result: VarnavinyasEvaluationResult = {
    status: "not-installed",
    diagnostics: [],
    latencyMs: 0,
    reason: "Varnavinyas WASM is not bundled; this worker is a local-only integration probe."
  };

  self.postMessage(result);
};
