import type { ReactNode } from "react";
import type { HasExpression } from "../hooks/useCookieConsent";
import { useCookieConsent } from "../hooks/useCookieConsent";

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
