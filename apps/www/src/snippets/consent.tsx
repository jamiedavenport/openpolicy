import { ConsentGate, CookieBanner } from "@openpolicy/react";
import { Analytics, Heatmap } from "./vendors";

export function Root() {
	return (
		<>
			<ConsentGate category="analytics">
				<Analytics />
			</ConsentGate>
			<ConsentGate category="marketing">
				<Heatmap />
			</ConsentGate>
			<CookieBanner />
		</>
	);
}
