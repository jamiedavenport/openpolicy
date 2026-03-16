import type {
	OpenPolicyConfig,
	PolicySection,
	PrivacyPolicyConfig,
} from "@openpolicy/core";

export interface UsePrivacyPolicyResult {
	sections: PolicySection[];
}

// TODO: accept SectionOptions once exported from @openpolicy/core
export function usePrivacyPolicy(
	_config?: OpenPolicyConfig | PrivacyPolicyConfig,
	_options?: unknown,
): UsePrivacyPolicyResult {
	return { sections: [] };
}
