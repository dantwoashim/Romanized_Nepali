export interface VarnavinyasDiagnostic {
  message: string;
  start: number;
  end: number;
  severity: "info" | "warning";
}

export interface VarnavinyasEvaluationResult {
  status: "disabled" | "unavailable" | "not-installed" | "ok";
  diagnostics: VarnavinyasDiagnostic[];
  latencyMs: number;
  reason?: string;
}

interface VarnavinyasEnv {
  DEV?: boolean;
  VITE_ENABLE_VARNAVINYAS_EVAL?: string;
}

const WORKER_TIMEOUT_MS = 1500;

export function isVarnavinyasEvaluationEnabled(env: VarnavinyasEnv = runtimeEnv()): boolean {
  return env.DEV === true && env.VITE_ENABLE_VARNAVINYAS_EVAL === "true";
}

export function evaluateWithVarnavinyas(
  text: string,
  env: VarnavinyasEnv = runtimeEnv()
): Promise<VarnavinyasEvaluationResult> {
  const startedAt = performance.now();

  if (!isVarnavinyasEvaluationEnabled(env)) {
    return Promise.resolve({
      status: "disabled",
      diagnostics: [],
      latencyMs: performance.now() - startedAt,
      reason: "Varnavinyas evaluation is disabled unless explicitly enabled in local development."
    });
  }

  if (typeof Worker === "undefined") {
    return Promise.resolve({
      status: "unavailable",
      diagnostics: [],
      latencyMs: performance.now() - startedAt,
      reason: "Worker API is not available in this runtime."
    });
  }

  return new Promise((resolve) => {
    const worker = new Worker(new URL("./varnavinyas.worker.ts", import.meta.url), { type: "module" });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve({
        status: "unavailable",
        diagnostics: [],
        latencyMs: performance.now() - startedAt,
        reason: "Varnavinyas worker timed out during local evaluation."
      });
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<VarnavinyasEvaluationResult>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve({
        ...event.data,
        latencyMs: performance.now() - startedAt
      });
    };

    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve({
        status: "unavailable",
        diagnostics: [],
        latencyMs: performance.now() - startedAt,
        reason: "Varnavinyas worker failed during local evaluation."
      });
    };

    worker.postMessage({ text });
  });
}

function runtimeEnv(): VarnavinyasEnv {
  return import.meta.env as VarnavinyasEnv;
}
