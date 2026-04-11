import { beforeEach, expect, test } from "bun:test";
import { __setAutoCollectedRegistry, autoCollected } from "./auto-collected";

beforeEach(() => {
	__setAutoCollectedRegistry({});
});

test("returns an empty object when nothing has been set", () => {
	expect(autoCollected()).toEqual({});
});

test("returns the populated registry after __setAutoCollectedRegistry", () => {
	__setAutoCollectedRegistry({
		"Account Information": ["Name", "Email address"],
	});
	expect(autoCollected()).toEqual({
		"Account Information": ["Name", "Email address"],
	});
});

test("mutating the returned snapshot does not leak into the registry", () => {
	__setAutoCollectedRegistry({ "Account Information": ["Name"] });

	const snapshot = autoCollected();
	snapshot["Account Information"]?.push("Leaked field");
	snapshot["New Category"] = ["Injected"];

	expect(autoCollected()).toEqual({ "Account Information": ["Name"] });
});

test("__setAutoCollectedRegistry({}) resets the registry", () => {
	__setAutoCollectedRegistry({ X: ["Y"] });
	expect(autoCollected()).toEqual({ X: ["Y"] });

	__setAutoCollectedRegistry({});
	expect(autoCollected()).toEqual({});
});

test("repeated calls return equal but distinct snapshots", () => {
	__setAutoCollectedRegistry({ Cat: ["A", "B"] });

	const first = autoCollected();
	const second = autoCollected();

	expect(first).toEqual(second);
	expect(first).not.toBe(second);
	expect(first.Cat).not.toBe(second.Cat);
});

test("setter also snapshots its input — mutating the source array does not leak", () => {
	const source = { Cat: ["A"] };
	__setAutoCollectedRegistry(source);

	source.Cat.push("B");

	expect(autoCollected()).toEqual({ Cat: ["A"] });
});
