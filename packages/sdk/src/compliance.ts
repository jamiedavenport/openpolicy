import type { Jurisdiction, LegalBasis } from "@openpolicy/core";

export const Compliance = {
	GDPR: {
		jurisdictions: ["eu"] as Jurisdiction[],
		legalBasis: ["legitimate_interests"] as LegalBasis[],
	},
	UK_GDPR: {
		jurisdictions: ["uk"] as Jurisdiction[],
		legalBasis: ["legitimate_interests"] as LegalBasis[],
	},
	CCPA: {
		jurisdictions: ["us-ca"] as Jurisdiction[],
	},
} as const;
