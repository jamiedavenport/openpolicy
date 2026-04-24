import type { PrivacyPolicyConfig, ValidationIssue } from "./types";

export function validatePrivacyPolicy(config: PrivacyPolicyConfig): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	// Required fields
	if (!config.effectiveDate) issues.push({ level: "error", message: "effectiveDate is required" });
	if (!config.company.name) issues.push({ level: "error", message: "company.name is required" });
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

	// GDPR / UK-GDPR checks
	if (config.jurisdictions.includes("eu") || config.jurisdictions.includes("uk")) {
		const basisArray = Array.isArray(config.legalBasis) ? config.legalBasis : [config.legalBasis];
		if (basisArray.length === 0 || (basisArray.length === 1 && !basisArray[0]))
			issues.push({
				level: "error",
				message: "GDPR and UK-GDPR require a legalBasis",
			});
	}

	// children config sanity
	if (config.children) {
		if (config.children.underAge <= 0) {
			issues.push({
				level: "error",
				message: "children.underAge must be a positive number",
			});
		}
	}

	return issues;
}
