import type { AnyNode, Rule } from "../types";

const SETTERS = new Set(["setCookie", "destroyCookie"]);
const SOURCES = new Set(["cookies-next", "nookies"]);

export const cookiesNextRule: Rule = {
	name: "cookies-next",
	visit: (ctx) => {
		if (ctx.node.type !== "CallExpression") return;
		const callee = ctx.node.callee as AnyNode | undefined;
		if (callee?.type !== "Identifier") return;
		const name = callee.name as string;
		if (!SETTERS.has(name)) return;
		const info = ctx.imports.get(name);
		if (!info || !SOURCES.has(info.source)) return;
		if (name !== "setCookie") return;
		const cookieName = readNameArg(ctx.node);
		const pos = ctx.position(ctx.node.start);
		ctx.report({
			file: ctx.file,
			line: pos.line,
			column: pos.column,
			kind: "cookies-next",
			...(cookieName ? { name: cookieName } : {}),
		});
	},
};

function readNameArg(call: AnyNode): string | undefined {
	const args = (call.arguments as AnyNode[] | undefined) ?? [];
	for (let i = 0; i < Math.min(2, args.length); i++) {
		const a = args[i]!;
		if (a.type === "Literal" && typeof a.value === "string") return a.value;
	}
	return undefined;
}
