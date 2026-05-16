import { describe, expect, it } from "vite-plus/test";
import { parseFile } from "./parser";
import type { Hit, Rule, VisitContext } from "./types";
import { calleeMatches, getStringArg, isCallTo, walk } from "./visit";

function runRules(file: string, source: string, rules: Rule[]): Hit[] {
	const parsed = parseFile(file, source)!;
	return walk(parsed, rules, []).hits;
}

describe("walk", () => {
	it("visits every node and exposes a parent stack", () => {
		const seen: string[] = [];
		const rule: Rule = {
			name: "probe",
			visit: (ctx: VisitContext) => {
				if (ctx.node.type === "Identifier") {
					seen.push(`${ctx.node.name as string}@${ctx.parents.map((p) => p.type).join(",")}`);
				}
			},
		};
		runRules("a.ts", "const x = y;", [rule]);
		expect(seen.some((s) => s.startsWith("x@"))).toBe(true);
		expect(seen.some((s) => s.startsWith("y@"))).toBe(true);
	});

	it("offsets positions by lineOffset for SFC files", () => {
		const src = `<template></template>\n<script>\ndocument.cookie = 'a';\n</script>`;
		const parsed = parseFile("a.vue", src)!;
		let line = 0;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (ctx.node.type === "AssignmentExpression") {
							line = ctx.position(ctx.node.start).line;
						}
					},
				},
			],
			[],
		);
		expect(line).toBe(3);
	});
});

describe("isCallTo / calleeMatches", () => {
	it("matches dotted member expressions", () => {
		const parsed = parseFile("a.ts", "Cookies.set('a', 'b');")!;
		let matched = false;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "Cookies.set")) matched = true;
					},
				},
			],
			[],
		);
		expect(matched).toBe(true);
	});

	it("does not match similar-looking calls", () => {
		const parsed = parseFile("a.ts", "Cookies.delete('a');")!;
		let matched = false;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "Cookies.set")) matched = true;
					},
				},
			],
			[],
		);
		expect(matched).toBe(false);
	});

	it("matches plain identifier calls", () => {
		const parsed = parseFile("a.ts", "gtag('event', 'x');")!;
		let matched = false;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "gtag")) matched = true;
					},
				},
			],
			[],
		);
		expect(matched).toBe(true);
	});
});

describe("getStringArg", () => {
	it("reads literal string args", () => {
		const parsed = parseFile("a.ts", "f('hello', 'world');")!;
		let v: string | undefined;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "f")) v = getStringArg(ctx.node, 0);
					},
				},
			],
			[],
		);
		expect(v).toBe("hello");
	});

	it("reads simple template literals", () => {
		const parsed = parseFile("a.ts", "f(`hello`);")!;
		let v: string | undefined;
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "f")) v = getStringArg(ctx.node, 0);
					},
				},
			],
			[],
		);
		expect(v).toBe("hello");
	});

	it("returns undefined for interpolated templates", () => {
		const parsed = parseFile("a.ts", "f(`hi ${name}`);")!;
		let v: string | undefined = "x";
		walk(
			parsed,
			[
				{
					name: "p",
					visit: (ctx) => {
						if (isCallTo(ctx.node, "f")) v = getStringArg(ctx.node, 0);
					},
				},
			],
			[],
		);
		expect(v).toBeUndefined();
	});
});

// helper used: silence unused warning
void calleeMatches;
