import type { OpenPolicyConfig } from "@openpolicy/core";
import { createContext, type ReactNode } from "react";

type OpenPolicyContextValue = {
	config: OpenPolicyConfig | null;
};

export const OpenPolicyContext = createContext<OpenPolicyContextValue>({
	config: null,
});

type OpenPolicyProviderProps = {
	config: OpenPolicyConfig;
	children?: ReactNode;
};

export function OpenPolicyProvider({ config, children }: OpenPolicyProviderProps) {
	return <OpenPolicyContext.Provider value={{ config }}>{children}</OpenPolicyContext.Provider>;
}
