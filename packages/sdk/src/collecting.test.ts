import { expect, test } from "bun:test";
import { collecting, Ignore } from "./collecting";

test("returns the exact same reference as value", () => {
	const value = { name: "Ada", email: "ada@example.com" };
	const result = collecting("Account Information", value, {
		name: "Name",
		email: "Email address",
	});
	expect(result).toBe(value);
});

test("label object is never evaluated at runtime", () => {
	// The object literal is provided but collecting() must return value unchanged
	// without any side effects from evaluating labels.
	const value = { name: "Ada" };
	const result = collecting("Account Information", value, { name: "Name" });
	expect(result).toBe(value);
});

test("returns value even when label object has non-string values", () => {
	const value = { name: "Ada" };
	const result = collecting("Account Information", value, {
		name: 42 as unknown as string,
	});
	expect(result).toBe(value);
});

test("works when value is an empty object", () => {
	const value = {};
	const result = collecting("Empty", value, {});
	expect(result).toBe(value);
});

test("preserves branded/opaque row types without degrading inference", () => {
	type UserRow = { readonly __brand: "UserRow"; name: string; email: string };
	const row = {
		__brand: "UserRow",
		name: "Ada",
		email: "ada@example.com",
	} as unknown as UserRow;

	// Compile-time check: the generic should infer `UserRow` so the return
	// type is `UserRow`.
	const result: UserRow = collecting("Account Information", row, {
		name: "Name",
		email: "Email address",
		__brand: "Brand",
	});
	expect(result).toBe(row);
});

test("accepts Ignore sentinel for fields excluded from the policy", () => {
	const value = { name: "Ada", hashedPassword: "hunter2" };
	const result = collecting("Account Information", value, {
		name: "Name",
		hashedPassword: Ignore,
	});
	expect(result).toBe(value);
});

test("omitting a key of value from the label record is a type error", () => {
	const value = { name: "Ada", hashedPassword: "hunter2" };
	// @ts-expect-error — every key of `value` must be labelled (or explicitly
	// marked with `Ignore`); omitting `hashedPassword` is no longer allowed.
	const result = collecting("Account Information", value, { name: "Name" });
	expect(result).toBe(value);
});
