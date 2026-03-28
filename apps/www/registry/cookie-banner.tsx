import {
	CookieBanner as CookieBannerPrimitive,
	CookiePreferencePanel,
	useCookieRoute,
} from "@openpolicy/react";
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
import { cn } from "@/lib/utils";

export function CookieBanner() {
	const { route } = useCookieRoute();

	if (route !== "cookie") return null;

	return (
		<Card
			className={cn(
				"fixed bottom-4 right-4 z-50 w-lg animate-in fade-in-0 zoom-in-95 outline-none",
			)}
		>
			<CardHeader>
				<CardTitle>We value your privacy</CardTitle>
				<CardDescription>
					We use cookies to improve your experience and analyse site traffic.
				</CardDescription>
			</CardHeader>

			<CardFooter className="gap-2">
				<CookieBannerPrimitive.CustomizeButton asChild>
					<Button variant="outline" className="mr-auto">
						Manage Cookies
					</Button>
				</CookieBannerPrimitive.CustomizeButton>
				<CookieBannerPrimitive.RejectButton asChild>
					<Button variant="outline">Necessary Only</Button>
				</CookieBannerPrimitive.RejectButton>
				<CookieBannerPrimitive.AcceptButton asChild>
					<Button>Accept All</Button>
				</CookieBannerPrimitive.AcceptButton>
			</CardFooter>
		</Card>
	);
}

export function CookiePreferences() {
	const { route, setRoute } = useCookieRoute();

	return (
		<Dialog
			open={route === "preferences"}
			onOpenChange={(open: boolean) => !open && setRoute("closed")}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cookie preferences</DialogTitle>
					<DialogDescription>
						We use cookies to improve your experience and analyse site traffic.
					</DialogDescription>
				</DialogHeader>

				<FieldGroup>
					{["essential", "analytics", "functional", "marketing"].map((key) => (
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
					))}
				</FieldGroup>

				<DialogFooter>
					<CookiePreferencePanel.RejectAllButton asChild>
						<Button variant="outline">Reject all</Button>
					</CookiePreferencePanel.RejectAllButton>
					<CookiePreferencePanel.SaveButton asChild>
						<Button>Save preferences</Button>
					</CookiePreferencePanel.SaveButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
