import type { OpenPolicyConfig } from "@openpolicy/core";

export type DemoScene = {
	label: string;
	code: string;
	config: OpenPolicyConfig;
	addedLines: number[];
};

const SCENE_0_CODE = `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme Inc.",
    address: "123 Market St",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  jurisdictions: ["us-ca"],
  data: {
    collected: { Account: ["Email"] },
    context: {
      Account: {
        purpose: "Sign you in",
        lawfulBasis: "contract",
        retention: "While account is active",
        provision: {
          basis: "contract-prerequisite",
          consequences: "Account creation fails",
        },
      },
    },
  },
});
`;

const SCENE_1_CODE = `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme Inc.",
    address: "123 Market St",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  jurisdictions: ["us-ca", "eu"],
  data: {
    collected: { Account: ["Email"] },
    context: {
      Account: {
        purpose: "Sign you in",
        lawfulBasis: "contract",
        retention: "While account is active",
        provision: {
          basis: "contract-prerequisite",
          consequences: "Account creation fails",
        },
      },
    },
  },
});
`;

const SCENE_2_CODE = `import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme Inc.",
    address: "123 Market St",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  jurisdictions: ["us-ca", "eu"],
  data: {
    collected: {
      Account: ["Email"],
      Analytics: ["IP address", "User agent"],
    },
    context: {
      Account: {
        purpose: "Sign you in",
        lawfulBasis: "contract",
        retention: "While account is active",
        provision: {
          basis: "contract-prerequisite",
          consequences: "Account creation fails",
        },
      },
      Analytics: {
        purpose: "Understand product usage",
        lawfulBasis: "legitimate_interests",
        retention: "13 months",
        provision: {
          basis: "voluntary",
          consequences: "Limited product insights",
        },
      },
    },
  },
});
`;

const COMPANY = {
	name: "Acme",
	legalName: "Acme Inc.",
	address: "123 Market St",
	contact: "privacy@acme.com",
} as const;

const SCENE_0_CONFIG: OpenPolicyConfig = {
	company: COMPANY,
	effectiveDate: "2026-01-01",
	jurisdictions: ["us-ca"],
	data: {
		collected: { Account: ["Email"] },
		context: {
			Account: {
				purpose: "Sign you in",
				lawfulBasis: "contract",
				retention: "While account is active",
				provision: { basis: "contract-prerequisite", consequences: "Account creation fails" },
			},
		},
	},
};

const SCENE_1_CONFIG: OpenPolicyConfig = {
	...SCENE_0_CONFIG,
	jurisdictions: ["us-ca", "eu"],
};

const SCENE_2_CONFIG: OpenPolicyConfig = {
	...SCENE_1_CONFIG,
	data: {
		collected: {
			Account: ["Email"],
			Analytics: ["IP address", "User agent"],
		},
		context: {
			Account: {
				purpose: "Sign you in",
				lawfulBasis: "contract",
				retention: "While account is active",
				provision: {
					basis: "contract-prerequisite",
					consequences: "Account creation fails",
				},
			},
			Analytics: {
				purpose: "Understand product usage",
				lawfulBasis: "legitimate_interests",
				retention: "13 months",
				provision: {
					basis: "voluntary",
					consequences: "Limited product insights",
				},
			},
		},
	},
};

// Lines (0-indexed) that were added vs the previous scene.
// SCENE_0 has none (it's the baseline); the others highlight what's new.
export const scenes: DemoScene[] = [
	{ label: "CCPA", code: SCENE_0_CODE, config: SCENE_0_CONFIG, addedLines: [] },
	{ label: "+ GDPR", code: SCENE_1_CODE, config: SCENE_1_CONFIG, addedLines: [10] },
	{
		label: "+ analytics",
		code: SCENE_2_CODE,
		config: SCENE_2_CONFIG,
		addedLines: [14, 26, 27, 28, 29, 30, 31, 32, 33, 34],
	},
];
