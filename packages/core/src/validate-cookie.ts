import type { CookiePolicyConfig, ValidationIssue } from "./types";

export function validateCookiePolicy(config: CookiePolicyConfig): ValidationIssue[] {
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

	const used = config.cookies.used;
	const enabledKeys = Object.entries(used)
		.filter(([, enabled]) => enabled)
		.map(([key]) => key);
	if (enabledKeys.length === 0) {
		issues.push({
			code: "cookies-empty",
			level: "error",
			message:
				"At least one cookie type must be enabled (essential, analytics, functional, or marketing)",
		});
	}
	for (const key of enabledKeys) {
		if (!config.cookies.context?.[key]?.lawfulBasis) {
			issues.push({
				code: "cookie-lawful-basis-missing",
				level: "error",
				message: `cookies.context["${key}"].lawfulBasis is missing — every enabled cookie category requires an Article 6 lawful basis.`,
			});
		}
	}

	// Advisory checks
	if (!config.consentMechanism) {
		issues.push({
			code: "consent-mechanism-undeclared",
			level: "warning",
			message:
				"consentMechanism is not provided — consider describing how users can manage cookie consent",
		});
	}

	// GDPR / UK-GDPR consent withdrawal check
	if (
		(config.jurisdictions.includes("eu") || config.jurisdictions.includes("uk")) &&
		config.consentMechanism &&
		!config.consentMechanism.canWithdraw
	) {
		issues.push({
			code: "consent-withdrawal-required",
			level: "warning",
			message:
				"GDPR and UK-GDPR require that users can withdraw cookie consent — consider setting consentMechanism.canWithdraw to true",
		});
	}

	return issues;
}
