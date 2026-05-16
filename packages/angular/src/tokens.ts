import { InjectionToken } from "@angular/core";
import type { ConsentStore } from "@openpolicy/core/consent";

export const OPEN_COOKIES_STORE = new InjectionToken<ConsentStore>("OPEN_COOKIES_STORE");
