import type { OpenPolicyConfig } from "@openpolicy/core";
import { getContext, setContext } from "svelte";
import type { PolicyOverrides } from "./types";

const CONFIG_KEY = Symbol("openpolicy.config");
const OVERRIDES_KEY = Symbol("openpolicy.overrides");

export type ConfigGetter = () => OpenPolicyConfig | undefined;

export function setConfigContext(getter: ConfigGetter): void {
	setContext(CONFIG_KEY, getter);
}

export function getConfigContext(): ConfigGetter | undefined {
	return getContext<ConfigGetter | undefined>(CONFIG_KEY);
}

export function setOverridesContext(getter: () => PolicyOverrides): void {
	setContext(OVERRIDES_KEY, getter);
}

export function getOverridesContext(): () => PolicyOverrides {
	return getContext<(() => PolicyOverrides) | undefined>(OVERRIDES_KEY) ?? (() => ({}));
}
