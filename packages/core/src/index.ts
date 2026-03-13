export { compilePrivacyPolicy } from "./privacy";
export { compileTermsOfService } from "./terms";
export type {
	CompanyConfig,
	CompileOptions,
	DisputeResolutionMethod,
	Jurisdiction,
	OpenPolicyConfig,
	OutputFormat,
	PolicyInput,
	PolicySection,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
	ValidationIssue,
} from "./types";
export { isOpenPolicyConfig } from "./types";
export { validatePrivacyPolicy } from "./validate";
export { validateTermsOfService } from "./validate-terms";

import { compilePrivacyPolicy } from "./privacy";
import { compileTermsOfService } from "./terms";
import type { CompileOptions, OpenPolicyConfig, PolicyInput } from "./types";

export function expandOpenPolicyConfig(
	config: OpenPolicyConfig,
): PolicyInput[] {
	const inputs: PolicyInput[] = [];
	if (config.privacy) {
		inputs.push({
			type: "privacy",
			company: config.company,
			...config.privacy,
		});
	}
	if (config.terms) {
		inputs.push({ type: "terms", company: config.company, ...config.terms });
	}
	return inputs;
}

export function compilePolicy(input: PolicyInput, options?: CompileOptions) {
	switch (input.type) {
		case "privacy": {
			const { type: _, ...config } = input;
			return compilePrivacyPolicy(config, options);
		}
		case "terms": {
			const { type: _, ...config } = input;
			return compileTermsOfService(config, options);
		}
	}
}
