import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
} from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/cookie-banner")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showPreferences, setShowPreferences] = useState(false);
	const { consent, status, reset } = useCookieConsent();

	return (
		<div className="p-8 max-w-2xl mx-auto space-y-8">
			<h1 className="text-2xl font-bold">Cookie Banner Example</h1>
			<p className="text-muted-foreground">
				This page demonstrates the <code>CookieBanner</code>,{" "}
				<code>CookiePreferencePanel</code>, and <code>useCookieConsent</code>{" "}
				hook.
			</p>

			{/* Current consent state */}
			<div className="rounded border p-4 space-y-2">
				<h2 className="font-semibold">Consent Status</h2>
				<p>
					Status: <code>{status}</code>
				</p>
				{consent && (
					<pre className="text-xs bg-muted p-2 rounded">
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

			{/* Default unstyled banner */}
			<CookieBanner onCustomize={() => setShowPreferences(true)} />

			{/* Preference panel */}
			<CookiePreferencePanel
				open={showPreferences}
				onClose={() => setShowPreferences(false)}
			/>

			<hr />

			{/* Render-prop example with custom styling */}
			<h2 className="font-semibold">Custom Render Prop Banner</h2>
			<CookieBanner>
				{({ accept, reject }) => (
					<div className="rounded-lg border bg-card p-6 shadow-sm">
						<p className="mb-4 text-sm">
							We use cookies for analytics. Do you accept?
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
								onClick={accept}
							>
								Accept All
							</button>
							<button
								type="button"
								className="rounded border px-4 py-2 text-sm"
								onClick={reject}
							>
								Reject All
							</button>
						</div>
					</div>
				)}
			</CookieBanner>
		</div>
	);
}
