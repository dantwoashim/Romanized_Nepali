import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className={`input-field ${className}`.trim()}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
