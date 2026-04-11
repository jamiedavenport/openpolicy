import { expect, test } from "bun:test";
import { collecting } from "./collecting";

test("returns the exact same reference as value", () => {
	const value = { name: "Ada", email: "ada@example.com" };
	const result = collecting("Account Information", value, (v) => ({
		Name: v.name,
		"Email address": v.email,
	}));
	expect(result).toBe(value);
});

test("preserves heterogeneous value types", () => {
	const str = collecting("Strings", "hello", () => ({ Text: "hello" }));
	expect(str).toBe("hello");

	const num = collecting("Numbers", 42, () => ({ Count: 42 }));
	expect(num).toBe(42);

	const date = new Date("2026-01-01");
	const dateResult = collecting("Dates", date, (v) => ({ When: v }));
	expect(dateResult).toBe(date);

	const nil = collecting<null>("Nulls", null, () => ({ Nothing: null }));
	expect(nil).toBeNull();

	const nested = { outer: { inner: { leaf: 1 } } };
	const nestedResult = collecting("Nested", nested, (v) => ({
		Leaf: v.outer.inner.leaf,
	}));
	expect(nestedResult).toBe(nested);
});

test("label function is never invoked at runtime", () => {
	let called = false;
	const value = { name: "Ada" };
	const result = collecting("Account Information", value, (v) => {
		called = true;
		return { Name: v.name };
	});
	expect(called).toBe(false);
	expect(result).toBe(value);
});

test("returns value even when label function would throw", () => {
	const value = { name: "Ada" };
	const result = collecting("Account Information", value, () => {
		throw new Error("should never run");
	});
	expect(result).toBe(value);
});

test("works when value is an empty object", () => {
	const value = {};
	const result = collecting("Empty", value, () => ({}));
	expect(result).toBe(value);
});

test("preserves branded/opaque row types without degrading inference", () => {
	type UserRow = { readonly __brand: "UserRow"; name: string; email: string };
	const row = {
		__brand: "UserRow",
		name: "Ada",
		email: "ada@example.com",
	} as unknown as UserRow;

	// Compile-time check: the generic should infer `UserRow` so the label
	// callback sees the branded fields and the return type is `UserRow`.
	const result: UserRow = collecting("Account Information", row, (v) => ({
		Name: v.name,
		"Email address": v.email,
	}));
	expect(result).toBe(row);
});
