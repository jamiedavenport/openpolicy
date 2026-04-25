import type { Jurisdiction } from "@openpolicy/core";

export const Compliance = {
	GDPR: {
		jurisdictions: ["eu"] as Jurisdiction[],
	},
	UK_GDPR: {
		jurisdictions: ["uk"] as Jurisdiction[],
	},
	CCPA: {
		jurisdictions: ["us-ca"] as Jurisdiction[],
	},
} as const;
