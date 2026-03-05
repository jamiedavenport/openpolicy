export function detectType(
	explicitType: string | undefined,
	configPath: string,
): "privacy" | "terms" {
	if (explicitType === "privacy" || explicitType === "terms") {
		return explicitType;
	}
	return configPath.toLowerCase().includes("terms") ? "terms" : "privacy";
}
