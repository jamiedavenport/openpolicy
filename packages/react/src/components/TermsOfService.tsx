import {
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	type TermsOfServiceConfig,
} from "@openpolicy/core";
import { type CSSProperties, useContext } from "react";
import { OpenPolicyContext } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";

interface TermsOfServiceProps {
	config?: OpenPolicyConfig | TermsOfServiceConfig;
	components?: PolicyComponents;
	style?: CSSProperties;
}

export function TermsOfService({
	config: configProp,
	components,
	style,
}: TermsOfServiceProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const config = configProp ?? contextConfig ?? undefined;
	if (!config) return null;
	const input = isOpenPolicyConfig(config)
		? expandOpenPolicyConfig(config).find((i) => i.type === "terms")
		: { type: "terms" as const, ...config };
	if (!input) return null;
	const doc = compile(input);
	return (
		<div data-op-policy className="op-policy" style={style}>
			{renderDocument(doc, components)}
		</div>
	);
}
