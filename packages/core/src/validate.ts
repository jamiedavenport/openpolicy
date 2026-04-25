import type { PrivacyPolicyConfig, ValidationIssue } from "./types";

export function validatePrivacyPolicy(config: PrivacyPolicyConfig): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	// Required fields
	if (!config.effectiveDate)
		issues.push({
			code: "effective-date-required",
			level: "error",
			message: "effectiveDate is required",
		});
	if (!config.company.name)
		issues.push({
			code: "company-name-required",
			level: "error",
			message: "company.name is required",
		});
	if (!config.company.legalName)
		issues.push({
			code: "company-legal-name-required",
			level: "error",
			message: "company.legalName is required",
		});
	if (!config.company.address)
		issues.push({
			code: "company-address-required",
			level: "error",
			message: "company.address is required",
		});
	if (!config.company.contact)
		issues.push({
			code: "company-contact-required",
			level: "error",
			message: "company.contact is required",
		});
	const { collected, purposes } = config.data;
	if (Object.keys(collected).length === 0)
		issues.push({
			code: "data-collected-required",
			level: "error",
			message: "data.collected must have at least one entry",
		});
	for (const category of Object.keys(collected)) {
		const purpose = purposes[category];
		if (purpose === undefined) {
			issues.push({
				code: "data-purpose-missing",
				level: "error",
				message: `data.purposes["${category}"] is missing — every collected category requires a processing purpose (GDPR Art. 13(1)(c))`,
			});
			continue;
		}
		if (purpose.trim().length === 0) {
			issues.push({
				code: "data-purpose-empty",
				level: "error",
				message: `data.purposes["${category}"] must be a non-empty string`,
			});
		}
	}
	for (const category of Object.keys(purposes)) {
		if (!(category in collected)) {
			issues.push({
				code: "data-purpose-orphan",
				level: "error",
				message: `data.purposes["${category}"] has no matching entry in data.collected — remove it or declare the collected fields`,
			});
		}
	}

	// GDPR / UK-GDPR checks: lawful basis must be stated for each distinct
	// processing purpose (GDPR Art. 13(1)(c)).
	if (config.jurisdictions.includes("eu") || config.jurisdictions.includes("uk")) {
		const entries = Object.entries(config.legalBasis ?? {});
		if (entries.length === 0) {
			issues.push({
				code: "lawful-basis-per-purpose",
				level: "error",
				message:
					"GDPR Article 13(1)(c): legalBasis must declare at least one processing purpose with its lawful basis.",
			});
		}
		for (const [purpose, basis] of entries) {
			if (!basis) {
				issues.push({
					code: "lawful-basis-per-purpose",
					level: "error",
					message: `GDPR Article 13(1)(c): processing purpose "${purpose}" must declare a lawful basis.`,
				});
			}
		}
	}

	// children config sanity
	if (config.children) {
		if (config.children.underAge <= 0) {
			issues.push({
				code: "children-under-age-invalid",
				level: "error",
				message: "children.underAge must be a positive number",
			});
		}
	}

	return issues;
}
