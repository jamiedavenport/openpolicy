import { parseSync } from "oxc-parser";

const SDK_SPECIFIER = "@openpolicy/sdk";
const COLLECTING_NAME = "collecting";
const THIRD_PARTY_NAME = "thirdParty";
const IGNORE_NAME = "Ignore";

type AnyNode = { type: string; [key: string]: unknown };

export type ThirdPartyEntry = {
	name: string;
	purpose: string;
	policyUrl: string;
};

export type ExtractResult = {
	dataCollected: Record<string, string[]>;
	thirdParties: ThirdPartyEntry[];
};

/**
 * Extract `collecting()` and `thirdParty()` call metadata from a single source file.
 *
 * Returns an `ExtractResult` with `dataCollected` (category → labels) and
 * `thirdParties` (array of third-party entries). Files with no matching calls
 * — or that fail to parse — return empty defaults.
 *
 * The analyser runs in two phases:
 * 1. Collect local names bound to `collecting` / `thirdParty` imported from
 *    `@openpolicy/sdk` (handles renamed imports, skips type-only imports,
 *    ignores look-alikes imported from other modules).
 * 2. Walk the program body and inspect every `CallExpression` whose callee
 *    is one of those tracked local names.
 */
export function extractFromFile(filename: string, code: string): ExtractResult {
	const empty: ExtractResult = { dataCollected: {}, thirdParties: [] };
	let result: ReturnType<typeof parseSync>;
	try {
		result = parseSync(filename, code);
	} catch {
		console.warn(`[openpolicy-auto-collect] parse error in ${filename}`);
		return empty;
	}

	if (result.errors.length > 0) {
		// Hard parse failures only — oxc reports recoverable errors but still
		// produces a usable AST, so we keep going and let the walker decide.
		const fatal = result.errors.some((e) => e.severity === ("Error" as never));
		if (fatal) {
			console.warn(`[openpolicy-auto-collect] parse error in ${filename}`);
			return empty;
		}
	}

	const program = result.program as unknown as AnyNode;
	const collectingNames = collectSdkBindings(program, COLLECTING_NAME);
	const thirdPartyNames = collectSdkBindings(program, THIRD_PARTY_NAME);
	const ignoreNames = collectSdkBindings(program, IGNORE_NAME);
	if (collectingNames.size === 0 && thirdPartyNames.size === 0) return empty;

	const dataCollected: Record<string, string[]> = {};
	const thirdParties: ThirdPartyEntry[] = [];
	const seenThirdParties = new Set<string>();

	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const callee = node.callee as AnyNode | undefined;
		if (!callee || callee.type !== "Identifier") return;
		const calleeName = callee.name as string;
		const args = node.arguments as AnyNode[] | undefined;

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
		} else if (thirdPartyNames.has(calleeName)) {
			if (!args || args.length < 3) return;
			const name = extractStringLiteral(args[0]);
			if (name === null) return;
			const purpose = extractStringLiteral(args[1]);
			if (purpose === null) return;
			const policyUrl = extractStringLiteral(args[2]);
			if (policyUrl === null) return;
			// Deduplicate by name — first occurrence wins (files walked in sorted order)
			if (seenThirdParties.has(name)) return;
			seenThirdParties.add(name);
			thirdParties.push({ name, purpose, policyUrl });
		}
	});

	return { dataCollected, thirdParties };
}

/**
 * Walk `ImportDeclaration` nodes and return the local names bound to the given
 * `exportName` imported from `@openpolicy/sdk`. Skips type-only imports and
 * specifiers whose imported name doesn't match.
 */
function collectSdkBindings(program: AnyNode, exportName: string): Set<string> {
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
		// Any other value (template literals, variable references, etc.) is
		// skipped silently to preserve the analyser's conservative posture.
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
