import {
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
	type PrivacyPolicyConfig,
} from "@openpolicy/core";
import { useContext } from "react";
import { OpenPolicyContext } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";
import { DefaultRoot } from "./defaults";

type PrivacyPolicyProps = {
	config?: OpenPolicyConfig | PrivacyPolicyConfig;
	components?: PolicyComponents;
	style?: unknown;
};

export function PrivacyPolicy({ config: configProp, components, style }: PrivacyPolicyProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const config = configProp ?? contextConfig ?? undefined;
	if (!config) return null;
	const input = isOpenPolicyConfig(config)
		? expandOpenPolicyConfig(config).find((i) => i.type === "privacy")
		: { type: "privacy" as const, ...config };
	if (!input) return null;
	const doc = compile(input);
	const Root = components?.Root ?? DefaultRoot;
	return <Root style={style}>{renderDocument(doc, components)}</Root>;
}
