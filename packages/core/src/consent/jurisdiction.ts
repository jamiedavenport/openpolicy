import { TZ_COUNTRY } from "./tz-country";
import type { Jurisdiction, JurisdictionResolver, ResolverContext } from "./types";

const EEA_COUNTRIES = new Set([
	"AT",
	"BE",
	"BG",
	"HR",
	"CY",
	"CZ",
	"DK",
	"EE",
	"FI",
	"FR",
	"DE",
	"GR",
	"HU",
	"IE",
	"IT",
	"LV",
	"LT",
	"LU",
	"MT",
	"NL",
	"PL",
	"PT",
	"RO",
	"SK",
	"SI",
	"ES",
	"SE",
	"IS",
	"LI",
	"NO",
]);

export function countryToJurisdiction(code: string | null | undefined): Jurisdiction | null {
	if (!code) return null;
	const c = code.trim().toUpperCase();
	if (c.length === 0) return null;
	if (EEA_COUNTRIES.has(c)) return "EEA";
	if (c === "GB") return "UK";
	if (c === "CH") return "CH";
	if (c === "US") return "US";
	if (c === "BR") return "BR";
	if (c === "CA") return "CA";
	if (c === "AU") return "AU";
	return "ROW";
}

const HEADER_NAMES = ["cf-ipcountry", "x-vercel-ip-country", "x-country"] as const;

function headersOf(req: ResolverContext | undefined): Headers | null {
	if (!req) return null;
	const h = (req as { headers?: Headers }).headers;
	return h ?? null;
}

export function headerResolver(): JurisdictionResolver {
	return {
		resolve(req) {
			const headers = headersOf(req);
			if (!headers) return null;
			for (const name of HEADER_NAMES) {
				const value = headers.get(name);
				if (value) return countryToJurisdiction(value);
			}
			return null;
		},
	};
}

export function timezoneResolver(): JurisdictionResolver {
	return {
		resolve() {
			if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat !== "function") return null;
			let zone: string | undefined;
			try {
				zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch {
				return null;
			}
			if (!zone) return null;
			const country = TZ_COUNTRY[zone];
			if (!country) return null;
			return countryToJurisdiction(country);
		},
	};
}

export function manualResolver(jurisdiction: Jurisdiction | null): JurisdictionResolver {
	return {
		resolve() {
			return jurisdiction;
		},
	};
}

type GeoResponse = { country?: string; region?: string };

export function clientGeoResolver(opts: {
	endpoint: string;
	fetch?: typeof fetch;
}): JurisdictionResolver {
	const fetchImpl = opts.fetch ?? fetch;
	return {
		async resolve() {
			try {
				const res = await fetchImpl(opts.endpoint);
				if (!res.ok) return null;
				const body = (await res.json()) as GeoResponse;
				const base = countryToJurisdiction(body.country);
				if (base === "US" && body.region) {
					return `US-${body.region.trim().toUpperCase()}` as Jurisdiction;
				}
				return base;
			} catch {
				return null;
			}
		},
	};
}
