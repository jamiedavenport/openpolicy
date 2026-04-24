import type { ReactNode } from "react";
import type { HasExpression } from "../context";
import { useCookies } from "../hooks/useCookies";

interface ConsentGateProps {
	requires: HasExpression;
	fallback?: ReactNode;
	children: ReactNode;
}

export function ConsentGate({ requires, fallback = null, children }: ConsentGateProps) {
	const { has } = useCookies();
	return has(requires) ? children : fallback;
}
