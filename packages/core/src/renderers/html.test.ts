import { expect, test } from "bun:test";
import type { Document } from "../documents/types";
import { renderHTML } from "./html";

function doc(sections: Document["sections"]): Document {
	return { type: "document", policyType: "privacy", sections };
}

test("renders heading as <h2>", () => {
	const result = renderHTML(
		doc([
			{
				type: "section",
				id: "s1",
				content: [{ type: "heading", value: "Introduction" }],
			},
		]),
	);
	expect(result).toContain("<h2>Introduction</h2>");
});

test("renders paragraph as <p>", () => {
	const result = renderHTML(
		doc([
			{
				type: "section",
				id: "s1",
				content: [
					{
						type: "paragraph",
						children: [{ type: "text", value: "Hello world" }],
					},
				],
			},
		]),
	);
	expect(result).toContain("<p>Hello world</p>");
});

test("renders bold as <strong>", () => {
	const result = renderHTML(
		doc([
			{
				type: "section",
				id: "s1",
				content: [
					{
						type: "paragraph",
						children: [{ type: "bold", value: "Important" }],
					},
				],
			},
		]),
	);
	expect(result).toContain("<strong>Important</strong>");
});

test("renders link as <a>", () => {
	const result = renderHTML(
		doc([
			{
				type: "section",
				id: "s1",
				content: [
					{
						type: "paragraph",
						children: [
							{ type: "link", href: "https://example.com", value: "here" },
						],
					},
				],
			},
		]),
	);
	expect(result).toContain('<a href="https://example.com">here</a>');
});

test("renders list as <ul>/<li>", () => {
	const result = renderHTML(
		doc([
			{
				type: "section",
				id: "s1",
				content: [
					{
						type: "list",
						items: [
							{
								type: "listItem",
								children: [{ type: "text", value: "Alpha" }],
							},
							{
								type: "listItem",
								children: [{ type: "text", value: "Beta" }],
							},
						],
					},
				],
			},
		]),
	);
	expect(result).toContain("<ul>");
	expect(result).toContain("<li>Alpha</li>");
	expect(result).toContain("<li>Beta</li>");
});
