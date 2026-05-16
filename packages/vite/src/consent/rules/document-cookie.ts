import type { AnyNode, Rule } from "../types";

export const documentCookieRule: Rule = {
	name: "document-cookie",
	visit: (ctx) => {
		if (ctx.node.type !== "AssignmentExpression") return;
		const left = ctx.node.left as AnyNode | undefined;
		if (!left) return;
		if (left.type !== "StaticMemberExpression" && left.type !== "MemberExpression") return;
		const obj = left.object as AnyNode | undefined;
		const prop = left.property as AnyNode | undefined;
		if (obj?.type !== "Identifier" || obj.name !== "document") return;
		if (prop?.type !== "Identifier" || prop.name !== "cookie") return;
		const right = ctx.node.right as AnyNode | undefined;
		const name = extractCookieName(right);
		const pos = ctx.position(ctx.node.start);
		ctx.report({
			file: ctx.file,
			line: pos.line,
			column: pos.column,
			kind: "document.cookie",
			...(name ? { name } : {}),
		});
	},
};

function extractCookieName(node: AnyNode | undefined): string | undefined {
	if (!node) return undefined;
	let raw: string | undefined;
	if (node.type === "Literal" && typeof node.value === "string") raw = node.value;
	else if (node.type === "TemplateLiteral") {
		const quasis = node.quasis as AnyNode[] | undefined;
		if (quasis?.[0]) {
			const cooked = (quasis[0] as { value?: { cooked?: string } }).value?.cooked;
			if (cooked) raw = cooked;
		}
	}
	if (!raw) return undefined;
	const eq = raw.indexOf("=");
	if (eq <= 0) return undefined;
	return raw.slice(0, eq).trim() || undefined;
}
