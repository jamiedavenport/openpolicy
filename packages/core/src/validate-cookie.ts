import type { CookiePolicyConfig, ValidationIssue } from "./types";

export function validateCookiePolicy(
	config: CookiePolicyConfig,
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

	const { essential, analytics, functional, marketing } = config.cookies;
	if (!essential && !analytics && !functional && !marketing) {
		issues.push({
			level: "error",
			message:
				"At least one cookie type must be enabled (essential, analytics, functional, or marketing)",
		});
	}

	// Advisory checks
	if (!config.consentMechanism) {
		issues.push({
			level: "warning",
			message:
				"consentMechanism is not provided — consider describing how users can manage cookie consent",
		});
	}

	// GDPR / UK-GDPR consent withdrawal check
	if (
		(config.jurisdictions.includes("eu") ||
			config.jurisdictions.includes("uk")) &&
		config.consentMechanism &&
		!config.consentMechanism.canWithdraw
	) {
		issues.push({
			level: "warning",
			message:
				"GDPR and UK-GDPR require that users can withdraw cookie consent — consider setting consentMechanism.canWithdraw to true",
		});
	}

	return issues;
}
