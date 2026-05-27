import { nowMs } from "../util/time";
import type { WarmOptions, WarmResult } from "./types";

const REQUIRED_MODULES = ["keyboard-session", "romanized-wrapper", "proofread-wrapper", "dictionary-wrapper"];

export async function warmKeyboard(options: WarmOptions = {}): Promise<WarmResult> {
  const start = nowMs();
  const timeoutMs = options.timeoutMs;
  const loadedModules: string[] = [];
  const unavailableModules: string[] = [];
  const warnings: string[] = [];

  const loadPromise = (async () => {
    for (const name of REQUIRED_MODULES) {
      loadedModules.push(name);
      await Promise.resolve();
    }
  })();

  if (typeof timeoutMs === "number" && timeoutMs >= 0) {
    const timedOut = await Promise.race([
      loadPromise.then(() => false),
      delay(timeoutMs).then(() => true)
    ]);
    if (timedOut) {
      for (const name of REQUIRED_MODULES) {
        if (!loadedModules.includes(name)) unavailableModules.push(name);
      }
      warnings.push(`Warm timed out after ${timeoutMs}ms; keyboard remains usable with partial readiness.`);
      return {
        ready: false,
        partial: true,
        loadedModules,
        unavailableModules,
        warmTimeMs: nowMs() - start,
        warnings
      };
    }
  } else {
    await loadPromise;
  }

  return {
    ready: unavailableModules.length === 0,
    partial: unavailableModules.length > 0,
    loadedModules,
    unavailableModules,
    warmTimeMs: nowMs() - start,
    warnings
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
