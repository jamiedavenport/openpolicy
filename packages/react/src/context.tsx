import type { OpenPolicyConfig } from "@openpolicy/core";
import { createContext, type ReactNode } from "react";

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
		<OpenPolicyContext.Provider value={{ config }}>
			{children}
		</OpenPolicyContext.Provider>
	);
}
