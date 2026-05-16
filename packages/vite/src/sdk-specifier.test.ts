import { expect, test } from "vite-plus/test";
import { CANONICAL_SDK_SPECIFIERS, isCanonicalSdkSpecifier } from "./sdk-specifier";

test("both canonical scopes are recognised", () => {
	expect(isCanonicalSdkSpecifier("@openpolicy/sdk")).toBe(true);
	// PS-34: the rename window needs no scanner change — @policystack/sdk is
	// already canonical.
	expect(isCanonicalSdkSpecifier("@policystack/sdk")).toBe(true);
	expect(CANONICAL_SDK_SPECIFIERS).toEqual(["@openpolicy/sdk", "@policystack/sdk"]);
});

test("look-alikes and subpaths are rejected", () => {
	for (const s of [
		"@openpolicy/sdk-x",
		"@openpolicy/sdkk",
		"@openpolicy/sdk/foo",
		"@policystack/sdk/opencookies",
		"openpolicy-sdk",
		"@openpolicy/core",
		"./sdk",
		"",
	]) {
		expect(isCanonicalSdkSpecifier(s)).toBe(false);
	}
});
