import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	clientGeoResolver,
	countryToJurisdiction,
	headerResolver,
	manualResolver,
	timezoneResolver,
} from "./jurisdiction";

describe("countryToJurisdiction", () => {
	it("maps EEA member states to EEA", () => {
		for (const code of ["DE", "FR", "IT", "ES", "SE", "IS", "LI", "NO"]) {
			expect(countryToJurisdiction(code)).toBe("EEA");
		}
	});

	it("maps GB to UK and CH to CH", () => {
		expect(countryToJurisdiction("GB")).toBe("UK");
		expect(countryToJurisdiction("CH")).toBe("CH");
	});

	it("maps named jurisdictions to themselves", () => {
		expect(countryToJurisdiction("US")).toBe("US");
		expect(countryToJurisdiction("BR")).toBe("BR");
		expect(countryToJurisdiction("CA")).toBe("CA");
		expect(countryToJurisdiction("AU")).toBe("AU");
	});

	it("falls back to ROW for unknown countries", () => {
		expect(countryToJurisdiction("ZZ")).toBe("ROW");
		expect(countryToJurisdiction("JP")).toBe("ROW");
	});

	it("returns null for empty / nullish input", () => {
		expect(countryToJurisdiction(null)).toBeNull();
		expect(countryToJurisdiction(undefined)).toBeNull();
		expect(countryToJurisdiction("")).toBeNull();
		expect(countryToJurisdiction("   ")).toBeNull();
	});

	it("normalises case and whitespace", () => {
		expect(countryToJurisdiction("de")).toBe("EEA");
		expect(countryToJurisdiction(" gb ")).toBe("UK");
	});
});

describe("headerResolver", () => {
	function ctx(entries: Record<string, string>): { headers: Headers } {
		return { headers: new Headers(entries) };
	}

	it("reads cf-ipcountry (Cloudflare)", () => {
		const r = headerResolver();
		expect(r.resolve(ctx({ "cf-ipcountry": "DE" }))).toBe("EEA");
	});

	it("reads x-vercel-ip-country (Vercel)", () => {
		const r = headerResolver();
		expect(r.resolve(ctx({ "x-vercel-ip-country": "GB" }))).toBe("UK");
	});

	it("reads x-country fallback (Netlify / custom)", () => {
		const r = headerResolver();
		expect(r.resolve(ctx({ "x-country": "BR" }))).toBe("BR");
	});

	it("prefers cf-ipcountry over Vercel and x-country", () => {
		const r = headerResolver();
		const result = r.resolve(
			ctx({
				"cf-ipcountry": "DE",
				"x-vercel-ip-country": "US",
				"x-country": "BR",
			}),
		);
		expect(result).toBe("EEA");
	});

	it("falls through to Vercel when Cloudflare header is absent", () => {
		const r = headerResolver();
		const result = r.resolve(
			ctx({
				"x-vercel-ip-country": "US",
				"x-country": "BR",
			}),
		);
		expect(result).toBe("US");
	});

	it("returns null when no recognised header present", () => {
		const r = headerResolver();
		expect(r.resolve(ctx({ "x-other": "DE" }))).toBeNull();
		expect(r.resolve(ctx({}))).toBeNull();
	});

	it("returns null when no request given", () => {
		const r = headerResolver();
		expect(r.resolve()).toBeNull();
	});

	it("accepts a raw Request", () => {
		const r = headerResolver();
		const req = new Request("https://example.com", {
			headers: { "cf-ipcountry": "FR" },
		});
		expect(r.resolve(req)).toBe("EEA");
	});

	it("maps unknown country to ROW", () => {
		const r = headerResolver();
		expect(r.resolve(ctx({ "cf-ipcountry": "ZZ" }))).toBe("ROW");
	});
});

describe("manualResolver", () => {
	it("returns the configured jurisdiction", () => {
		expect(manualResolver("EEA").resolve()).toBe("EEA");
		expect(manualResolver("US-CA").resolve()).toBe("US-CA");
		expect(manualResolver(null).resolve()).toBeNull();
	});

	it("ignores the request argument", () => {
		const r = manualResolver("UK");
		const req = new Request("https://example.com", {
			headers: { "cf-ipcountry": "US" },
		});
		expect(r.resolve(req)).toBe("UK");
	});
});

describe("timezoneResolver", () => {
	const realDateTimeFormat = Intl.DateTimeFormat;

	function stubZone(zone: string | undefined): void {
		function FakeDTF(): Intl.DateTimeFormat {
			return { resolvedOptions: () => ({ timeZone: zone }) } as unknown as Intl.DateTimeFormat;
		}
		Object.assign(FakeDTF, realDateTimeFormat);
		Intl.DateTimeFormat = FakeDTF as unknown as typeof Intl.DateTimeFormat;
	}

	afterEach(() => {
		Intl.DateTimeFormat = realDateTimeFormat;
	});

	it("maps an EEA zone to EEA", () => {
		stubZone("Europe/Berlin");
		expect(timezoneResolver().resolve()).toBe("EEA");
	});

	it("maps Europe/London to UK", () => {
		stubZone("Europe/London");
		expect(timezoneResolver().resolve()).toBe("UK");
	});

	it("maps Europe/Zurich to CH", () => {
		stubZone("Europe/Zurich");
		expect(timezoneResolver().resolve()).toBe("CH");
	});

	it("maps US zones to US (state-level not derivable from IANA zone)", () => {
		stubZone("America/Los_Angeles");
		expect(timezoneResolver().resolve()).toBe("US");
		stubZone("America/New_York");
		expect(timezoneResolver().resolve()).toBe("US");
	});

	it("maps a non-special-cased country zone to ROW", () => {
		stubZone("Asia/Tokyo");
		expect(timezoneResolver().resolve()).toBe("ROW");
	});

	it("returns null for an unknown zone", () => {
		stubZone("Mars/Jezero");
		expect(timezoneResolver().resolve()).toBeNull();
	});

	it("returns null when the zone is missing", () => {
		stubZone(undefined);
		expect(timezoneResolver().resolve()).toBeNull();
	});

	it("returns null when Intl.DateTimeFormat throws", () => {
		Intl.DateTimeFormat = (() => {
			throw new Error("boom");
		}) as unknown as typeof Intl.DateTimeFormat;
		expect(timezoneResolver().resolve()).toBeNull();
	});

	it("ignores the request argument", () => {
		stubZone("Europe/Paris");
		const req = new Request("https://example.com", {
			headers: { "cf-ipcountry": "US" },
		});
		expect(timezoneResolver().resolve(req)).toBe("EEA");
	});
});

describe("clientGeoResolver", () => {
	function jsonResponse(body: unknown, ok = true): Response {
		return new Response(JSON.stringify(body), {
			status: ok ? 200 : 500,
			headers: { "content-type": "application/json" },
		});
	}

	it("normalises country to jurisdiction", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ country: "DE" }));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBe("EEA");
		expect(fetchImpl).toHaveBeenCalledWith("/geo");
	});

	it("combines US country with region into US-XX", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ country: "US", region: "CA" }));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBe("US-CA");
	});

	it("ignores region for non-US countries", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ country: "DE", region: "BY" }));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBe("EEA");
	});

	it("returns null on non-OK response", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ country: "DE" }, false));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBeNull();
	});

	it("returns null on fetch failure", async () => {
		const fetchImpl = vi.fn().mockRejectedValue(new Error("network"));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBeNull();
	});

	it("returns null when response has no country", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}));
		const r = clientGeoResolver({ endpoint: "/geo", fetch: fetchImpl });
		expect(await r.resolve()).toBeNull();
	});
});
