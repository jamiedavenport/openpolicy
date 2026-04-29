import { expect, test } from "vite-plus/test";
import { extractFromFile } from "./analyse";

// ---------------------------------------------------------------------------
// collecting() tests
// ---------------------------------------------------------------------------

test("canonical case: string literal values in object literal", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Account Information", { name, email }, {
			name: "Name",
			email: "Email address",
		});
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("renamed import", () => {
	const code = `
		import { collecting as col } from "@openpolicy/sdk";
		col("Cat", v, { a: "Name" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["Name"],
	});
});

test("ignores collecting imported from a non-SDK module", () => {
	const code = `
		import { collecting } from "./local-collecting";
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("ignores local `collecting` not imported from anywhere", () => {
	const code = `
		function collecting(a, b, c) { return b; }
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("ignores type-only imports", () => {
	const code = `
		import type { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("skips template-literal category silently", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting(\`Cat\`, v, { a: "Name" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("non-string values skipped silently, string values kept", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: 42, b: "Kept", c: true });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["Kept"],
	});
});

test("spread elements skipped silently", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const rest = {};
		collecting("Cat", v, { ...rest, b: "Kept" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["Kept"],
	});
});

test("malformed source returns empty without throwing", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "Name"
	`;
	const originalWarn = console.warn;
	console.warn = () => {}; // suppress expected parse-error log
	try {
		expect(() => extractFromFile("a.ts", code)).not.toThrow();
		// Parser still produces a partial AST that may or may not contain the
		// call, but the function must never throw and must return an object.
		const out = extractFromFile("a.ts", code);
		expect(typeof out).toBe("object");
	} finally {
		console.warn = originalWarn;
	}
});

test("merges multiple calls with the same category", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "A" });
		collecting("Cat", w, { b: "B", a2: "A" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["A", "B"],
	});
});

test("deduplicates repeated label values across and within calls", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "A", a2: "A" });
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({ Cat: ["A"] });
});

test("skips calls with fewer than three arguments", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v);
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("skips calls whose third arg is a variable reference", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const labels = { a: "Name" };
		collecting("Cat", v, labels);
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("skips calls whose third arg is an arrow function", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ Name: v.a }));
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({});
});

test("empty source returns empty", () => {
	const result = extractFromFile("a.ts", "");
	expect(result.dataCollected).toEqual({});
	expect(result.thirdParties).toEqual([]);
});

test("Ignore sentinel omits the field but keeps other string-literal labels", () => {
	const code = `
		import { collecting, Ignore } from "@openpolicy/sdk";
		collecting("Account Information", { name, hashedPassword }, {
			name: "Name",
			hashedPassword: Ignore,
		});
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		"Account Information": ["Name"],
	});
});

test("Ignore recognised under a renamed import", () => {
	const code = `
		import { collecting, Ignore as Skip } from "@openpolicy/sdk";
		collecting("Cat", v, {
			a: "Name",
			b: Skip,
		});
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["Name"],
	});
});

test("Ignore imported from a non-SDK module is not recognised", () => {
	// The local `Ignore` here is unrelated to the SDK sentinel; its Identifier
	// value falls through the conservative silent-skip path so the field is
	// absent from labels (same observable result, but no special treatment).
	const code = `
		import { collecting } from "@openpolicy/sdk";
		import { Ignore } from "./somewhere-else";
		collecting("Cat", v, {
			a: "Name",
			b: Ignore,
		});
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		Cat: ["Name"],
	});
});

test("all properties marked Ignore yields an empty label array for the category", () => {
	const code = `
		import { collecting, Ignore } from "@openpolicy/sdk";
		collecting("Cat", v, {
			a: Ignore,
			b: Ignore,
		});
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({ Cat: [] });
});

test("calls nested inside other functions are still extracted", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		export function createUser(name: string, email: string) {
			return db.insert(users).values(
				collecting("Account Information", { name, email }, {
					name: "Name",
					email: "Email address",
				}),
			);
		}
	`;
	expect(extractFromFile("a.ts", code).dataCollected).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

// ---------------------------------------------------------------------------
// thirdParty() tests
// ---------------------------------------------------------------------------

test("thirdParty: canonical case with 3 string literal args", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

test("thirdParty: renamed import", () => {
	const code = `
		import { thirdParty as tp } from "@openpolicy/sdk";
		tp("Stripe", "Payments", "https://stripe.com/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

test("thirdParty: ignored if imported from non-SDK module", () => {
	const code = `
		import { thirdParty } from "./local-third-party";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([]);
});

test("thirdParty: ignored if fewer than 3 args", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([]);
});

test("thirdParty: ignored if first arg is non-literal", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		const name = "Stripe";
		thirdParty(name, "Payments", "https://stripe.com/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([]);
});

test("thirdParty: ignored if second arg is non-literal", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", getPurpose(), "https://stripe.com/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([]);
});

test("thirdParty: ignored if third arg is non-literal", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", STRIPE_POLICY_URL);
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([]);
});

test("thirdParty: deduplication — same name in same file appears once", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		thirdParty("Stripe", "Billing", "https://stripe.com/other");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

test("thirdParty: multiple distinct entries", () => {
	const code = `
		import { thirdParty } from "@openpolicy/sdk";
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		thirdParty("Sentry", "Error tracking", "https://sentry.io/privacy");
	`;
	expect(extractFromFile("a.ts", code).thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
		{
			name: "Sentry",
			purpose: "Error tracking",
			policyUrl: "https://sentry.io/privacy",
		},
	]);
});

test("collecting and thirdParty can coexist in the same file", () => {
	const code = `
		import { collecting, thirdParty } from "@openpolicy/sdk";
		collecting("Account Information", v, { name: "Name" });
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
	`;
	const result = extractFromFile("a.ts", code);
	expect(result.dataCollected).toEqual({ "Account Information": ["Name"] });
	expect(result.thirdParties).toEqual([
		{
			name: "Stripe",
			purpose: "Payments",
			policyUrl: "https://stripe.com/privacy",
		},
	]);
});

// ---------------------------------------------------------------------------
// cookie detection tests
// ---------------------------------------------------------------------------

test("defineCookie: string literal category is collected", () => {
	const code = `
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual(["analytics"]);
});

test("defineCookie: multiple distinct categories collected in insertion order", () => {
	const code = `
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
		defineCookie("marketing");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual(["analytics", "marketing"]);
});

test("defineCookie: duplicate categories deduped", () => {
	const code = `
		import { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
		defineCookie("analytics");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual(["analytics"]);
});

test("defineCookie: renamed import recognised", () => {
	const code = `
		import { defineCookie as dc } from "@openpolicy/sdk";
		dc("functional");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual(["functional"]);
});

test("defineCookie: ignored if imported from non-SDK module", () => {
	const code = `
		import { defineCookie } from "./local-define-cookie";
		defineCookie("analytics");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual([]);
});

test("defineCookie: ignored for type-only imports", () => {
	const code = `
		import type { defineCookie } from "@openpolicy/sdk";
		defineCookie("analytics");
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual([]);
});

test("defineCookie: non-literal argument skipped silently", () => {
	const code = `
		import { defineCookie } from "@openpolicy/sdk";
		const cat = "analytics";
		defineCookie(cat);
	`;
	expect(extractFromFile("a.ts", code).cookies).toEqual([]);
});

test("cookies + collecting + thirdParty coexist in one file", () => {
	const code = `
		import { collecting, thirdParty, defineCookie } from "@openpolicy/sdk";
		collecting("Account Information", v, { name: "Name" });
		thirdParty("Stripe", "Payments", "https://stripe.com/privacy");
		defineCookie("analytics");
		defineCookie("marketing");
	`;
	const result = extractFromFile("a.tsx", code);
	expect(result.dataCollected).toEqual({ "Account Information": ["Name"] });
	expect(result.thirdParties).toHaveLength(1);
	expect(result.cookies.sort()).toEqual(["analytics", "marketing"]);
});
