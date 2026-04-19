import { shouldEmit } from "./index";
import type {
	OpenPolicyConfig,
	PolicyCategory,
	ValidationIssue,
} from "./types";

const PRIVACY_REQUIRED = "dataCollected";

export function validateOpenPolicyConfig(
	config: OpenPolicyConfig,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (!config.effectiveDate)
		issues.push({ level: "error", message: "effectiveDate is required" });
	if (!config.company?.name)
		issues.push({ level: "error", message: "company.name is required" });
	if (!config.company?.legalName)
		issues.push({ level: "error", message: "company.legalName is required" });
	if (!config.company?.address)
		issues.push({ level: "error", message: "company.address is required" });
	if (!config.company?.contact)
		issues.push({ level: "error", message: "company.contact is required" });
	if (!config.jurisdictions || config.jurisdictions.length === 0)
		issues.push({
			level: "error",
			message: "jurisdictions must have at least one entry",
		});

	const wantPrivacy = shouldEmit("privacy", config);
	const wantCookie = shouldEmit("cookie", config);

	if (!wantPrivacy && !wantCookie) {
		issues.push({
			level: "error",
			message:
				"Config must produce at least one policy — provide data-handling fields (dataCollected, legalBasis, retention, userRights, children) or cookies",
		});
	}

	if (config.policies) {
		for (const category of config.policies) {
			if (category === "privacy" && !hasAnyPrivacyField(config)) {
				issues.push({
					level: "error",
					message:
						'policies includes "privacy" but no data-handling fields are set — add dataCollected, legalBasis, retention, userRights, or children',
				});
			}
			if (category === "cookie" && !config.cookies) {
				issues.push({
					level: "error",
					message: 'policies includes "cookie" but cookies is not set',
				});
			}
		}
	}

	if (wantPrivacy && !config.dataCollected) {
		issues.push({
			level: "warning",
			message: `${PRIVACY_REQUIRED} is not set — the privacy policy will render a placeholder section`,
		});
	}

	return issues;
}

function hasAnyPrivacyField(config: OpenPolicyConfig): boolean {
	return (
		config.dataCollected !== undefined ||
		config.legalBasis !== undefined ||
		config.retention !== undefined ||
		config.userRights !== undefined ||
		config.children !== undefined
	);
}

export type { PolicyCategory };
