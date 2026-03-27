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

			{/* Default banner — simplest usage */}
			<CookieBanner onCustomize={() => setShowPreferences(true)} />

			{/* Preference panel */}
			<CookiePreferencePanel
				open={showPreferences}
				onOpenChange={setShowPreferences}
			/>

			<hr className="my-8" />

			{/* Compound component example with custom styling */}
			<h2 className="font-semibold mb-4">Compound Component Banner</h2>
			<CookieBanner.Root className="fixed bottom-0 inset-x-0 p-4">
				<CookieBanner.Card className="mx-auto max-w-xl rounded-lg border bg-white p-6 shadow-lg">
					<CookieBanner.Header className="mb-3">
						<CookieBanner.Title className="font-semibold">
							Cookie preferences
						</CookieBanner.Title>
						<CookieBanner.Description className="text-sm text-gray-500">
							We use cookies to improve your experience. You can accept all or
							manage your preferences.
						</CookieBanner.Description>
					</CookieBanner.Header>
					<CookieBanner.Footer className="flex justify-end gap-2">
						<CookieBanner.RejectButton className="rounded border px-4 py-2 text-sm" />
						<CookieBanner.CustomizeButton
							className="rounded border px-4 py-2 text-sm"
							onClick={() => setShowPreferences(true)}
						/>
						<CookieBanner.AcceptButton className="rounded bg-black px-4 py-2 text-sm text-white" />
					</CookieBanner.Footer>
				</CookieBanner.Card>
			</CookieBanner.Root>

			{/* Compound component preference panel */}
			<CookiePreferencePanel.Root
				open={showPreferences}
				onOpenChange={setShowPreferences}
				className="fixed inset-0 flex items-center justify-center p-4"
			>
				<CookiePreferencePanel.Overlay className="absolute inset-0 bg-black/40" />
				<CookiePreferencePanel.Card className="relative z-10 w-full max-w-md rounded-lg border bg-white p-6 shadow-xl">
					<CookiePreferencePanel.Header className="mb-4">
						<CookiePreferencePanel.Title className="font-semibold">
							Manage cookie preferences
						</CookiePreferencePanel.Title>
					</CookiePreferencePanel.Header>
					<CookiePreferencePanel.CategoryList className="space-y-3 mb-6">
						{["essential", "analytics", "functional", "marketing"].map(
							(key) => (
								<CookiePreferencePanel.Category key={key} name={key}>
									{({ checked, onCheckedChange }) => (
										<label className="flex items-center justify-between">
											<span className="text-sm capitalize">{key}</span>
											<input
												type="checkbox"
												checked={checked}
												disabled={key === "essential"}
												onChange={(e) => onCheckedChange(e.target.checked)}
											/>
										</label>
									)}
								</CookiePreferencePanel.Category>
							),
						)}
					</CookiePreferencePanel.CategoryList>
					<CookiePreferencePanel.Footer className="flex justify-end gap-2">
						<CookiePreferencePanel.RejectAllButton className="rounded border px-4 py-2 text-sm" />
						<CookiePreferencePanel.SaveButton className="rounded bg-black px-4 py-2 text-sm text-white" />
					</CookiePreferencePanel.Footer>
				</CookiePreferencePanel.Card>
			</CookiePreferencePanel.Root>
		</main>
	);
}
