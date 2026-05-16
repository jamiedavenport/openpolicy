import type { ConsentRecord } from "../types";

export type LocalStorageAdapterOptions = {
	key?: string;
};

export type LocalStorageAdapter = {
	read(): ConsentRecord | null;
	write(record: ConsentRecord): void;
	clear(): void;
	subscribe(listener: (record: ConsentRecord | null) => void): () => void;
};

export function localStorageAdapter(options: LocalStorageAdapterOptions = {}): LocalStorageAdapter {
	const key = options.key ?? "oc_consent";
	const memory = new Map<string, string>();

	function getStorage(): Storage | null {
		try {
			if (typeof globalThis === "undefined") return null;
			const ls = (globalThis as { localStorage?: Storage }).localStorage;
			if (!ls) return null;
			const probe = "__oc_probe__";
			ls.setItem(probe, "1");
			ls.removeItem(probe);
			return ls;
		} catch {
			return null;
		}
	}

	function readRaw(): string | null {
		const ls = getStorage();
		if (ls) {
			try {
				return ls.getItem(key);
			} catch {
				// fall through to memory
			}
		}
		return memory.get(key) ?? null;
	}

	function writeRaw(value: string): void {
		const ls = getStorage();
		if (ls) {
			try {
				ls.setItem(key, value);
				return;
			} catch {
				// fall through to memory
			}
		}
		memory.set(key, value);
	}

	function clearRaw(): void {
		const ls = getStorage();
		if (ls) {
			try {
				ls.removeItem(key);
			} catch {
				// ignore
			}
		}
		memory.delete(key);
	}

	function decode(raw: string | null): ConsentRecord | null {
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as ConsentRecord;
		} catch {
			return null;
		}
	}

	return {
		read() {
			return decode(readRaw());
		},
		write(record) {
			writeRaw(JSON.stringify(record));
		},
		clear() {
			clearRaw();
		},
		subscribe(listener) {
			const target =
				typeof globalThis !== "undefined" ? (globalThis as { window?: Window }).window : undefined;
			if (!target || typeof target.addEventListener !== "function") {
				return () => {};
			}
			const handler = (event: Event) => {
				const e = event as StorageEvent;
				if (e.key !== key && e.key !== null) return;
				listener(decode(e.newValue ?? readRaw()));
			};
			target.addEventListener("storage", handler);
			return () => {
				target.removeEventListener("storage", handler);
			};
		},
	};
}
