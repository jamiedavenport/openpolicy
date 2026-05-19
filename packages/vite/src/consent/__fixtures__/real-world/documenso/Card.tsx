// Pure UI primitive — must produce zero hits.
import type { HTMLAttributes } from "react";

export function Card({ children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card rounded-lg border p-4" {...rest}>
      {children}
    </div>
  );
}
