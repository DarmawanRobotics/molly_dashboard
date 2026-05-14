import type { InputHTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block mb-1">
        {label}
      </label>

      {cloneElement<InputHTMLAttributes<HTMLInputElement>>(children, {
        id: htmlFor,
        "aria-label": label,
      })}
    </div>
  );
}
