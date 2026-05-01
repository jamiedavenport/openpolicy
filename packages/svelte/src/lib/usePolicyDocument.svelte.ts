import {
	compile,
	type CookiePolicyConfig,
	type Document,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	type PolicyType,
	type PrivacyPolicyConfig,
} from "@openpolicy/core";
import { getConfigContext } from "./context.svelte";

type ConfigInput = OpenPolicyConfig | PrivacyPolicyConfig | CookiePolicyConfig | undefined;

export function compileDocument(type: PolicyType, config: ConfigInput): Document | null {
	if (!config) return null;

	if (isOpenPolicyConfig(config)) {
		const input = expandOpenPolicyConfig(config).find((i) => i.type === type);
		return input ? compile(input) : null;
	}

	return compile({ type, ...config } as Parameters<typeof compile>[0]);
}

export function resolveDocument(type: PolicyType, configProp: ConfigInput): Document | null {
	const fallback = getConfigContext();
	return compileDocument(type, configProp ?? fallback?.());
}
