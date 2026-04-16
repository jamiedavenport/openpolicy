import type { CookieConsentStatus } from "@openpolicy/core";
import { useEffect, useRef, useState } from "react";

export function useShouldShowCookieBanner(
	status: CookieConsentStatus,
	shouldShow?: () => Promise<boolean>,
): boolean {
	const [visible, setVisible] = useState(false);
	const shouldShowRef = useRef(shouldShow);

	useEffect(() => {
		if (status !== "undecided") {
			setVisible(false);
			return;
		}
		let cancelled = false;
		const check = shouldShowRef.current ?? (() => Promise.resolve(true));
		check().then((show) => {
			if (!cancelled) setVisible(show);
		});
		return () => {
			cancelled = true;
		};
	}, [status]);

	if (status !== "undecided") return false;
	return visible;
}
