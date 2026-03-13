export function detectType(
	explicitType: string | undefined,
	configPath: string,
): "privacy" | "terms" | "cookie" {
	if (
		explicitType === "privacy" ||
		explicitType === "terms" ||
		explicitType === "cookie"
	) {
		return explicitType;
	}
	const lower = configPath.toLowerCase();
	if (lower.includes("cookie")) return "cookie";
	if (lower.includes("terms")) return "terms";
	return "privacy";
}
