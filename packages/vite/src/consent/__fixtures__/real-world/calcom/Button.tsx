// Pure UI component — must produce zero hits.
import type { ButtonHTMLAttributes } from "react";

export function Button({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="btn" {...rest}>
      {children}
    </button>
  );
}
