import { useCookies } from "@openpolicy/react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
	const { route, setRoute, acceptAll, acceptNecessary } = useCookies();

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
				<Button variant="outline" className="mr-auto" onClick={() => setRoute("preferences")}>
					Manage Cookies
				</Button>
				<Button variant="outline" onClick={acceptNecessary}>
					Necessary Only
				</Button>
				<Button onClick={acceptAll}>Accept All</Button>
			</CardFooter>
		</Card>
	);
}

export function CookiePreferences() {
	const { route, setRoute, categories, toggle, save, acceptNecessary } = useCookies();

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
					{categories.map(({ key, enabled, locked }) => (
						<Field key={key} orientation="horizontal">
							<FieldTitle className="capitalize">{key}</FieldTitle>
							<Switch checked={enabled} disabled={locked} onCheckedChange={() => toggle(key)} />
						</Field>
					))}
				</FieldGroup>

				<DialogFooter>
					<Button variant="outline" onClick={acceptNecessary}>
						Reject all
					</Button>
					<Button onClick={() => save()}>Save preferences</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
