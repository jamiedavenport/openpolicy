import type { ComponentPropsWithoutRef } from "react";
import { WindowFrame } from "./CodeBlock";

type PreProps = ComponentPropsWithoutRef<"pre"> & {
	"data-file"?: string;
	"data-tag"?: string;
};

type AnchorProps = ComponentPropsWithoutRef<"a"> & {
	className?: string;
};

export const mdxComponents = {
	pre: ({ "data-file": file, "data-tag": tag, ...props }: PreProps) => {
		if (!file) {
			return (
				<div className="overflow-auto rounded-md border border-white/15 bg-[#0d0d0d] p-5 text-[0.8125rem] text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
					<pre {...props} />
				</div>
			);
		}
		return (
			<WindowFrame title={file} right={tag}>
				<div className="min-h-0 flex-1 overflow-auto p-6 text-[0.8125rem]">
					<pre {...props} />
				</div>
			</WindowFrame>
		);
	},
	h2: (props: ComponentPropsWithoutRef<"h2">) => (
		<h2
			className="group scroll-mt-28 pt-10 text-2xl font-medium tracking-tight text-ink"
			{...props}
		/>
	),
	h3: (props: ComponentPropsWithoutRef<"h3">) => (
		<h3
			className="group scroll-mt-28 pt-8 text-xl font-medium tracking-tight text-ink"
			{...props}
		/>
	),
	h4: (props: ComponentPropsWithoutRef<"h4">) => (
		<h4
			className="scroll-mt-28 pt-6 text-base font-medium tracking-tight uppercase text-ink"
			{...props}
		/>
	),
	blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
		<blockquote className="border-l-2 border-black pl-6 text-xl text-pretty text-ink" {...props} />
	),
	ul: (props: ComponentPropsWithoutRef<"ul">) => (
		<ul className="list-disc space-y-2 pl-6" {...props} />
	),
	ol: (props: ComponentPropsWithoutRef<"ol">) => (
		<ol className="list-decimal space-y-2 pl-6" {...props} />
	),
	a: ({ className, ...props }: AnchorProps) => {
		if (className?.includes("heading-anchor")) {
			return (
				<a
					{...props}
					className="ml-3 align-middle text-mute no-underline opacity-0 transition-opacity group-hover:opacity-100 hover:text-ink"
				/>
			);
		}
		return (
			<a className="underline decoration-mute underline-offset-4 hover:decoration-ink" {...props} />
		);
	},
	code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code">) => {
		if (typeof children !== "string") {
			return (
				<code className={className} {...props}>
					{children}
				</code>
			);
		}
		return (
			<code
				className="border border-ink bg-ink/4 px-1.5 py-0.5 text-[0.875em] text-ink whitespace-nowrap"
				{...props}
			>
				{children}
			</code>
		);
	},
	table: (props: ComponentPropsWithoutRef<"table">) => (
		<div className="overflow-x-auto border-2 border-black">
			<table className="w-full border-collapse text-sm" {...props} />
		</div>
	),
	thead: (props: ComponentPropsWithoutRef<"thead">) => (
		<thead
			className="border-b-2 border-black bg-ink/4 text-left text-xs tracking-wide uppercase text-ink"
			{...props}
		/>
	),
	th: (props: ComponentPropsWithoutRef<"th">) => (
		<th className="px-4 py-3 font-medium" {...props} />
	),
	td: (props: ComponentPropsWithoutRef<"td">) => (
		<td className="border-t border-black/15 px-4 py-3 align-top text-ink" {...props} />
	),
	hr: (props: ComponentPropsWithoutRef<"hr">) => (
		<hr className="my-12 h-0 border-0 border-t-2 border-black" {...props} />
	),
	img: (props: ComponentPropsWithoutRef<"img">) => (
		// eslint-disable-next-line jsx-a11y/alt-text
		<img className="border-2 border-black" loading="lazy" {...props} />
	),
};
