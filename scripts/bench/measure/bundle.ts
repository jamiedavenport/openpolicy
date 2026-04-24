import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { brotliCompressSync, gzipSync, constants as zlibConstants } from "node:zlib";

export type AssetType = "js" | "css" | "html" | "font" | "image" | "other";

export type AssetRecord = {
	path: string;
	type: AssetType;
	bytes: number;
	gzipBytes: number;
	brotliBytes: number;
};

export type BundleResult = {
	totals: {
		bytes: number;
		gzipBytes: number;
		brotliBytes: number;
		assetCount: number;
	};
	byType: Record<
		AssetType,
		{ bytes: number; gzipBytes: number; brotliBytes: number; count: number }
	>;
	assets: AssetRecord[];
};

const TYPE_MAP: Record<string, AssetType> = {
	".js": "js",
	".mjs": "js",
	".css": "css",
	".html": "html",
	".woff": "font",
	".woff2": "font",
	".ttf": "font",
	".otf": "font",
	".png": "image",
	".jpg": "image",
	".jpeg": "image",
	".gif": "image",
	".svg": "image",
	".webp": "image",
	".avif": "image",
	".ico": "image",
};

function classify(path: string): AssetType {
	return TYPE_MAP[extname(path).toLowerCase()] ?? "other";
}

async function* walk(dir: string): AsyncGenerator<string> {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walk(full);
		} else if (entry.isFile()) {
			yield full;
		}
	}
}

export async function measureBundle(rootDir: string): Promise<BundleResult> {
	const assets: AssetRecord[] = [];
	const byType = {} as BundleResult["byType"];
	const types: AssetType[] = ["js", "css", "html", "font", "image", "other"];
	for (const t of types) {
		byType[t] = { bytes: 0, gzipBytes: 0, brotliBytes: 0, count: 0 };
	}

	const totals = { bytes: 0, gzipBytes: 0, brotliBytes: 0, assetCount: 0 };

	for await (const full of walk(rootDir)) {
		const buf = await readFile(full);
		const bytes = buf.byteLength;
		const gzipBytes = gzipSync(buf, { level: 9 }).byteLength;
		const brotliBytes = brotliCompressSync(buf, {
			params: {
				[zlibConstants.BROTLI_PARAM_QUALITY]: 11,
			},
		}).byteLength;

		const type = classify(full);
		const rel = relative(rootDir, full);

		assets.push({ path: rel, type, bytes, gzipBytes, brotliBytes });
		byType[type].bytes += bytes;
		byType[type].gzipBytes += gzipBytes;
		byType[type].brotliBytes += brotliBytes;
		byType[type].count += 1;
		totals.bytes += bytes;
		totals.gzipBytes += gzipBytes;
		totals.brotliBytes += brotliBytes;
		totals.assetCount += 1;
	}

	assets.sort((a, b) => b.bytes - a.bytes);

	return { totals, byType, assets };
}

export function formatBytes(n: number): string {
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
	return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
