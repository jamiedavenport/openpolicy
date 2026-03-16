import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/core";
import type { CSSProperties } from "react";
import { useCookiePolicy } from "../hooks/useCookiePolicy";
import type { PolicySlots } from "../types";
import { PolicySection } from "./PolicySection";

interface CookiePolicyProps {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	components?: PolicySlots;
	style?: CSSProperties;
}

export function CookiePolicy({ config, components, style }: CookiePolicyProps) {
	const { sections } = useCookiePolicy(config);

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
