import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Incorporated",
		address: "123 Market St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	privacy: {
		/* [...] */
	},
	cookie: {
		/* [...] */
	},
});
