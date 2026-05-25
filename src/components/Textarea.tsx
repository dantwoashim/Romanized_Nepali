import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function Textarea({ label, hint, className = "", ...props }: TextareaProps) {
  return (
    <label className="textarea-field">
      <span className="textarea-field__label">{label}</span>
      {hint ? <span className="textarea-field__hint">{hint}</span> : null}
      <textarea className={`textarea ${className}`.trim()} {...props} />
    </label>
  );
}
