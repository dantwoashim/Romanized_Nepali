import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { normalizeCopyOutput } from "../core/normalize/normalizeNepaliText";
import { Button } from "./Button";

interface CopyButtonProps {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = "Copy Unicode" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const normalized = normalizeCopyOutput(value);
    if (!normalized) return;
    await navigator.clipboard.writeText(normalized);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Button
      type="button"
      variant="primary"
      icon={copied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
      onClick={copy}
      disabled={!normalizeCopyOutput(value)}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
