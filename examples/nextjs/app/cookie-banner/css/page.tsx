"use client";

import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
} from "@openpolicy/react";
import { useState } from "react";

export default function CssCookieBannerPage() {
	const [showPreferences, setShowPreferences] = useState(false);
	const { consent, status, reset } = useCookieConsent();

	return (
		<main>
			<style>{`
        [data-op-cookie-banner-root][data-state="closed"] {
          display: none;
        }
        [data-op-cookie-banner-root][data-state="open"] {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 1rem;
          animation: op-slide-up 0.25s ease;
        }
        @keyframes op-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        [data-op-cookie-banner-card] {
          max-width: 42rem;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        [data-op-cookie-banner-title] {
          font-weight: 600;
          font-size: 1rem;
          margin: 0 0 0.25rem;
        }
        [data-op-cookie-banner-description] {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1rem;
        }
        [data-op-cookie-banner-footer] {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        [data-op-cookie-banner-reject],
        [data-op-cookie-banner-customize],
        [data-op-cookie-banner-accept] {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid #d1d5db;
          background: #fff;
        }
        [data-op-cookie-banner-accept] {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        [data-op-cookie-banner-accept]:hover { background: #1f2937; }
        [data-op-cookie-banner-reject]:hover,
        [data-op-cookie-banner-customize]:hover { background: #f9fafb; }

        /* Preference panel */
        [data-op-cookie-preferences-root][data-state="closed"] {
          display: none;
        }
        [data-op-cookie-preferences-root][data-state="open"] {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: op-fade-in 0.2s ease;
        }
        @keyframes op-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        [data-op-cookie-preferences-overlay] {
          position: absolute;
          inset: 0;
          background: rgb(0 0 0 / 0.5);
        }
        [data-op-cookie-preferences-card] {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 28rem;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        [data-op-cookie-preferences-title] {
          font-weight: 600;
          font-size: 1rem;
          margin: 0 0 1.25rem;
        }
        [data-op-cookie-preferences-footer] {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        [data-op-cookie-preferences-reject-all],
        [data-op-cookie-preferences-save] {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid #d1d5db;
          background: #fff;
        }
        [data-op-cookie-preferences-save] {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        [data-op-cookie-preferences-save]:hover { background: #1f2937; }
        [data-op-cookie-preferences-reject-all]:hover { background: #f9fafb; }
      `}</style>

			<h1 className="text-2xl font-bold mb-2">CSS Banner</h1>
			<p className="text-gray-500 mb-4">
				All styling via a <code>&lt;style&gt;</code> block targeting{" "}
				<code>data-state</code> and <code>data-op-*</code> attributes — no
				Tailwind required.
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

			{/* Banner — styled entirely via the <style> block above */}
			<CookieBanner.Root scrollLock trapFocus>
				<CookieBanner.Card>
					<CookieBanner.Header>
						<CookieBanner.Title>Cookie preferences</CookieBanner.Title>
						<CookieBanner.Description>
							We use cookies to improve your experience. See our{" "}
							<a href="/cookie-policy">cookie policy</a>.
						</CookieBanner.Description>
					</CookieBanner.Header>
					<CookieBanner.Footer>
						<CookieBanner.RejectButton />
						<CookieBanner.CustomizeButton
							onClick={() => setShowPreferences(true)}
						/>
						<CookieBanner.AcceptButton />
					</CookieBanner.Footer>
				</CookieBanner.Card>
			</CookieBanner.Root>

			{/* Preference panel */}
			<CookiePreferencePanel.Root
				open={showPreferences}
				onOpenChange={setShowPreferences}
				scrollLock
				trapFocus
			>
				<CookiePreferencePanel.Overlay />
				<CookiePreferencePanel.Card>
					<CookiePreferencePanel.Header>
						<CookiePreferencePanel.Title>
							Manage cookie preferences
						</CookiePreferencePanel.Title>
					</CookiePreferencePanel.Header>
					<CookiePreferencePanel.CategoryList>
						{["essential", "analytics", "functional", "marketing"].map(
							(key) => (
								<CookiePreferencePanel.Category key={key} name={key}>
									{({ checked, onCheckedChange }) => (
										<label
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												padding: "0.5rem 0",
												borderBottom: "1px solid #f3f4f6",
											}}
										>
											<span
												style={{
													fontSize: "0.875rem",
													textTransform: "capitalize",
												}}
											>
												{key}
											</span>
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
					<CookiePreferencePanel.Footer>
						<CookiePreferencePanel.RejectAllButton />
						<CookiePreferencePanel.SaveButton />
					</CookiePreferencePanel.Footer>
				</CookiePreferencePanel.Card>
			</CookiePreferencePanel.Root>
		</main>
	);
}
