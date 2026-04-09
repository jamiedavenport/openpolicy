import type { Jurisdiction, LegalBasis, UserRight } from "@openpolicy/core";

export const Compliance = {
	GDPR: {
		jurisdictions: ["eu"] as Jurisdiction[],
		legalBasis: ["legitimate_interests"] as LegalBasis[],
		userRights: [
			"access",
			"rectification",
			"erasure",
			"portability",
			"restriction",
			"objection",
		] as UserRight[],
	},
	CCPA: {
		jurisdictions: ["ca"] as Jurisdiction[],
		userRights: [
			"access",
			"erasure",
			"opt_out_sale",
			"non_discrimination",
		] as UserRight[],
	},
} as const;
