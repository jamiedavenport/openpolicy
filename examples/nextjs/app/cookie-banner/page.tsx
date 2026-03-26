"use client";

import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
} from "@openpolicy/react";
import { useState } from "react";

export default function CookieBannerPage() {
	const [showPreferences, setShowPreferences] = useState(false);
	const { consent, status, reset } = useCookieConsent();

	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">Cookie Banner</h1>
			<p className="text-gray-500 mb-4">
				Demonstrates <code>CookieBanner</code>,{" "}
				<code>CookiePreferencePanel</code>, and <code>useCookieConsent</code>.
			</p>

			<div className="border rounded p-4 mb-6 space-y-2">
				<h2 className="font-semibold">Consent Status</h2>
				<p>
					Status: <code>{status}</code>
				</p>
				{consent && (
					<pre className="text-xs bg-gray-100 p-2 rounded">
						{JSON.stringify(consent, null, 2)}
					</pre>
				)}
				{status !== "undecided" && (
					<button
						type="button"
						className="text-sm text-blue-600 underline"
						onClick={reset}
					>
						Reset consent
					</button>
				)}
			</div>

			<CookieBanner onCustomize={() => setShowPreferences(true)} />

			<CookiePreferencePanel
				open={showPreferences}
				onClose={() => setShowPreferences(false)}
			/>
		</main>
	);
}
