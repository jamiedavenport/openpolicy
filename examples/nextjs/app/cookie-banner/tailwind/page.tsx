"use client";

import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
} from "@openpolicy/react";
import { useState } from "react";

export default function TailwindCookieBannerPage() {
	const [showPreferences, setShowPreferences] = useState(false);
	const { consent, status, reset } = useCookieConsent();

	return (
		<main>
			<h1 className="text-2xl font-bold mb-2">Tailwind Banner</h1>
			<p className="text-gray-500 mb-4">
				Compound components styled with Tailwind utility classes — fixed bottom
				bar, modal preference panel.
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

			{/* Compound banner — fixed bottom bar */}
			<CookieBanner.Root
				className="fixed bottom-0 inset-x-0 z-50 p-4 bg-black/10 backdrop-blur-sm"
				scrollLock
				trapFocus
				shouldShow={async () => true}
			>
				<CookieBanner.Card className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-2xl">
					<CookieBanner.Header className="mb-4">
						<CookieBanner.Title className="text-base font-semibold">
							Cookie preferences
						</CookieBanner.Title>
						<CookieBanner.Description className="text-sm text-gray-500 mt-1">
							We use cookies to improve your experience. Read our{" "}
							<a href="/cookie-policy" className="underline underline-offset-2">
								cookie policy
							</a>{" "}
							or manage your preferences below.
						</CookieBanner.Description>
					</CookieBanner.Header>
					<CookieBanner.Footer className="flex justify-end gap-2">
						<CookieBanner.RejectButton className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors" />
						<CookieBanner.CustomizeButton
							className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
							onClick={() => setShowPreferences(true)}
						/>
						<CookieBanner.AcceptButton className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors" />
					</CookieBanner.Footer>
				</CookieBanner.Card>
			</CookieBanner.Root>

			{/* Compound preference panel — centered modal */}
			<CookiePreferencePanel.Root
				open={showPreferences}
				onOpenChange={setShowPreferences}
				scrollLock
				trapFocus
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
			>
				<CookiePreferencePanel.Overlay className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
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
											<div>
												<span className="text-sm font-medium capitalize">
													{key}
												</span>
												{key === "essential" && (
													<p className="text-xs text-gray-400 mt-0.5">
														Always active
													</p>
												)}
											</div>
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
						<CookiePreferencePanel.RejectAllButton className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors" />
						<CookiePreferencePanel.SaveButton className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors" />
					</CookiePreferencePanel.Footer>
				</CookiePreferencePanel.Card>
			</CookiePreferencePanel.Root>
		</main>
	);
}
