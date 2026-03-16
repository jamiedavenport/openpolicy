import type {
	CookiePolicyConfig,
	OpenPolicyConfig,
	PolicySection,
} from "@openpolicy/core";

export interface UseCookiePolicyResult {
	sections: PolicySection[];
}

// TODO: accept SectionOptions once exported from @openpolicy/core
export function useCookiePolicy(
	_config?: OpenPolicyConfig | CookiePolicyConfig,
	_options?: unknown,
): UseCookiePolicyResult {
	return { sections: [] };
}
