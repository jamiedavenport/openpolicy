import type { TermsOfServiceConfig, ValidationIssue } from "./types";

export function validateTermsOfService(
	config: TermsOfServiceConfig,
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
	if (!config.governingLaw.jurisdiction)
		issues.push({
			level: "error",
			message: "governingLaw.jurisdiction is required",
		});

	// Advisory checks
	if (!config.disclaimers) {
		issues.push({
			level: "warning",
			message:
				"disclaimers is missing — consider adding a disclaimer of warranties",
		});
	}
	if (!config.limitationOfLiability) {
		issues.push({
			level: "warning",
			message:
				"limitationOfLiability is missing — consider adding a limitation of liability clause",
		});
	}
	if (config.acceptance.methods.length === 0) {
		issues.push({
			level: "warning",
			message:
				"acceptance.methods is empty — consider listing how users accept these Terms",
		});
	}

	return issues;
}
