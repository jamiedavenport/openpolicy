import type { AnyNode } from "./types";

const SET_PREFIX_RE = /^set[A-Z_]/;
const GATE_HELPER_NAMES = new Set(["acceptAll", "acceptNecessary"]);

export function isGated(parents: AnyNode[]): boolean {
	for (let i = parents.length - 1; i >= 0; i--) {
		const p = parents[i]!;
		if (isConsentGateElement(p)) return true;
		if (isHasCheck(p)) return true;
		if (isGateHelperFunction(p)) return true;
	}
	return false;
}

function isConsentGateElement(node: AnyNode): boolean {
	if (node.type !== "JSXElement") return false;
	const opening = node.openingElement as AnyNode | undefined;
	if (!opening) return false;
	const name = opening.name as AnyNode | undefined;
	if (name?.type !== "JSXIdentifier") return false;
	return name.name === "ConsentGate";
}

function isHasCheck(node: AnyNode): boolean {
	if (node.type !== "IfStatement" && node.type !== "ConditionalExpression") return false;
	const test = node.test as AnyNode | undefined;
	return Boolean(test && containsHasCall(test));
}

function containsHasCall(node: AnyNode): boolean {
	if (node.type === "CallExpression") {
		const callee = node.callee as AnyNode | undefined;
		if (
			callee &&
			(callee.type === "StaticMemberExpression" || callee.type === "MemberExpression")
		) {
			const prop = callee.property as AnyNode | undefined;
			if (prop?.type === "Identifier" && prop.name === "has") return true;
		}
	}
	for (const key in node) {
		if (key === "type" || key === "start" || key === "end") continue;
		const child = (node as Record<string, unknown>)[key];
		if (Array.isArray(child)) {
			for (const c of child) {
				if (c && typeof c === "object" && "type" in c && containsHasCall(c as AnyNode)) return true;
			}
		} else if (child && typeof child === "object" && "type" in child) {
			if (containsHasCall(child as AnyNode)) return true;
		}
	}
	return false;
}

function isGateHelperFunction(node: AnyNode): boolean {
	if (
		node.type !== "FunctionDeclaration" &&
		node.type !== "FunctionExpression" &&
		node.type !== "ArrowFunctionExpression"
	) {
		return false;
	}
	const id = node.id as AnyNode | undefined;
	if (id?.type !== "Identifier") return false;
	const name = id.name as string;
	if (GATE_HELPER_NAMES.has(name)) return true;
	return SET_PREFIX_RE.test(name);
}
