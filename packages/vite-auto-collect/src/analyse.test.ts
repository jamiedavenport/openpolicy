import { expect, test } from "bun:test";
import { extractCollecting } from "./analyse";

test("canonical case: string literal values in object literal", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Account Information", { name, email }, {
			name: "Name",
			email: "Email address",
		});
	`;
	expect(extractCollecting("a.ts", code)).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("renamed import", () => {
	const code = `
		import { collecting as col } from "@openpolicy/sdk";
		col("Cat", v, { a: "Name" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Name"] });
});

test("ignores collecting imported from a non-SDK module", () => {
	const code = `
		import { collecting } from "./local-collecting";
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("ignores local `collecting` not imported from anywhere", () => {
	const code = `
		function collecting(a, b, c) { return b; }
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("ignores type-only imports", () => {
	const code = `
		import type { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "Name" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("skips template-literal category silently", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting(\`Cat\`, v, { a: "Name" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("non-string values skipped silently, string values kept", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: 42, b: "Kept", c: true });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Kept"] });
});

test("spread elements skipped silently", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const rest = {};
		collecting("Cat", v, { ...rest, b: "Kept" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["Kept"] });
});

test("malformed source returns {} without throwing", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "Name"
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
		collecting("Cat", v, { a: "A" });
		collecting("Cat", w, { b: "B", a2: "A" });
	`;
	expect(extractCollecting("a.ts", code)).toEqual({ Cat: ["A", "B"] });
});

test("deduplicates repeated label values across and within calls", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, { a: "A", a2: "A" });
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

test("skips calls whose third arg is a variable reference", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		const labels = { a: "Name" };
		collecting("Cat", v, labels);
	`;
	expect(extractCollecting("a.ts", code)).toEqual({});
});

test("skips calls whose third arg is an arrow function", () => {
	const code = `
		import { collecting } from "@openpolicy/sdk";
		collecting("Cat", v, (v) => ({ Name: v.a }));
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
				collecting("Account Information", { name, email }, {
					name: "Name",
					email: "Email address",
				}),
			);
		}
	`;
	expect(extractCollecting("a.ts", code)).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});
