import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
} from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/cookie-banner")({
	component: RouteComponent,
});

function CustomCookieBanner() {
	return (
		<CookieBanner.Root className="fixed bottom-4 right-4 z-50 w-lg">
			<CookieBanner.Overlay className="bg-black/50 fixed inset-0 z-40" />

			<CookieBanner.Card asChild>
				<Card className="relative z-50 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 outline-none">
					<CookieBanner.Header asChild>
						<CardHeader>
							<CookieBanner.Title asChild>
								<CardTitle>We value your privacy</CardTitle>
							</CookieBanner.Title>
							<CookieBanner.Description asChild>
								<CardDescription>
									We use cookies to improve your experience and analyse site
									traffic.
								</CardDescription>
							</CookieBanner.Description>
						</CardHeader>
					</CookieBanner.Header>

					<CookieBanner.Footer asChild>
						<CardFooter className="gap-2">
							<CookieBanner.CustomizeButton asChild>
								<Button variant="outline" className="mr-auto">
									Manage Cookies
								</Button>
							</CookieBanner.CustomizeButton>
							<CookieBanner.RejectButton asChild>
								<Button variant="outline">Necessary Only</Button>
							</CookieBanner.RejectButton>
							<CookieBanner.AcceptButton asChild>
								<Button>Accept All</Button>
							</CookieBanner.AcceptButton>
						</CardFooter>
					</CookieBanner.Footer>
				</Card>
			</CookieBanner.Card>
		</CookieBanner.Root>
	);
}

function CustomPreferencePanel() {
	const [showPreferences, setShowPreferences] = useState(false);

	return (
		<div>
			<Button onClick={() => setShowPreferences(true)}>Manage Cookies</Button>
			<CookiePreferencePanel.Root
				open={showPreferences}
				onOpenChange={setShowPreferences}
				scrollLock
				trapFocus
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
			>
				<CookiePreferencePanel.Overlay className="fixed inset-0 isolate z-40 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
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
			</CookiePreferencePanel.Root>
		</div>
	);
}

function RouteComponent() {
	const { reset } = useCookieConsent();

	return (
		<div>
			<p>Page Content!</p>
			<button type="button" onClick={reset}>
				Reset
			</button>

			<CustomCookieBanner />
			<CustomPreferencePanel />
		</div>
	);
}
