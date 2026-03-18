import {
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	type PrivacyPolicyConfig,
} from "@openpolicy/core";
import { type CSSProperties, useContext } from "react";
import { OpenPolicyContext } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";

interface PrivacyPolicyProps {
	config?: OpenPolicyConfig | PrivacyPolicyConfig;
	components?: PolicyComponents;
	style?: CSSProperties;
}

export function PrivacyPolicy({
	config: configProp,
	components,
	style,
}: PrivacyPolicyProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const config = configProp ?? contextConfig ?? undefined;
	if (!config) return null;
	const input = isOpenPolicyConfig(config)
		? expandOpenPolicyConfig(config).find((i) => i.type === "privacy")
		: { type: "privacy" as const, ...config };
	if (!input) return null;
	const doc = compile(input);
	return (
		<div data-op-policy className="op-policy" style={style}>
			{renderDocument(doc, components)}
		</div>
	);
}
