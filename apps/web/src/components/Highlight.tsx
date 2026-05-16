import type { ReactNode } from "react";

export function Highlight({ children }: { children: ReactNode }) {
	return (
		<span className="relative inline-block">
			<span
				aria-hidden="true"
				className="absolute -inset-x-1 inset-y-1 -z-1 -rotate-1 bg-yellow-300"
			/>
			<span className="relative text-ink">{children}</span>
		</span>
	);
}
