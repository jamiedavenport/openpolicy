import type { PrivacyPolicyConfig, ValidationIssue } from "./types";

export function validatePrivacyPolicy(
	config: PrivacyPolicyConfig,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	// Required fields
	if (!config.effectiveDate)
		issues.push({ level: "error", message: "effectiveDate is required" });
	if (!config.company.name)
		issues.push({ level: "error", message: "company.name is required" });
	if (!config.company.legalName)
		issues.push({ level: "error", message: "company.legalName is required" });
	if (!config.company.address)
		issues.push({ level: "error", message: "company.address is required" });
	if (!config.company.contact)
		issues.push({ level: "error", message: "company.contact is required" });
	if (Object.keys(config.dataCollected).length === 0)
		issues.push({
			level: "error",
			message: "dataCollected must have at least one entry",
		});
	if (config.userRights.length === 0)
		issues.push({
			level: "warning",
			message: "userRights is empty — consider listing applicable rights",
		});

	// GDPR checks
	if (config.jurisdictions.includes("eu")) {
		if (!config.legalBasis)
			issues.push({ level: "error", message: "GDPR requires a legalBasis" });
		for (const right of [
			"access",
			"rectification",
			"erasure",
			"portability",
			"restriction",
			"objection",
		]) {
			if (!config.userRights.includes(right))
				issues.push({
					level: "warning",
					message: `GDPR recommends including the "${right}" right`,
				});
		}
	}

	// CCPA checks
	if (config.jurisdictions.includes("ca")) {
		for (const right of [
			"access",
			"erasure",
			"opt_out_sale",
			"non_discrimination",
		]) {
			if (!config.userRights.includes(right))
				issues.push({
					level: "warning",
					message: `CCPA recommends including the "${right}" right`,
				});
		}
	}

	return issues;
}
