import type { Jurisdiction, UserRight } from "./types";

const RIGHTS_BY_JURISDICTION: Partial<
	Record<Jurisdiction, readonly UserRight[]>
> = {
	eu: [
		"access",
		"rectification",
		"erasure",
		"portability",
		"restriction",
		"objection",
	],
	ca: ["access", "erasure", "opt_out_sale", "non_discrimination"],
};

const CANONICAL_ORDER: readonly UserRight[] = [
	"access",
	"rectification",
	"erasure",
	"portability",
	"restriction",
	"objection",
	"opt_out_sale",
	"non_discrimination",
];

export function deriveUserRights(jurisdictions: Jurisdiction[]): UserRight[] {
	const set = new Set<UserRight>();
	for (const j of jurisdictions) {
		for (const right of RIGHTS_BY_JURISDICTION[j] ?? []) set.add(right);
	}
	return CANONICAL_ORDER.filter((right) => set.has(right));
}
