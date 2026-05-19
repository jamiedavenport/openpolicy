import type { AnyNode, Rule, VisitContext } from "../types";

const HEADER_RE = /^set-cookie$/i;

export const setCookieHeaderRule: Rule = {
	name: "set-cookie-header",
	visit: (ctx) => {
		const node = ctx.node;
		if (node.type === "ObjectExpression") {
			for (const prop of (node.properties as AnyNode[] | undefined) ?? []) {
				if (prop.type !== "Property" && prop.type !== "ObjectProperty") continue;
				const key = prop.key as AnyNode | undefined;
				const keyText = readKeyText(key);
				if (!keyText || !HEADER_RE.test(keyText)) continue;
				if (!isHeadersContext(ctx.parents)) continue;
				report(ctx, prop.start);
			}
			return;
		}
		if (node.type === "CallExpression") {
			const callee = node.callee as AnyNode | undefined;
			if (callee?.type !== "StaticMemberExpression" && callee?.type !== "MemberExpression") return;
			const prop = callee.property as AnyNode | undefined;
			if (prop?.type !== "Identifier") return;
			const method = prop.name as string;
			if (method !== "set" && method !== "append") return;
			const arg0 = (node.arguments as AnyNode[] | undefined)?.[0];
			if (!arg0 || arg0.type !== "Literal" || typeof arg0.value !== "string") return;
			if (!HEADER_RE.test(arg0.value)) return;
			report(ctx, node.start);
		}
	},
};

function readKeyText(key: AnyNode | undefined): string | undefined {
	if (!key) return undefined;
	if (key.type === "Identifier") return key.name as string;
	if (key.type === "Literal" && typeof key.value === "string") return key.value;
	return undefined;
}

function isHeadersContext(parents: AnyNode[]): boolean {
	for (let i = parents.length - 1; i >= 0; i--) {
		const p = parents[i]!;
		if (p.type === "Property" || p.type === "ObjectProperty") {
			const key = p.key as AnyNode | undefined;
			const k = readKeyText(key);
			if (k && /^headers$/i.test(k)) return true;
		}
		if (p.type === "NewExpression" || p.type === "CallExpression") {
			const callee = p.callee as AnyNode | undefined;
			if (callee?.type === "Identifier") {
				const n = callee.name as string;
				if (n === "Headers") return true;
				if (n === "Response" || n === "NextResponse") return true;
			}
		}
	}
	return false;
}

function report(ctx: VisitContext, start: number): void {
	const pos = ctx.position(start);
	ctx.report({
		file: ctx.file,
		line: pos.line,
		column: pos.column,
		kind: "set-cookie-header",
	});
}
