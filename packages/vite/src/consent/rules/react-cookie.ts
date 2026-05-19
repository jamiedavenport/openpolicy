import type { AnyNode, Rule, VisitContext } from "../types";

const cache = new WeakMap<object, Set<string>>();

export const reactCookieRule: Rule = {
	name: "react-cookie",
	visit: (ctx) => {
		if (ctx.node.type !== "CallExpression") return;
		const callee = ctx.node.callee as AnyNode | undefined;
		if (callee?.type !== "Identifier") return;
		const setters = getSetters(ctx);
		if (!setters.has(callee.name as string)) return;
		const name = readStringArg(ctx.node, 0);
		const pos = ctx.position(callee.start);
		ctx.report({
			file: ctx.file,
			line: pos.line,
			column: pos.column,
			kind: "react-cookie",
			...(name ? { name } : {}),
		});
	},
};

function getSetters(ctx: VisitContext): Set<string> {
	const root = ctx.parents[0] ?? ctx.node;
	const cached = cache.get(root as object);
	if (cached) return cached;
	const useCookiesInfo = ctx.imports.get("useCookies");
	const setters = new Set<string>();
	if (useCookiesInfo?.source === "react-cookie") collectSetters(root, setters);
	cache.set(root as object, setters);
	return setters;
}

function collectSetters(node: AnyNode, out: Set<string>): void {
	if (node.type === "VariableDeclarator") {
		const init = node.init as AnyNode | undefined;
		if (init?.type === "CallExpression") {
			const callee = init.callee as AnyNode | undefined;
			if (callee?.type === "Identifier" && callee.name === "useCookies") {
				const id = node.id as AnyNode | undefined;
				if (id?.type === "ArrayPattern") {
					const elements = id.elements as AnyNode[] | undefined;
					const second = elements?.[1];
					if (second?.type === "Identifier") out.add(second.name as string);
				}
			}
		}
	}
	for (const key in node) {
		if (key === "type" || key === "start" || key === "end") continue;
		const child = (node as Record<string, unknown>)[key];
		if (Array.isArray(child)) {
			for (const c of child) {
				if (c && typeof c === "object" && "type" in c) collectSetters(c as AnyNode, out);
			}
		} else if (child && typeof child === "object" && "type" in child) {
			collectSetters(child as AnyNode, out);
		}
	}
}

function readStringArg(call: AnyNode, idx: number): string | undefined {
	const arg = (call.arguments as AnyNode[] | undefined)?.[idx];
	if (arg?.type === "Literal" && typeof arg.value === "string") return arg.value;
	return undefined;
}
