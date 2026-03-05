import type { PolicySection, TermsOfServiceConfig } from "../../types";

export function buildAvailability(
	config: TermsOfServiceConfig,
): PolicySection | null {
	if (!config.availability) return null;

	const lines: string[] = [];

	if (config.availability.noUptimeGuarantee) {
		lines.push(
			"We do not guarantee that our services will be available at all times. Our services may be subject to interruptions, delays, or errors.",
		);
	}

	if (config.availability.maintenanceWindows) {
		lines.push(`**Maintenance:** ${config.availability.maintenanceWindows}`);
	}

	return {
		id: "tos-availability",
		title: "Service Availability",
		body: lines.join("\n\n"),
	};
}
