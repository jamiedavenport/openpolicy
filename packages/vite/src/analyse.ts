import { parseSync } from "oxc-parser";

const SDK_SPECIFIER = "@openpolicy/sdk";
const COLLECTING_NAME = "collecting";
const THIRD_PARTY_NAME = "thirdParty";
const IGNORE_NAME = "Ignore";
const DEFINE_COOKIE_NAME = "defineCookie";

type AnyNode = { type: string; [key: string]: unknown };

export type ThirdPartyEntry = {
	name: string;
	purpose: string;
	policyUrl: string;
};

/**
 * Reason a *recognized* `collecting` / `thirdParty` / `defineCookie` call was
 * skipped instead of contributing data. These codes surface in build/dev logs
 * and are public API at 1.0 — keep the union narrow and the meanings stable.
 */
export type ScannerSkipCode =
	| "missing-arguments" //        call has fewer args than the SDK function requires
	| "non-literal-argument" //     a string-literal-expected arg isn't a string literal
	| "non-object-label-map" //     collecting() 3rd arg isn't an object literal
	| "spread-in-label-map" //      spread element inside collecting()'s label object
	| "non-literal-label-value"; // a label value is neither a string literal nor Ignore

/**
 * A located build warning emitted for a recognized-but-unreadable call, so
 * statically invisible privacy data never disappears silently. `line` and
 * `column` are 1-based and point at the call expression.
 */
export type ScannerDiagnostic = {
	code: ScannerSkipCode;
	message: string;
	file: string;
	line: number;
	column: number;
};

type RecordFn = (code: ScannerSkipCode, message: string, node: AnyNode | undefined) => void;

type ExtractResult = {
	dataCollected: Record<string, string[]>;
	thirdParties: ThirdPartyEntry[];
	cookies: string[];
	diagnostics: ScannerDiagnostic[];
};

/**
 * Extract `collecting()`, `thirdParty()`, and `defineCookie()` call metadata
 * from a single source file.
 *
 * Returns an `ExtractResult` with `dataCollected` (category → labels),
 * `thirdParties` (array of third-party entries), `cookies` (array of
 * category names), and `diagnostics` — one located warning for every
 * recognized call that couldn't be read statically (so no recognized call is
 * ever dropped silently). Files with no matching calls — or that fail to
 * parse — return empty defaults.
 *
 * The analyser runs in two phases:
 * 1. Collect local names bound to `collecting` / `thirdParty` / `defineCookie`
 *    imported from `@openpolicy/sdk` (handles renamed imports, skips
 *    type-only imports, ignores look-alikes from other modules).
 * 2. Walk the program body and inspect `CallExpression` nodes whose target
 *    is one of those tracked local names.
 */
export function extractFromFile(filename: string, code: string): ExtractResult {
	const empty: ExtractResult = {
		dataCollected: {},
		thirdParties: [],
		cookies: [],
		diagnostics: [],
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
	const collectingNames = collectBindings(program, SDK_SPECIFIER, COLLECTING_NAME);
	const thirdPartyNames = collectBindings(program, SDK_SPECIFIER, THIRD_PARTY_NAME);
	const ignoreNames = collectBindings(program, SDK_SPECIFIER, IGNORE_NAME);
	const defineCookieNames = collectBindings(program, SDK_SPECIFIER, DEFINE_COOKIE_NAME);
	if (collectingNames.size === 0 && thirdPartyNames.size === 0 && defineCookieNames.size === 0)
		return empty;

	const dataCollected: Record<string, string[]> = {};
	const thirdParties: ThirdPartyEntry[] = [];
	const seenThirdParties = new Set<string>();
	const cookieSet = new Set<string>();
	const diagnostics: ScannerDiagnostic[] = [];
	const locate = makeLineLocator(code);
	const record: RecordFn = (skipCode, message, node) => {
		const offset = node && typeof node.start === "number" ? (node.start as number) : 0;
		const { line, column } = locate(offset);
		diagnostics.push({ code: skipCode, message, file: filename, line, column });
	};

	walk(program, (node) => {
		if (node.type !== "CallExpression") return;
		const callee = node.callee as AnyNode | undefined;
		const args = node.arguments as AnyNode[] | undefined;

		if (!callee || callee.type !== "Identifier") return;
		const calleeName = callee.name as string;

		if (collectingNames.has(calleeName)) {
			if (!args || args.length < 3) {
				record(
					"missing-arguments",
					"collecting() requires 3 arguments (category, value, labels)",
					node,
				);
				return;
			}
			const category = extractStringLiteral(args[0]);
			if (category === null) {
				record("non-literal-argument", "collecting() category must be a string literal", node);
				return;
			}
			const labels = extractLabelKeys(args[2], ignoreNames, node, record);
			if (labels === null) {
				record(
					"non-object-label-map",
					"collecting() labels (3rd argument) must be an object literal",
					node,
				);
				return;
			}
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
			if (!args || args.length < 3) {
				record(
					"missing-arguments",
					"thirdParty() requires 3 arguments (name, purpose, policyUrl)",
					node,
				);
				return;
			}
			const name = extractStringLiteral(args[0]);
			if (name === null) {
				record("non-literal-argument", "thirdParty() name must be a string literal", node);
				return;
			}
			const purpose = extractStringLiteral(args[1]);
			if (purpose === null) {
				record("non-literal-argument", "thirdParty() purpose must be a string literal", node);
				return;
			}
			const policyUrl = extractStringLiteral(args[2]);
			if (policyUrl === null) {
				record("non-literal-argument", "thirdParty() policyUrl must be a string literal", node);
				return;
			}
			// Within-file duplicate of an already-captured entry — intentional
			// dedup, the data is not lost, so no diagnostic.
			if (seenThirdParties.has(name)) return;
			seenThirdParties.add(name);
			thirdParties.push({ name, purpose, policyUrl });
			return;
		}

		if (defineCookieNames.has(calleeName)) {
			if (!args || args.length < 1) {
				record("missing-arguments", "defineCookie() requires 1 argument (category)", node);
				return;
			}
			const category = extractStringLiteral(args[0]);
			if (category === null) {
				record("non-literal-argument", "defineCookie() category must be a string literal", node);
				return;
			}
			cookieSet.add(category);
		}
	});

	return { dataCollected, thirdParties, cookies: [...cookieSet], diagnostics };
}

/**
 * Walk `ImportDeclaration` nodes and return the local names bound to the given
 * `exportName` imported from `moduleName`. Skips type-only imports and
 * specifiers whose imported name doesn't match.
 */
function collectBindings(program: AnyNode, moduleName: string, exportName: string): Set<string> {
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
 * return `null` so the caller can record a diagnostic and skip the call.
 */
function extractStringLiteral(node: AnyNode | undefined): string | null {
	if (!node) return null;
	if (node.type !== "Literal") return null;
	if (typeof node.value !== "string") return null;
	return node.value;
}

/**
 * Best-effort property key name (`{ name: ... }` → `"name"`) for diagnostic
 * messages. Returns `null` for computed/non-trivial keys.
 */
function propKeyName(prop: AnyNode): string | null {
	const key = prop.key as AnyNode | undefined;
	if (!key) return null;
	if (key.type === "Identifier" && typeof key.name === "string") return key.name;
	if (key.type === "Literal" && typeof key.value === "string") return key.value;
	return null;
}

/**
 * Extract the string values from a plain `{ fieldName: "Human Label" }`
 * object literal. Returns an array of label strings, deduped while
 * preserving insertion order. Returns `null` if the node isn't an object
 * literal so the caller can report `non-object-label-map`.
 *
 * Properties whose value is an `Identifier` bound to the SDK's `Ignore`
 * export are explicit opt-outs and skipped without a diagnostic. Spread
 * elements and any other non-string-literal value are *recognized but
 * unreadable*, so each records a located diagnostic (`spread-in-label-map`
 * / `non-literal-label-value`) against the call before being dropped.
 */
function extractLabelKeys(
	node: AnyNode | undefined,
	ignoreNames: Set<string>,
	callNode: AnyNode,
	record: RecordFn,
): string[] | null {
	if (!node || node.type !== "ObjectExpression") return null;
	const properties = node.properties as AnyNode[] | undefined;
	if (!properties) return null;

	const labels: string[] = [];
	const seen = new Set<string>();
	for (const prop of properties) {
		if (prop.type !== "Property") {
			// SpreadElement: the labels behind the spread can't be read statically.
			record(
				"spread-in-label-map",
				"collecting() label object uses a spread; spread labels can't be read statically",
				callNode,
			);
			continue;
		}
		const val = prop.value as AnyNode | undefined;
		if (!val) continue;
		if (val.type === "Literal" && typeof val.value === "string") {
			// Duplicate label string — already captured, intentional dedup.
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
			// Explicit `Ignore` opt-out — intentional, not data loss.
			continue;
		}
		const field = propKeyName(prop);
		record(
			"non-literal-label-value",
			`collecting() label ${field ? `"${field}" ` : ""}value must be a string literal or Ignore`,
			callNode,
		);
	}
	return labels;
}

/**
 * Build a memoized offset → 1-based `{ line, column }` resolver for `code`.
 * The newline index is computed once on first use (diagnostics are rare, so
 * files with no skipped calls never pay for it).
 */
function makeLineLocator(code: string): (offset: number) => { line: number; column: number } {
	let cached: number[] | null = null;
	const lineStartsFor = (): number[] => {
		if (cached) return cached;
		const starts = [0];
		for (let i = 0; i < code.length; i++) {
			if (code.charCodeAt(i) === 10 /* \n */) starts.push(i + 1);
		}
		cached = starts;
		return starts;
	};
	return (offset) => {
		const starts = lineStartsFor();
		let lo = 0;
		let hi = starts.length - 1;
		while (lo < hi) {
			const mid = (lo + hi + 1) >> 1;
			if ((starts[mid] ?? 0) <= offset) lo = mid;
			else hi = mid - 1;
		}
		return { line: lo + 1, column: offset - (starts[lo] ?? 0) + 1 };
	};
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
