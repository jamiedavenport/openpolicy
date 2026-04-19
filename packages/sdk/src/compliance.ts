import type { Jurisdiction, LegalBasis } from "@openpolicy/core";

export const Compliance = {
	GDPR: {
		jurisdictions: ["eu"] as Jurisdiction[],
		legalBasis: ["legitimate_interests"] as LegalBasis[],
	},
	CCPA: {
		jurisdictions: ["ca"] as Jurisdiction[],
	},
} as const;
