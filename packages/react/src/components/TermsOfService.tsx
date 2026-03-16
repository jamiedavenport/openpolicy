import type { OpenPolicyConfig, TermsOfServiceConfig } from "@openpolicy/core";
import type { CSSProperties } from "react";
import { useTermsOfService } from "../hooks/useTermsOfService";
import type { PolicySlots } from "../types";
import { PolicySection } from "./PolicySection";

interface TermsOfServiceProps {
	config?: OpenPolicyConfig | TermsOfServiceConfig;
	components?: PolicySlots;
	style?: CSSProperties;
}

export function TermsOfService({
	config,
	components,
	style,
}: TermsOfServiceProps) {
	const { sections } = useTermsOfService(config);

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
