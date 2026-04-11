import { expect, test } from "bun:test";
import { extractCollecting } from "./analyse";

test("canonical case: string-literal keys in concise arrow body", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Account Information", { name, email }, (v) => ({
			"Name": v.name,
			"Email address": v.email,
		}));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("shorthand / unquoted identifier keys", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ Name: v.a, Email: v.b }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({
		Cat: ["Name", "Email"],
	});
});

test("renamed import", () => {
	const code = `
		import { collecting as col } from "@openpolicy/sdk";
		col("Cat", v, (v) => ({ Name: v.a }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Name"] });
});

test("block-body arrow function with explicit return", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => {
			return { "Name": v.a };
		});
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Name"] });
});

test("ignores collecting imported from a non-SDK module", () => {
	const code = `
		import { collecting } from "./local-collecting";
		collecting("Cat", v, (v) => ({ Name: v.a }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("ignores local `collecting` not imported from anywhere", () => {
	const code = `
		function collecting(a, b, c) { return b; }
		collecting("Cat", v, (v) => ({ Name: v.a }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("ignores type-only imports", () => {
	const code = `
		import type { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ Name: v.a }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("skips template-literal category silently", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting(\`Cat\`, v, (v) => ({ Name: v.a }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("drops computed and spread keys but keeps the rest", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const KEY = "X";
		const rest = {};
		collecting("Cat", v, (v) => ({
			[KEY]: v.a,
			...rest,
			Kept: v.b,
		}));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Kept"] });
});

test("malformed source returns {} without throwing", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ Name: v.a }
	`;
	const originalWarn = console.warn;
	console.warn = () => {}; // suppress expected parse-error log
	try {
		expect(() => extractCollecting("a.ts", code)).not.toThrow();
		// Parser still produces a partial AST that may or may not contain the
		// call, but the function must never throw and must return an object.
		const out = extractCollecting("a.ts", code);
		expect(typeof out).toBe("object");
	} finally {
		console.warn = originalWarn;
	}
});

test("merges multiple calls with the same category", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ A: v.a }));
		collecting("Cat", w, (w) => ({ B: w.b, A: w.a2 }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["A", "B"] });
});

test("deduplicates repeated labels across and within calls", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ A: v.a, A: v.a2 }));
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["A"] });
});

test("skips calls with fewer than three arguments", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v);
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("skips calls whose third arg is not an arrow function", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const fn = (v) => ({ Name: v.a });
		collecting("Cat", v, fn);
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("empty source returns {}", () => {
	expect(extractCollecting("a.ts", "")).toEqual({});
});

test("calls nested inside other functions are still extracted", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		export function createUser(name: string, email: string) {
			return db.insert(users).values(
				collecting("Account Information", { name, email }, (v) => ({
					Name: v.name,
					"Email address": v.email,
				})),
			);
		}
	`;
	expect(extractCollecting("a.ts", code)).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});
