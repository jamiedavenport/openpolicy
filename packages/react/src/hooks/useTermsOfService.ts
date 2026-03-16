import type {
	OpenPolicyConfig,
	PolicySection,
	TermsOfServiceConfig,
} from "@openpolicy/core";

export interface UseTermsOfServiceResult {
	sections: PolicySection[];
}

// TODO: accept SectionOptions once exported from @openpolicy/core
export function useTermsOfService(
	_config?: OpenPolicyConfig | TermsOfServiceConfig,
	_options?: unknown,
): UseTermsOfServiceResult {
	return { sections: [] };
}
