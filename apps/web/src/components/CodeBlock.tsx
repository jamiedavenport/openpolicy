import type { ReactNode } from "react";

export function WindowFrame({
	title,
	right,
	children,
	className = "",
}: {
	title: string;
	right?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`flex min-w-0 flex-col overflow-hidden rounded-md border border-white/15 bg-[#0d0d0d] text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ${className}`}
		>
			<div className="relative flex shrink-0 items-center border-b border-white/10 bg-white/3 px-4 py-2.5">
				<div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
					<span className="size-3 rounded-full bg-[#ff5f57]" />
					<span className="size-3 rounded-full bg-[#febc2e]" />
					<span className="size-3 rounded-full bg-[#28c840]" />
				</div>
				<span className="absolute left-1/2 -translate-x-1/2 font-mono text-xs text-white/60">
					{title}
				</span>
				{right && (
					<div className="ml-auto shrink-0 text-xs tracking-wide text-white/40 uppercase">
						{right}
					</div>
				)}
			</div>
			{children}
		</div>
	);
}

export function CodeBlock({
	file,
	tag,
	html,
	className = "",
}: {
	file: string;
	tag?: string;
	html: string;
	className?: string;
}) {
	return (
		<WindowFrame title={file} right={tag} className={className}>
			<div
				className="min-h-0 flex-1 overflow-auto p-6 text-[0.8125rem]"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</WindowFrame>
	);
}
