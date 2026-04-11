import { parseSync } from "oxc-parser";

const SDK_SPECIFIER = "@openpolicy/sdk";
const COLLECTING_NAME = "collecting";

type AnyNode = { type: string; [key: string]: unknown };

/**
 * Extract `collecting()` call metadata from a single source file.
 *
 * Returns a `Record<category, labels[]>` for every detected call whose
 * arguments match the analysable shape. Files with no matching calls — or
 * that fail to parse — return `{}`.
 *
 * The analyser runs in two phases:
 * 1. Collect local names bound to `collecting` imported from `@openpolicy/sdk`
 *    (handles renamed imports, skips type-only imports, ignores look-alikes
 *    imported from other modules).
 * 2. Walk the program body and inspect every `CallExpression` whose callee
 *    is one of those tracked local names.
 */
export function extractCollecting(
	filename: string,
	code: string,
): Record<string, string[]> {
	let result: ReturnType<typeof parseSync>;
	try {
		result = parseSync(filename, code);
	} catch {
		console.warn(`[openpolicy-auto-collect] parse error in ${filename}`);
		return {};
	}

	if (result.errors.length > 0) {
		// Hard parse failures only — oxc reports recoverable errors but still
		// produces a usable AST, so we keep going and let the walker decide.
		const fatal = result.errors.some((e) => e.severity === ("Error" as never));
		if (fatal) {
			console.warn(`[openpolicy-auto-collect] parse error in ${filename}`);
			return {};
		}
	}

	const program = result.program as unknown as AnyNode;
	const localNames = collectSdkCollectingBindings(program);
	if (localNames.size === 0) return {};

	const out: Record<string, string[]> = {};
	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const callee = node.callee as AnyNode | undefined;
		if (!callee || callee.type !== "Identifier") return;
		if (!localNames.has(callee.name as string)) return;

		const args = node.arguments as AnyNode[] | undefined;
		if (!args || args.length < 3) return;

		const category = extractStringLiteral(args[0]);
		if (category === null) return;

		const labels = extractLabelKeys(args[2]);
		if (labels === null) return;

		const existing = out[category] ?? [];
		const seen = new Set(existing);
		for (const label of labels) {
			if (!seen.has(label)) {
				existing.push(label);
				seen.add(label);
			}
		}
		out[category] = existing;
	});
	return out;
}

/**
 * Walk `ImportDeclaration` nodes and return the local names bound to
 * `collecting` imported from `@openpolicy/sdk`. Skips type-only imports and
 * specifiers whose imported name isn't literally `collecting`.
 */
function collectSdkCollectingBindings(program: AnyNode): Set<string> {
	const names = new Set<string>();
	const body = program.body as AnyNode[] | undefined;
	if (!body) return names;
	for (const node of body) {
		if (node.type !== "ImportDeclaration") continue;
		if ((node.importKind as string | undefined) === "type") continue;
		const source = node.source as AnyNode | undefined;
		if (!source || source.value !== SDK_SPECIFIER) continue;
		const specifiers = node.specifiers as AnyNode[] | undefined;
		if (!specifiers) continue;
		for (const spec of specifiers) {
			if (spec.type !== "ImportSpecifier") continue;
			if ((spec.importKind as string | undefined) === "type") continue;
			const imported = spec.imported as AnyNode | undefined;
			if (!imported) continue;
			// ESTree allows either an Identifier (name) or a string Literal (value)
			// for the imported binding (e.g. `import { "foo" as bar }`).
			const importedName =
				imported.type === "Identifier"
					? (imported.name as string | undefined)
					: imported.type === "Literal"
						? typeof imported.value === "string"
							? imported.value
							: undefined
						: undefined;
			if (importedName !== COLLECTING_NAME) continue;
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
 * Extract the keys from a `(v) => ({ ... })` or `(v) => { return { ... } }`
 * arrow function body. Returns an array of key names, deduped while
 * preserving insertion order. Returns `null` if the shape doesn't match.
 */
function extractLabelKeys(node: AnyNode | undefined): string[] | null {
	if (!node || node.type !== "ArrowFunctionExpression") return null;
	let body = node.body as AnyNode | undefined;
	// Unwrap oxc's ParenthesizedExpression around concise-return arrow bodies.
	while (body && body.type === "ParenthesizedExpression") {
		body = body.expression as AnyNode | undefined;
	}
	if (body && body.type === "BlockStatement") {
		const statements = body.body as AnyNode[] | undefined;
		if (!statements) return null;
		const ret = statements.find((s) => s.type === "ReturnStatement");
		if (!ret) return null;
		body = ret.argument as AnyNode | undefined;
		while (body && body.type === "ParenthesizedExpression") {
			body = body.expression as AnyNode | undefined;
		}
	}
	if (!body || body.type !== "ObjectExpression") return null;
	const properties = body.properties as AnyNode[] | undefined;
	if (!properties) return null;

	const labels: string[] = [];
	const seen = new Set<string>();
	for (const prop of properties) {
		if (prop.type !== "Property") continue; // drop SpreadElement silently
		if (prop.computed === true) continue; // drop computed keys
		const key = prop.key as AnyNode | undefined;
		if (!key) continue;
		let label: string | undefined;
		if (key.type === "Identifier") {
			label = key.name as string;
		} else if (key.type === "Literal" && typeof key.value === "string") {
			label = key.value;
		}
		if (label === undefined) continue;
		if (seen.has(label)) continue;
		seen.add(label);
		labels.push(label);
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
