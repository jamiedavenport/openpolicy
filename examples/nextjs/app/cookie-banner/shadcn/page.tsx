"use client";

import {
	ConsentGate,
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
	useCookieRoute,
} from "@openpolicy/react";
import { Button } from "@/components/ui/button";

export default function ShadcnCookieBannerPage() {
	const { route, setRoute } = useCookieRoute();
	const { consent, status, reset } = useCookieConsent();

	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">shadcn/ui Banner</h1>
			<p className="text-gray-500 mb-4">
				Uses the <code>asChild</code> prop to delegate rendering to shadcn/ui{" "}
				<code>Button</code> variants — no wrapper divs, full variant support.
			</p>

			{/* Consent state inspector */}
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

			{/* Banner with asChild buttons */}
			<CookieBanner.Card className="fixed bottom-0 inset-x-0 z-50 p-4 mx-auto max-w-2xl rounded-xl border bg-white shadow-2xl">
				<CookieBanner.Header className="mb-4">
					<CookieBanner.Title className="text-base font-semibold">
						Cookie preferences
					</CookieBanner.Title>
					<CookieBanner.Description className="text-sm text-gray-500 mt-1">
						We use cookies to improve your experience. See our{" "}
						<a
							href="/cookie-policy"
							className="underline underline-offset-2 text-blue-600"
						>
							cookie policy
						</a>
						.
					</CookieBanner.Description>
				</CookieBanner.Header>
				<CookieBanner.Footer className="flex justify-end gap-2">
					<CookieBanner.RejectButton asChild>
						<Button variant="outline">Reject</Button>
					</CookieBanner.RejectButton>
					<CookieBanner.CustomizeButton asChild>
						<Button variant="ghost">Manage</Button>
					</CookieBanner.CustomizeButton>
					<CookieBanner.AcceptButton asChild>
						<Button>Accept all</Button>
					</CookieBanner.AcceptButton>
				</CookieBanner.Footer>
			</CookieBanner.Card>

			{/* Preference panel with asChild buttons */}
			{route === "preferences" && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setRoute("closed")}
						onKeyDown={(e) => e.key === "Escape" && setRoute("closed")}
					/>
					<CookiePreferencePanel.Card className="relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl">
						<CookiePreferencePanel.Header className="mb-5">
							<CookiePreferencePanel.Title className="text-base font-semibold">
								Manage cookie preferences
							</CookiePreferencePanel.Title>
						</CookiePreferencePanel.Header>
						<CookiePreferencePanel.CategoryList className="space-y-3 mb-6">
							{["essential", "analytics", "functional", "marketing"].map(
								(key) => (
									<CookiePreferencePanel.Category key={key} name={key}>
										{({ checked, onCheckedChange }) => (
											<label className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-gray-50 transition-colors">
												<span className="text-sm capitalize">{key}</span>
												<input
													type="checkbox"
													checked={checked}
													disabled={key === "essential"}
													onChange={(e) => onCheckedChange(e.target.checked)}
													className="h-4 w-4 accent-black disabled:opacity-50"
												/>
											</label>
										)}
									</CookiePreferencePanel.Category>
								),
							)}
						</CookiePreferencePanel.CategoryList>
						<CookiePreferencePanel.Footer className="flex justify-end gap-2">
							<CookiePreferencePanel.RejectAllButton asChild>
								<Button variant="outline">Reject all</Button>
							</CookiePreferencePanel.RejectAllButton>
							<CookiePreferencePanel.SaveButton asChild>
								<Button>Save preferences</Button>
							</CookiePreferencePanel.SaveButton>
						</CookiePreferencePanel.Footer>
					</CookiePreferencePanel.Card>
				</div>
			)}

			<div className="mt-6 border rounded p-4 space-y-2">
				<h2 className="font-semibold text-sm">ConsentGate demo</h2>
				<ConsentGate
					requires={{ or: ["functional", "analytics"] }}
					fallback={
						<p className="text-xs text-gray-500">
							Need consent to show gated UI.
						</p>
					}
				>
					<p className="text-xs text-green-700">Gated content visible.</p>
				</ConsentGate>
			</div>
		</main>
	);
}
