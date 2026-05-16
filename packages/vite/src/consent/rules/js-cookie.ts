import type { AnyNode, Rule } from "../types";

const SETTERS = new Set(["set", "remove", "withAttributes", "withConverter"]);
const SOURCES = new Set(["js-cookie"]);

export const jsCookieRule: Rule = {
	name: "js-cookie",
	visit: (ctx) => {
		if (ctx.node.type !== "CallExpression") return;
		const callee = ctx.node.callee as AnyNode | undefined;
		if (!callee) return;
		if (callee.type !== "StaticMemberExpression" && callee.type !== "MemberExpression") return;
		const obj = callee.object as AnyNode | undefined;
		const prop = callee.property as AnyNode | undefined;
		if (obj?.type !== "Identifier" || prop?.type !== "Identifier") return;
		if (!SETTERS.has(prop.name as string)) return;
		const info = ctx.imports.get(obj.name as string);
		if (!info || !SOURCES.has(info.source)) return;
		if (prop.name !== "set") return;
		const name = readArg0String(ctx.node);
		const pos = ctx.position(ctx.node.start);
		ctx.report({
			file: ctx.file,
			line: pos.line,
			column: pos.column,
			kind: "js-cookie",
			...(name ? { name } : {}),
		});
	},
};

function readArg0String(call: AnyNode): string | undefined {
	const arg = (call.arguments as AnyNode[] | undefined)?.[0];
	if (!arg) return undefined;
	if (arg.type === "Literal" && typeof arg.value === "string") return arg.value;
	return undefined;
}
