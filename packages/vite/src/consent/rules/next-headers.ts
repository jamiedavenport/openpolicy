import type { AnyNode, ImportInfo, Rule, VisitContext } from "../types";

const cache = new WeakMap<object, Set<string>>();

export const nextHeadersRule: Rule = {
	name: "next-headers",
	visit: (ctx) => {
		if (ctx.node.type !== "CallExpression") return;
		const callee = ctx.node.callee as AnyNode | undefined;
		if (!callee) return;
		if (callee.type !== "StaticMemberExpression" && callee.type !== "MemberExpression") return;
		const prop = callee.property as AnyNode | undefined;
		if (prop?.type !== "Identifier") return;
		const method = prop.name as string;
		if (method !== "set") return;
		const obj = callee.object as AnyNode | undefined;
		if (!isCookiesObject(obj, ctx)) return;
		const name = readCookieName(ctx.node);
		const pos = ctx.position(ctx.node.start);
		ctx.report({
			file: ctx.file,
			line: pos.line,
			column: pos.column,
			kind: "next-headers",
			...(name ? { name } : {}),
		});
	},
};

function isCookiesObject(obj: AnyNode | undefined, ctx: VisitContext): boolean {
	if (!obj) return false;
	if (obj.type === "ParenthesizedExpression") {
		return isCookiesObject(obj.expression as AnyNode, ctx);
	}
	if (obj.type === "AwaitExpression") return isCookiesObject(obj.argument as AnyNode, ctx);
	if (obj.type === "CallExpression")
		return calleeIsCookiesImport(obj.callee as AnyNode | undefined, ctx.imports);
	if (obj.type === "Identifier") {
		const bindings = getCookieBindings(ctx);
		return bindings.has(obj.name as string);
	}
	return false;
}

function calleeIsCookiesImport(
	callee: AnyNode | undefined,
	imports: Map<string, ImportInfo>,
): boolean {
	if (callee?.type !== "Identifier") return false;
	const info = imports.get(callee.name as string);
	return info?.source === "next/headers" && info.imported === "cookies";
}

function getCookieBindings(ctx: VisitContext): Set<string> {
	const root = ctx.parents[0] ?? ctx.node;
	const cached = cache.get(root as object);
	if (cached) return cached;
	const out = new Set<string>();
	collect(root, ctx.imports, out);
	cache.set(root as object, out);
	return out;
}

function collect(node: AnyNode, imports: Map<string, ImportInfo>, out: Set<string>): void {
	if (node.type === "VariableDeclarator") {
		let init = node.init as AnyNode | undefined;
		if (init?.type === "AwaitExpression") init = init.argument as AnyNode | undefined;
		if (
			init?.type === "CallExpression" &&
			calleeIsCookiesImport(init.callee as AnyNode | undefined, imports)
		) {
			const id = node.id as AnyNode | undefined;
			if (id?.type === "Identifier") out.add(id.name as string);
		}
	}
	for (const key in node) {
		if (key === "type" || key === "start" || key === "end") continue;
		const child = (node as Record<string, unknown>)[key];
		if (Array.isArray(child)) {
			for (const c of child) {
				if (c && typeof c === "object" && "type" in c) collect(c as AnyNode, imports, out);
			}
		} else if (child && typeof child === "object" && "type" in child) {
			collect(child as AnyNode, imports, out);
		}
	}
}

function readCookieName(call: AnyNode): string | undefined {
	const args = (call.arguments as AnyNode[] | undefined) ?? [];
	const first = args[0];
	if (!first) return undefined;
	if (first.type === "Literal" && typeof first.value === "string") return first.value;
	if (first.type === "ObjectExpression") {
		for (const prop of (first.properties as AnyNode[] | undefined) ?? []) {
			if (prop.type !== "Property" && prop.type !== "ObjectProperty") continue;
			const key = prop.key as AnyNode | undefined;
			const keyName =
				key?.type === "Identifier"
					? (key.name as string)
					: key?.type === "Literal" && typeof key.value === "string"
						? key.value
						: undefined;
			if (keyName === "name") {
				const v = prop.value as AnyNode | undefined;
				if (v?.type === "Literal" && typeof v.value === "string") return v.value;
			}
		}
	}
	return undefined;
}
