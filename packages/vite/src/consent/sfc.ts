import type { Lang } from "./types";

export type ScriptBlock = {
	source: string;
	lang: Lang;
	startLine: number;
};

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

export function extractScripts(source: string): ScriptBlock[] {
	const out: ScriptBlock[] = [];
	for (const m of source.matchAll(scriptRe)) {
		const attrs = m[1] ?? "";
		const inner = m[2] ?? "";
		const lang = parseLang(attrs);
		const innerStart = m.index + m[0]!.indexOf(">") + 1;
		const startLine = countLines(source, innerStart);
		out.push({ source: inner, lang, startLine });
	}
	return out;
}

function parseLang(attrs: string): Lang {
	const m = /\blang\s*=\s*"([^"]+)"|\blang\s*=\s*'([^']+)'/i.exec(attrs);
	const raw = (m?.[1] ?? m?.[2] ?? "").toLowerCase();
	if (raw === "ts" || raw === "typescript") return "ts";
	if (raw === "tsx") return "tsx";
	if (raw === "jsx") return "jsx";
	if (raw === "js" || raw === "javascript" || raw === "") return "js";
	return "ts";
}

function countLines(source: string, offset: number): number {
	let n = 0;
	for (let i = 0; i < offset && i < source.length; i++) {
		if (source.charCodeAt(i) === 10) n++;
	}
	return n;
}
