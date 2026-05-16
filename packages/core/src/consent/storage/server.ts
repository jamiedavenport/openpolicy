import type { ConsentRecord, StorageAdapter } from "../types";

export type ServerAdapterOptions = {
	endpoint: string;
	fetch?: typeof fetch;
	headers?: HeadersInit | (() => HeadersInit);
	onError?: (err: unknown) => void;
};

export function serverAdapter(options: ServerAdapterOptions): StorageAdapter {
	const { endpoint, onError } = options;
	const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);

	function buildHeaders(extra?: HeadersInit): Headers {
		const h = new Headers();
		const base = typeof options.headers === "function" ? options.headers() : options.headers;
		if (base) new Headers(base).forEach((v, k) => h.set(k, v));
		if (extra) new Headers(extra).forEach((v, k) => h.set(k, v));
		return h;
	}

	function reportError(err: unknown): null {
		if (onError) onError(err);
		return null;
	}

	return {
		async read() {
			try {
				const res = await fetchImpl(endpoint, {
					method: "GET",
					headers: buildHeaders({ Accept: "application/json" }),
				});
				if (!res.ok) {
					if (res.status === 404) return null;
					return reportError(new Error(`serverAdapter.read failed: ${res.status}`));
				}
				return (await res.json()) as ConsentRecord;
			} catch (err) {
				return reportError(err);
			}
		},
		async write(record) {
			try {
				const res = await fetchImpl(endpoint, {
					method: "POST",
					headers: buildHeaders({ "Content-Type": "application/json" }),
					body: JSON.stringify(record),
				});
				if (!res.ok) reportError(new Error(`serverAdapter.write failed: ${res.status}`));
			} catch (err) {
				reportError(err);
			}
		},
		async clear() {
			try {
				const res = await fetchImpl(endpoint, {
					method: "DELETE",
					headers: buildHeaders(),
				});
				if (!res.ok && res.status !== 404) {
					reportError(new Error(`serverAdapter.clear failed: ${res.status}`));
				}
			} catch (err) {
				reportError(err);
			}
		},
	};
}
