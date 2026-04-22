import { expect, test } from "bun:test";
import { defineCookie } from "./define-cookie";

test("defineCookie is a no-op that returns undefined", () => {
	expect(defineCookie("analytics")).toBeUndefined();
	expect(defineCookie("marketing")).toBeUndefined();
});
