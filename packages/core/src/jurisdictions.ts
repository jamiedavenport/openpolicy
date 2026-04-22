import type { Jurisdiction } from "./types";

export const JURISDICTIONS: readonly Jurisdiction[] = [
	"eu",
	"uk",
	"us-ca",
	"us-va",
	"us-co",
	"br",
	"ca",
	"au",
	"jp",
	"sg",
] as const;

export function isJurisdiction(value: string): value is Jurisdiction {
	return (JURISDICTIONS as readonly string[]).includes(value);
}
