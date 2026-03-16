import {
	type CookiePolicyConfig,
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import type { CSSProperties } from "react";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";

interface CookiePolicyProps {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	components?: PolicyComponents;
	style?: CSSProperties;
}

export function CookiePolicy({ config, components, style }: CookiePolicyProps) {
	if (!config) return null;
	const input = isOpenPolicyConfig(config)
		? expandOpenPolicyConfig(config).find((i) => i.type === "cookie")
		: { type: "cookie" as const, ...config };
	if (!input) return null;
	const doc = compile(input);
	return (
		<div data-op-policy className="op-policy" style={style}>
			{renderDocument(doc, components)}
		</div>
	);
}
