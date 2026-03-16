import type { OpenPolicyConfig, PrivacyPolicyConfig } from "@openpolicy/core";
import type { CSSProperties } from "react";
import { usePrivacyPolicy } from "../hooks/usePrivacyPolicy";
import type { PolicySlots } from "../types";
import { PolicySection } from "./PolicySection";

interface PrivacyPolicyProps {
	config?: OpenPolicyConfig | PrivacyPolicyConfig;
	components?: PolicySlots;
	style?: CSSProperties;
}

export function PrivacyPolicy({
	config,
	components,
	style,
}: PrivacyPolicyProps) {
	const { sections } = usePrivacyPolicy(config);

	return (
		<div data-op-policy style={style}>
			{sections.map((section) => (
				<PolicySection
					key={section.id}
					section={section}
					components={components}
				/>
			))}
		</div>
	);
}
