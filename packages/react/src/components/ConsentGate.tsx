import type { ReactNode } from "react";
import type { HasExpression } from "../context";
import { useCookieConsent } from "../context";

interface ConsentGateProps {
	requires: HasExpression;
	fallback?: ReactNode;
	children: ReactNode;
}

export function ConsentGate({
	requires,
	fallback = null,
	children,
}: ConsentGateProps) {
	const { has } = useCookieConsent();
	return has(requires) ? children : fallback;
}
