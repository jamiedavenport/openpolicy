export { compilePrivacyPolicy } from "./privacy";
export { compileTermsOfService } from "./terms";
export type {
	CompileOptions,
	DisputeResolutionMethod,
	Jurisdiction,
	OutputFormat,
	PolicyInput,
	PolicySection,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
	ValidationIssue,
} from "./types";
export { validatePrivacyPolicy } from "./validate";
export { validateTermsOfService } from "./validate-terms";

import { compilePrivacyPolicy } from "./privacy";
import { compileTermsOfService } from "./terms";
import type { CompileOptions, PolicyInput } from "./types";

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
