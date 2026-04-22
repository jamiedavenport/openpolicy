import { parseSync } from "oxc-parser";

const SDK_SPECIFIER = "@openpolicy/sdk";
const REACT_SPECIFIER = "@openpolicy/react";
const COLLECTING_NAME = "collecting";
const THIRD_PARTY_NAME = "thirdParty";
const IGNORE_NAME = "Ignore";
const DEFINE_COOKIE_NAME = "defineCookie";
const USE_COOKIES_NAME = "useCookies";
const CONSENT_GATE_NAME = "ConsentGate";

type AnyNode = { type: string; [key: string]: unknown };

export type ThirdPartyEntry = {
	name: string;
	purpose: string;
	policyUrl: string;
};

export type ExtractResult = {
	dataCollected: Record<string, string[]>;
	thirdParties: ThirdPartyEntry[];
	cookies: string[];
};

/**
 * Extract `collecting()`, `thirdParty()`, and cookie-related call metadata
 * from a single source file.
 *
 * Returns an `ExtractResult` with `dataCollected` (category → labels),
 * `thirdParties` (array of third-party entries), and `cookies` (array of
 * category names). Files with no matching calls — or that fail to parse —
 * return empty defaults.
 *
 * The analyser runs in two phases:
 * 1. Collect local names bound to `collecting` / `thirdParty` / `defineCookie`
 *    imported from `@openpolicy/sdk`, and `useCookies` / `ConsentGate`
 *    imported from `@openpolicy/react` (handles renamed imports, skips
 *    type-only imports, ignores look-alikes from other modules).
 * 2. Walk the program body and inspect `CallExpression` / `JSXOpeningElement`
 *    nodes whose target is one of those tracked local names.
 */
export function extractFromFile(filename: string, code: string): ExtractResult {
	const empty: ExtractResult = {
		dataCollected: {},
		thirdParties: [],
		cookies: [],
	};
	let result: ReturnType<typeof parseSync>;
	try {
		result = parseSync(filename, code);
	} catch {
		console.warn(`[openpolicy] parse error in ${filename}`);
		return empty;
	}

	if (result.errors.length > 0) {
		// Hard parse failures only — oxc reports recoverable errors but still
		// produces a usable AST, so we keep going and let the walker decide.
		const fatal = result.errors.some((e) => e.severity === ("Error" as never));
		if (fatal) {
			console.warn(`[openpolicy] parse error in ${filename}`);
			return empty;
		}
	}

	const program = result.program as unknown as AnyNode;
	const collectingNames = collectBindings(
		program,
		SDK_SPECIFIER,
		COLLECTING_NAME,
	);
	const thirdPartyNames = collectBindings(
		program,
		SDK_SPECIFIER,
		THIRD_PARTY_NAME,
	);
	const ignoreNames = collectBindings(program, SDK_SPECIFIER, IGNORE_NAME);
	const defineCookieNames = collectBindings(
		program,
		SDK_SPECIFIER,
		DEFINE_COOKIE_NAME,
	);
	const useCookiesNames = collectBindings(
		program,
		REACT_SPECIFIER,
		USE_COOKIES_NAME,
	);
	const consentGateNames = collectBindings(
		program,
		REACT_SPECIFIER,
		CONSENT_GATE_NAME,
	);
	if (
		collectingNames.size === 0 &&
		thirdPartyNames.size === 0 &&
		defineCookieNames.size === 0 &&
		useCookiesNames.size === 0 &&
		consentGateNames.size === 0
	)
		return empty;

	const dataCollected: Record<string, string[]> = {};
	const thirdParties: ThirdPartyEntry[] = [];
	const seenThirdParties = new Set<string>();
	const cookieSet = new Set<string>();

	walk(program, (node) => {
		if (node.type === "CallExpression") {
			const callee = node.callee as AnyNode | undefined;
			const args = node.arguments as AnyNode[] | undefined;

			if (callee && callee.type === "Identifier") {
				const calleeName = callee.name as string;

				if (collectingNames.has(calleeName)) {
					if (!args || args.length < 3) return;
					const category = extractStringLiteral(args[0]);
					if (category === null) return;
					const labels = extractLabelKeys(args[2], ignoreNames);
					if (labels === null) return;
					const existing = dataCollected[category] ?? [];
					const seen = new Set(existing);
					for (const label of labels) {
						if (!seen.has(label)) {
							existing.push(label);
							seen.add(label);
						}
					}
					dataCollected[category] = existing;
					return;
				}

				if (thirdPartyNames.has(calleeName)) {
					if (!args || args.length < 3) return;
					const name = extractStringLiteral(args[0]);
					if (name === null) return;
					const purpose = extractStringLiteral(args[1]);
					if (purpose === null) return;
					const policyUrl = extractStringLiteral(args[2]);
					if (policyUrl === null) return;
					if (seenThirdParties.has(name)) return;
					seenThirdParties.add(name);
					thirdParties.push({ name, purpose, policyUrl });
					return;
				}

				if (defineCookieNames.has(calleeName)) {
					if (!args || args.length < 1) return;
					const category = extractStringLiteral(args[0]);
					if (category === null) return;
					cookieSet.add(category);
					return;
				}
			}

			// `useCookies().has("analytics")` — a MemberExpression callee on a
			// CallExpression whose own callee is useCookies.
			if (callee && callee.type === "MemberExpression") {
				const property = callee.property as AnyNode | undefined;
				const object = callee.object as AnyNode | undefined;
				if (
					property?.type === "Identifier" &&
					property.name === "has" &&
					object?.type === "CallExpression"
				) {
					const inner = object.callee as AnyNode | undefined;
					if (
						inner?.type === "Identifier" &&
						useCookiesNames.has(inner.name as string) &&
						args &&
						args[0]
					) {
						extractHasExpression(args[0], cookieSet);
					}
				}
			}
			return;
		}

		if (node.type === "JSXOpeningElement") {
			const name = node.name as AnyNode | undefined;
			if (!name || name.type !== "JSXIdentifier") return;
			if (!consentGateNames.has(name.name as string)) return;
			const attrs = node.attributes as AnyNode[] | undefined;
			if (!attrs) return;
			for (const attr of attrs) {
				if (attr.type !== "JSXAttribute") continue;
				const attrName = attr.name as AnyNode | undefined;
				if (
					!attrName ||
					attrName.type !== "JSXIdentifier" ||
					attrName.name !== "requires"
				)
					continue;
				const value = attr.value as AnyNode | undefined;
				if (!value) continue;
				if (value.type === "Literal" && typeof value.value === "string") {
					cookieSet.add(value.value);
				} else if (value.type === "JSXExpressionContainer") {
					const expr = value.expression as AnyNode | undefined;
					if (expr) extractHasExpression(expr, cookieSet);
				}
			}
		}
	});

	return { dataCollected, thirdParties, cookies: [...cookieSet] };
}

/**
 * Walk `ImportDeclaration` nodes and return the local names bound to the given
 * `exportName` imported from `moduleName`. Skips type-only imports and
 * specifiers whose imported name doesn't match.
 */
function collectBindings(
	program: AnyNode,
	moduleName: string,
	exportName: string,
): Set<string> {
	const names = new Set<string>();
	const body = program.body as AnyNode[] | undefined;
	if (!body) return names;
	for (const node of body) {
		if (node.type !== "ImportDeclaration") continue;
		if ((node.importKind as string | undefined) === "type") continue;
		const source = node.source as AnyNode | undefined;
		if (!source || source.value !== moduleName) continue;
		const specifiers = node.specifiers as AnyNode[] | undefined;
		if (!specifiers) continue;
		for (const spec of specifiers) {
			if (spec.type !== "ImportSpecifier") continue;
			if ((spec.importKind as string | undefined) === "type") continue;
			const imported = spec.imported as AnyNode | undefined;
			if (!imported) continue;
			const importedName =
				imported.type === "Identifier"
					? (imported.name as string | undefined)
					: imported.type === "Literal"
						? typeof imported.value === "string"
							? imported.value
							: undefined
						: undefined;
			if (importedName !== exportName) continue;
			const local = spec.local as AnyNode | undefined;
			if (!local || local.type !== "Identifier") continue;
			names.add(local.name as string);
		}
	}
	return names;
}

/**
 * If `node` is a string `Literal`, return its string value. Otherwise
 * return `null` so the caller silently skips the call.
 */
function extractStringLiteral(node: AnyNode | undefined): string | null {
	if (!node) return null;
	if (node.type !== "Literal") return null;
	if (typeof node.value !== "string") return null;
	return node.value;
}

/**
 * Walks a `has()` / `requires=` expression (string literal or
 * `{ and|or|not }` object) and adds every string leaf to `out`. Conservative:
 * unknown shapes are silently ignored.
 */
function extractHasExpression(node: AnyNode, out: Set<string>): void {
	if (node.type === "Literal" && typeof node.value === "string") {
		out.add(node.value);
		return;
	}
	if (node.type === "ObjectExpression") {
		const properties = node.properties as AnyNode[] | undefined;
		if (!properties) return;
		for (const prop of properties) {
			if (prop.type !== "Property") continue;
			const key = prop.key as AnyNode | undefined;
			const keyName =
				key?.type === "Identifier"
					? (key.name as string)
					: key?.type === "Literal" && typeof key.value === "string"
						? key.value
						: null;
			if (keyName !== "and" && keyName !== "or" && keyName !== "not") continue;
			const value = prop.value as AnyNode | undefined;
			if (!value) continue;
			if (value.type === "ArrayExpression") {
				const elements = value.elements as AnyNode[] | undefined;
				if (!elements) continue;
				for (const el of elements) {
					if (el) extractHasExpression(el, out);
				}
			} else {
				extractHasExpression(value, out);
			}
		}
	}
}

/**
 * Extract the string values from a plain `{ fieldName: "Human Label" }`
 * object literal. Returns an array of label strings, deduped while
 * preserving insertion order. Returns `null` if the shape doesn't match.
 *
 * Properties whose value is an `Identifier` matching a tracked local name
 * bound to the SDK's `Ignore` export are treated as explicit opt-outs and
 * skipped silently — producing the same observable result as omitting the
 * field from the record did before.
 */
function extractLabelKeys(
	node: AnyNode | undefined,
	ignoreNames: Set<string>,
): string[] | null {
	if (!node || node.type !== "ObjectExpression") return null;
	const properties = node.properties as AnyNode[] | undefined;
	if (!properties) return null;

	const labels: string[] = [];
	const seen = new Set<string>();
	for (const prop of properties) {
		if (prop.type !== "Property") continue; // drop SpreadElement silently
		const val = prop.value as AnyNode | undefined;
		if (!val) continue;
		if (val.type === "Literal" && typeof val.value === "string") {
			if (seen.has(val.value)) continue;
			seen.add(val.value);
			labels.push(val.value);
			continue;
		}
		if (
			val.type === "Identifier" &&
			typeof val.name === "string" &&
			ignoreNames.has(val.name as string)
		) {
		}
	}
	return labels;
}

/**
 * Recursive AST walker. Visits every `AnyNode` (depth-first) reachable
 * through array / nested-object children and invokes `visit` on each.
 */
function walk(node: AnyNode, visit: (node: AnyNode) => void): void {
	visit(node);
	for (const key of Object.keys(node)) {
		if (key === "parent") continue;
		const value = node[key];
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === "object" && typeof item.type === "string") {
					walk(item as AnyNode, visit);
				}
			}
		} else if (
			value &&
			typeof value === "object" &&
			typeof (value as { type?: unknown }).type === "string"
		) {
			walk(value as AnyNode, visit);
		}
	}
}
