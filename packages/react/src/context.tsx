import type { OpenPolicyConfig } from "@openpolicy/core";
import { createContext, type ReactNode } from "react";
import { defaultStyles } from "./styles";

interface OpenPolicyContextValue {
	config: OpenPolicyConfig | null;
}

export const OpenPolicyContext = createContext<OpenPolicyContextValue>({
	config: null,
});

interface OpenPolicyProviderProps {
	config: OpenPolicyConfig;
	children: ReactNode;
}

export function OpenPolicyProvider({
	config,
	children,
}: OpenPolicyProviderProps) {
	return (
		<>
			<style href="@openpolicy/react" precedence="default">
				{defaultStyles}
			</style>
			<OpenPolicyContext.Provider value={{ config }}>
				{children}
			</OpenPolicyContext.Provider>
		</>
	);
}
