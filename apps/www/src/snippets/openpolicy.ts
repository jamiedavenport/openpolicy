import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Incorporated",
		address: "123 Market St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["us"],
	/* data-handling fields (dataCollected, legalBasis, retention, children) */
	/* cookie fields (cookies, trackingTechnologies, consentMechanism) */
});
