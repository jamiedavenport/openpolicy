import { Offstage } from "@offstage/browser";

export const offstage = new Offstage({
	apiKey: import.meta.env.PUBLIC_OFFSTAGE_KEY || "",
});
