import {
	type CookiePolicyConfig,
	compile,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import { useContext } from "react";
import { OpenPolicyContext } from "../context";
import { renderDocument } from "../render";
import type { PolicyComponents } from "../types";
import { DefaultRoot } from "./defaults";

type CookiePolicyProps = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	components?: PolicyComponents;
	style?: unknown;
};

export function CookiePolicy({ config: configProp, components, style }: CookiePolicyProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const config = configProp ?? contextConfig ?? undefined;
	if (!config) return null;
	const input = isOpenPolicyConfig(config)
		? expandOpenPolicyConfig(config).find((i) => i.type === "cookie")
		: { type: "cookie" as const, ...config };
	if (!input) return null;
	const doc = compile(input);
	const Root = components?.Root ?? DefaultRoot;
	return <Root style={style}>{renderDocument(doc, components)}</Root>;
}
