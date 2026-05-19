import { expect, test } from "vite-plus/test";
import {
	isJurisdictionId,
	JURISDICTION_IDS,
	JURISDICTION_TABLE,
	resolveJurisdiction,
} from "./jurisdiction-id";

// The union membership is the frozen part of the 1.0 surface (§4.2.1). This
// guards the count and the specific/equivalent split so a stray edit to the
// table is a loud test failure, not a silent compliance regression.

test("the canonical union is exactly 11 members", () => {
	expect(JURISDICTION_IDS).toHaveLength(11);
	expect([...JURISDICTION_IDS].sort()).toEqual(
		["br", "ca", "ch", "eea", "row", "uk", "us", "us-ca", "us-co", "us-ct", "us-va"].sort(),
	);
});

test("exactly 3 specific (eea, uk, us-ca); the other 8 are equivalent", () => {
	const specific = JURISDICTION_IDS.filter(
		(id) => JURISDICTION_TABLE[id].policyText === "specific",
	);
	expect([...specific].sort()).toEqual(["eea", "uk", "us-ca"]);
	expect(JURISDICTION_IDS).toHaveLength(specific.length + 8);
});

test("US state codes inherit parent `us`; nothing else has a parent", () => {
	for (const id of JURISDICTION_IDS) {
		const expected = ["us-ca", "us-co", "us-ct", "us-va"].includes(id) ? "us" : undefined;
		expect(JURISDICTION_TABLE[id].parent).toBe(expected);
	}
});

test("gpcLegallyBinding is true only for the §4.2 set us-ca/us-co/us-ct/us-va", () => {
	const binding = JURISDICTION_IDS.filter((id) => JURISDICTION_TABLE[id].gpcLegallyBinding);
	expect([...binding].sort()).toEqual(["us-ca", "us-co", "us-ct", "us-va"]);
});

test("consentModel: only us/us-* are opt-out", () => {
	const optOut = JURISDICTION_IDS.filter((id) => JURISDICTION_TABLE[id].consentModel === "opt-out");
	expect([...optOut].sort()).toEqual(["us", "us-ca", "us-co", "us-ct", "us-va"]);
});

test("isJurisdictionId accepts every canonical code and rejects retired/regulation names", () => {
	for (const id of JURISDICTION_IDS) expect(isJurisdictionId(id)).toBe(true);
	for (const bad of ["eu", "au", "jp", "sg", "nz", "other", "gdpr", "ccpa", "us-fl", ""]) {
		expect(isJurisdictionId(bad)).toBe(false);
	}
});

test("resolveJurisdiction: exact hits, us-${string} → parent us, else null", () => {
	for (const id of JURISDICTION_IDS) expect(resolveJurisdiction(id)).toBe(id);
	// A recognised state stays itself; the unenumerated tail folds to `us`.
	expect(resolveJurisdiction("us-ca")).toBe("us-ca");
	expect(resolveJurisdiction("us-fl")).toBe("us");
	expect(resolveJurisdiction("us-tx")).toBe("us");
	expect(resolveJurisdiction("eu")).toBeNull();
	expect(resolveJurisdiction("uss-ca")).toBeNull();
	expect(resolveJurisdiction("")).toBeNull();
});
