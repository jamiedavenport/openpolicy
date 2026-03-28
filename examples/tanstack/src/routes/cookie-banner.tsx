import {
	CookieBanner,
	CookiePreferencePanel,
	useCookieConsent,
	useCookieRoute,
} from "@openpolicy/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldTitle } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/cookie-banner")({
	component: RouteComponent,
});

function CookieBannerDemo() {
	const { route, setRoute } = useCookieRoute();

	return (
		<>
			<CookieBanner.Card asChild>
				<Card className="fixed bottom-4 right-4 z-50 w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 outline-none">
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

			<Dialog
				open={route === "preferences"}
				onOpenChange={(open) => !open && setRoute("closed")}
			>
				<DialogContent>
					<CookiePreferencePanel.Card>
						<DialogHeader>
							<DialogTitle>Cookie preferences</DialogTitle>
							<DialogDescription>
								We use cookies to improve your experience and analyse site
								traffic.
							</DialogDescription>
						</DialogHeader>

						<FieldGroup>
							{["essential", "analytics", "functional", "marketing"].map(
								(key) => (
									<CookiePreferencePanel.Category key={key} name={key}>
										{({ checked, onCheckedChange }) => (
											<Field orientation="horizontal">
												<FieldTitle className="capitalize">{key}</FieldTitle>
												<Switch
													checked={checked}
													disabled={key === "essential"}
													onCheckedChange={onCheckedChange}
												/>
											</Field>
										)}
									</CookiePreferencePanel.Category>
								),
							)}
						</FieldGroup>

						<DialogFooter>
							<CookiePreferencePanel.RejectAllButton asChild>
								<Button variant="outline">Reject all</Button>
							</CookiePreferencePanel.RejectAllButton>
							<CookiePreferencePanel.SaveButton asChild>
								<Button>Save preferences</Button>
							</CookiePreferencePanel.SaveButton>
						</DialogFooter>
					</CookiePreferencePanel.Card>
				</DialogContent>
			</Dialog>
		</>
	);
}

function RouteComponent() {
	const { status, reset } = useCookieConsent();

	return (
		<div className="p-8 max-w-xl mx-auto">
			<h1 className="text-2xl font-bold mb-2">Cookie Banner</h1>
			<p className="text-muted-foreground mb-6">
				Demonstrates the composable cookie consent UI built with shadcn/ui.
				Click <strong>Manage Cookies</strong> inside the banner to open the
				preference panel.
			</p>

			<Card className="mb-4">
				<CardHeader>
					<CardTitle>Current consent status</CardTitle>
					<CardDescription>
						Stored in the <code>op_consent</code> cookie.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<code
						className="bg-muted px-2 py-1 rounded text-sm"
						data-testid="consent-status"
					>
						{status}
					</code>
				</CardFooter>
			</Card>

			<Button variant="outline" onClick={reset} data-testid="reset-consent">
				Reset consent (show banner again)
			</Button>

			<CookieBannerDemo />
		</div>
	);
}
