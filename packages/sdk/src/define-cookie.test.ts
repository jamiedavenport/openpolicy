import { expect, test } from "vite-plus/test";
import { defineCookie } from "./define-cookie";

test("defineCookie is a no-op that returns undefined", () => {
	expect(defineCookie("analytics")).toBeUndefined();
	expect(defineCookie("marketing")).toBeUndefined();
});
