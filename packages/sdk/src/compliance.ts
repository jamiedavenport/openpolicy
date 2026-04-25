import type { Jurisdiction, LegalBasisMap } from "@openpolicy/core";

export const Compliance = {
	GDPR: {
		jurisdictions: ["eu"] as Jurisdiction[],
		legalBasis: { "Providing the service": "legitimate_interests" } satisfies LegalBasisMap,
	},
	UK_GDPR: {
		jurisdictions: ["uk"] as Jurisdiction[],
		legalBasis: { "Providing the service": "legitimate_interests" } satisfies LegalBasisMap,
	},
	CCPA: {
		jurisdictions: ["us-ca"] as Jurisdiction[],
	},
} as const;
