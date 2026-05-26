import { EngineCorruption } from "../types";

const SENTINEL_START = "\uE000";
const SENTINEL_END = "\uE001";
const SENTINEL_PATTERN = /\uE000LKH_[A-Za-z0-9]+_\d+\uE001/g;

let saltCounter = 0;

export function createSentinelSalt(): string {
  saltCounter = (saltCounter + 1) % 100000;
  return `${Date.now().toString(36)}${saltCounter.toString(36)}`;
}

export function createSentinel(salt: string, index: number): string {
  return `${SENTINEL_START}LKH_${salt}_${index}${SENTINEL_END}`;
}

export function containsSentinel(value: string): boolean {
  return new RegExp(SENTINEL_PATTERN).test(value);
}

export function countPlaceholder(value: string, placeholder: string): number {
  return value.split(placeholder).length - 1;
}

export function assertNoSentinelLeakage(value: string) {
  if (containsSentinel(value)) {
    throw new EngineCorruption("Sentinel leakage detected after protected-span restoration.");
  }
}
