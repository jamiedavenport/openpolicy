import type { Rule } from "./types";

export { scan, defaultRules, defaultVendors } from "./scan";
export { parseFile } from "./parser";
export { applySuppressions } from "./suppress";
export { cookiesNextRule } from "./rules/cookies-next";
export { documentCookieRule } from "./rules/document-cookie";
export { jsCookieRule } from "./rules/js-cookie";
export { nextHeadersRule } from "./rules/next-headers";
export { reactCookieRule } from "./rules/react-cookie";
export { setCookieHeaderRule } from "./rules/set-cookie-header";
export { vendorImportsRule } from "./rules/vendor-imports";
export { calleeMatches, getStringArg, isCallTo, walk } from "./visit";
export type { WalkResult } from "./visit";
export type {
	AnyNode,
	Cookie,
	CookieKind,
	Hit,
	ImportInfo,
	Lang,
	ParsedComment,
	ParsedFile,
	Rule,
	ScanOptions,
	ScanResult,
	Ungated,
	VendorEntry,
	VendorHit,
	VendorRegistry,
	VendorVia,
	VisitContext,
} from "./types";

export function defineRule(rule: Rule): Rule {
	return rule;
}
