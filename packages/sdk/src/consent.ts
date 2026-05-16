import type { OpenPolicyConfig } from "@openpolicy/core";
import type { Category, OpenCookiesConfig } from "@openpolicy/core/consent";

export type ToOpenCookiesConfigOptions = Omit<OpenCookiesConfig, "categories">;

export function toOpenCookiesConfig(
	policy: OpenPolicyConfig,
	options?: ToOpenCookiesConfigOptions,
): OpenCookiesConfig {
	const used: Record<string, boolean> = policy.cookies?.used ?? {};
	const context = policy.cookies?.context ?? {};
	const categories: Category[] = Object.keys(used)
		.filter((key) => used[key])
		.map((key) => {
			const lawfulBasis = context[key]?.lawfulBasis;
			return {
				key,
				label: key.charAt(0).toUpperCase() + key.slice(1),
				// `consent` ⇒ consent-gated (not locked). Any other lawful basis
				// ⇒ not gated. An unknown/missing basis stays gated — the bridge
				// may run on an unvalidated config (validate() flags it as
				// cookie-lawful-basis-missing); defaulting to gated is the
				// privacy-safe choice. The basis itself rides on the Category so
				// the §4.2 posture resolver and audit keep the full signal.
				locked: lawfulBasis != null && lawfulBasis !== "consent",
				...(lawfulBasis ? { lawfulBasis } : {}),
			};
		});
	const policyVersion = options?.policyVersion ?? policy.cookieVersion;
	return { ...options, ...(policyVersion ? { policyVersion } : {}), categories };
}
