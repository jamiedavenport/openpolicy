import type { PolicySection, PrivacyPolicyConfig } from "../../types";

export function buildDataCollected(config: PrivacyPolicyConfig): PolicySection {
	const entries = Object.entries(config.dataCollected);
	const lines = entries.map(([category, items]) => {
		const itemList = items.map((item) => `  - ${item}`).join("\n");
		return `**${category}:**\n${itemList}`;
	});

	return {
		id: "data-collected",
		title: "Information We Collect",
		body: `We collect the following categories of information:\n\n${lines.join("\n\n")}`,
	};
}
