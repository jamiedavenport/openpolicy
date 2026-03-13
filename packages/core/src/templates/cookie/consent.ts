import type { CookiePolicyConfig, PolicySection } from "../../types";

export function buildConsent(config: CookiePolicyConfig): PolicySection | null {
	if (!config.consentMechanism) return null;

	const mechanisms: string[] = [];

	if (config.consentMechanism.hasBanner) {
		mechanisms.push(
			"A **cookie consent banner** displayed on your first visit, where you can accept or decline non-essential cookies",
		);
	}
	if (config.consentMechanism.hasPreferencePanel) {
		mechanisms.push(
			"A **preference panel** where you can manage individual cookie categories",
		);
	}
	if (config.consentMechanism.canWithdraw) {
		mechanisms.push(
			"The ability to **withdraw your consent** at any time by updating your cookie preferences",
		);
	}

	const list =
		mechanisms.length > 0
			? `\n\nWe provide the following consent controls:\n\n${mechanisms.map((m) => `- ${m}`).join("\n")}`
			: "";

	return {
		id: "consent",
		title: "User Consent",
		body: `Where required by law, we will request your consent before placing non-essential cookies on your device.${list}

Essential cookies do not require your consent as they are strictly necessary for the operation of our service.`,
	};
}
