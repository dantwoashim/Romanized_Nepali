import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function isDirectCli(importMetaUrl: string): boolean {
  if (process.env.LEKH_BENCHMARK_IMPORT === "1") return false;
  if (process.env.LEKH_BENCHMARK_CLI === "1") return true;
  const filePath = fileURLToPath(importMetaUrl);
  const fileName = basename(filePath);
  return process.argv.some((arg) => {
    const normalized = resolve(arg);
    return normalized === filePath || basename(normalized) === fileName;
  });
}

export function assertNonEmptySuite(name: string, count: number): void {
  if (count > 0) return;
  throw new Error(`${name} benchmark suite has zero cases; refusing to report success.`);
}
