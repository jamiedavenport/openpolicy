// Pure utilities — must produce zero hits.
export function classNames(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let h: ReturnType<typeof setTimeout> | undefined;
  return ((...args: unknown[]) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  }) as T;
}
