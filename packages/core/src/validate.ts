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
	if (!config.company.contact?.email)
		issues.push({
			code: "company-contact-required",
			level: "error",
			message: "company.contact.email is required",
		});
	const { collected, context } = config.data;
	if (Object.keys(collected).length === 0)
		issues.push({
			code: "data-collected-required",
			level: "error",
			message: "data.collected must have at least one entry",
		});
	for (const category of Object.keys(collected)) {
		const entry = context[category];
		if (entry === undefined) {
			issues.push({
				code: "data-context-missing",
				level: "error",
				message: `data.context["${category}"] is missing — every collected category requires a context entry (purpose, lawful basis, retention, provision).`,
			});
			continue;
		}
		if (entry.purpose === undefined) {
			issues.push({
				code: "data-purpose-missing",
				level: "error",
				message: `data.context["${category}"].purpose is missing — every collected category requires a processing purpose (GDPR Art. 13(1)(c))`,
			});
		} else if (entry.purpose.trim().length === 0) {
			issues.push({
				code: "data-purpose-empty",
				level: "error",
				message: `data.context["${category}"].purpose must be a non-empty string`,
			});
		}
	}
	for (const category of Object.keys(context)) {
		if (!(category in collected)) {
			issues.push({
				code: "data-context-orphan",
				level: "error",
				message: `data.context["${category}"] has no matching entry in data.collected — remove it or declare the collected fields`,
			});
		}
	}

	// GDPR / UK-GDPR Art. 13(1)(c): lawful basis must be stated for each
	// distinct processing purpose. Every collected category needs a basis
	// in its context entry.
	if (config.jurisdictions.includes("eu") || config.jurisdictions.includes("uk")) {
		for (const category of Object.keys(collected)) {
			const basis = context[category]?.lawfulBasis;
			if (!basis) {
				issues.push({
					code: "lawful-basis-incomplete",
					level: "error",
					message: `GDPR Article 13(1)(c): data.context["${category}"].lawfulBasis is missing — every collected category requires an Article 6 lawful basis.`,
				});
			}
		}

		// GDPR / UK-GDPR Art. 13(2)(e): for each collected category, disclose
		// whether provision is statutory, contractual, a contract-prerequisite,
		// or voluntary, and the consequences of failure to provide it.
		for (const category of Object.keys(collected)) {
			const pr = context[category]?.provision;
			if (!pr || !pr.basis) {
				issues.push({
					code: "statutory-contractual-obligation",
					level: "error",
					message: `GDPR Article 13(2)(e): data.context["${category}"].provision is missing — disclose whether provision is statutory, contractual, a contract-prerequisite, or voluntary, and the consequences of failure to provide it.`,
				});
			} else if (typeof pr.consequences !== "string" || pr.consequences.trim().length === 0) {
				issues.push({
					code: "statutory-contractual-obligation",
					level: "error",
					message: `GDPR Article 13(2)(e): data.context["${category}"].provision.consequences is empty — state the consequences of failure to provide this data.`,
				});
			}
		}
	}

	// Retention must be declared for every collected category.
	for (const category of Object.keys(collected)) {
		const period = context[category]?.retention;
		if (period === undefined || period.trim().length === 0) {
			issues.push({
				code: "retention-incomplete",
				level: "error",
				message: `data.context["${category}"].retention is missing — declare a retention period for every collected category.`,
			});
		}
	}

	// GDPR / UK-GDPR Art. 13(2)(f): controllers must disclose whether
	// automated decision-making (including profiling per Art. 22) is used —
	// even an explicit "we don't" is required. Warning, not error: the rule
	// reads "where applicable," but the external validator (and best practice)
	// wants a positive declaration either way.
	if (
		(config.jurisdictions.includes("eu") || config.jurisdictions.includes("uk")) &&
		config.automatedDecisionMaking === undefined
	) {
		issues.push({
			code: "automated-decision-making",
			level: "warning",
			message:
				"GDPR Article 13(2)(f) requires disclosure of whether automated decision-making (including profiling under Article 22) is used. Set `automatedDecisionMaking: []` to declare none, or list each activity with its logic and significance.",
		});
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
