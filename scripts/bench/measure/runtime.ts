import { type ChildProcess, spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

export type RuntimeSample = {
	ttfbMs: number;
	fcpMs: number | null;
	lcpMs: number | null;
	cls: number | null;
	loadMs: number;
	jsExecMs: number;
	transferBytes: number;
	requests: number;
};

export type RuntimeResult = {
	url: string;
	iterations: number;
	samples: RuntimeSample[];
	median: RuntimeSample;
	p95: RuntimeSample;
};

function median(nums: number[]): number {
	const sorted = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function p95(nums: number[]): number {
	const sorted = [...nums].sort((a, b) => a - b);
	const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
	return sorted[idx];
}

function agg(
	samples: RuntimeSample[],
	fn: (nums: number[]) => number,
): RuntimeSample {
	const nonNull = (k: keyof RuntimeSample) =>
		samples.map((s) => s[k]).filter((v): v is number => v !== null);
	return {
		ttfbMs: fn(nonNull("ttfbMs")),
		fcpMs: nonNull("fcpMs").length ? fn(nonNull("fcpMs")) : null,
		lcpMs: nonNull("lcpMs").length ? fn(nonNull("lcpMs")) : null,
		cls: nonNull("cls").length ? fn(nonNull("cls")) : null,
		loadMs: fn(nonNull("loadMs")),
		jsExecMs: fn(nonNull("jsExecMs")),
		transferBytes: fn(nonNull("transferBytes")),
		requests: Math.round(fn(nonNull("requests"))),
	};
}

export async function startPreviewServer(
	cwd: string,
	port: number,
): Promise<{ url: string; stop: () => Promise<void> }> {
	const proc: ChildProcess = spawn("node", [".output/server/index.mjs"], {
		cwd,
		env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
		stdio: ["ignore", "pipe", "pipe"],
	});

	const url = `http://127.0.0.1:${port}`;

	// Wait for server to respond
	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
			if (res.ok || res.status < 500) break;
		} catch {
			// not up yet
		}
		await sleep(250);
	}

	return {
		url,
		stop: async () => {
			proc.kill("SIGTERM");
			await new Promise<void>((resolve) => {
				proc.once("exit", () => resolve());
				setTimeout(() => {
					proc.kill("SIGKILL");
					resolve();
				}, 2000);
			});
		},
	};
}

async function collectSample(url: string): Promise<RuntimeSample> {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();

	// Install PerformanceObservers before any page script runs so we capture
	// LCP + CLS even on pages that load faster than our evaluate() callback.
	await page.addInitScript(() => {
		const w = window as unknown as {
			__lcp?: number;
			__cls?: number;
		};
		w.__lcp = 0;
		w.__cls = 0;
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				w.__lcp = entry.startTime;
			}
		}).observe({ type: "largest-contentful-paint", buffered: true });
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries() as (PerformanceEntry & {
				value: number;
				hadRecentInput: boolean;
			})[]) {
				if (!entry.hadRecentInput) w.__cls = (w.__cls ?? 0) + entry.value;
			}
		}).observe({ type: "layout-shift", buffered: true });
	});

	const cdp = await context.newCDPSession(page);
	await cdp.send("Network.enable");
	await cdp.send("Profiler.enable");
	await cdp.send("Profiler.setSamplingInterval", { interval: 100 });
	await cdp.send("Profiler.start");

	let transferBytes = 0;
	let requests = 0;
	cdp.on("Network.loadingFinished", (e) => {
		transferBytes += e.encodedDataLength;
		requests += 1;
	});

	const navStart = Date.now();
	const response = await page.goto(url, { waitUntil: "load" });
	const ttfbMs = response?.request().timing()
		? response.request().timing().responseStart
		: Date.now() - navStart;
	const loadMs = Date.now() - navStart;

	// Stop profiler right after load — don't count the LCP/CLS settle window
	const profile = await cdp.send("Profiler.stop");

	// Let LCP/CLS settle
	await page.waitForTimeout(3000);

	const metrics = await page.evaluate(() => {
		const perf = performance.getEntriesByType("paint");
		const fcp = perf.find(
			(e) => e.name === "first-contentful-paint",
		)?.startTime;
		const w = window as unknown as { __lcp?: number; __cls?: number };
		const lcp = w.__lcp && w.__lcp > 0 ? w.__lcp : null;
		const cls = w.__cls ?? 0;
		return { fcp: fcp ?? null, lcp, cls };
	});

	// Sum all self-time from profile nodes as a rough "JS exec time" proxy.
	// Exclude the (idle) root node — which dominates time for simple pages and
	// drowns out the actual execution signal.
	const appNodes = (profile.profile.nodes ?? []).filter(
		(n) => n.callFrame.functionName !== "(idle)",
	);
	const hitCount = appNodes.reduce((sum, n) => sum + (n.hitCount ?? 0), 0);
	// hitCount * samplingInterval(µs) / 1000 = ms
	const jsExecMs = Math.round((hitCount * 100) / 1000);

	await browser.close();

	return {
		ttfbMs: Math.round(ttfbMs),
		fcpMs: metrics.fcp !== null ? Math.round(metrics.fcp) : null,
		lcpMs: metrics.lcp !== null ? Math.round(metrics.lcp) : null,
		cls: metrics.cls,
		loadMs,
		jsExecMs,
		transferBytes,
		requests,
	};
}

export async function measureRuntime(
	url: string,
	iterations: number,
): Promise<RuntimeResult> {
	const samples: RuntimeSample[] = [];
	for (let i = 0; i < iterations; i++) {
		samples.push(await collectSample(url));
	}
	return {
		url,
		iterations,
		samples,
		median: agg(samples, median),
		p95: agg(samples, p95),
	};
}
