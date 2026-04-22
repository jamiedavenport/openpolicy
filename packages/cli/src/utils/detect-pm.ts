import { existsSync, readFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";

export type PackageManagerName = "bun" | "pnpm" | "yarn" | "npm";

export type PackageManager = {
	name: PackageManagerName;
	bin: string;
	addArgs: (deps: string[], dev: boolean) => string[];
};

const LOCKFILES: Array<[string, PackageManagerName]> = [
	["bun.lock", "bun"],
	["bun.lockb", "bun"],
	["pnpm-lock.yaml", "pnpm"],
	["yarn.lock", "yarn"],
	["package-lock.json", "npm"],
];

function addArgsFor(name: PackageManagerName) {
	return (deps: string[], dev: boolean): string[] => {
		switch (name) {
			case "bun":
				return ["add", ...(dev ? ["-d"] : []), ...deps];
			case "pnpm":
				return ["add", ...(dev ? ["-D"] : []), ...deps];
			case "yarn":
				return ["add", ...(dev ? ["-D"] : []), ...deps];
			case "npm":
				return ["install", ...(dev ? ["-D"] : []), ...deps];
		}
	};
}

export function toPackageManager(name: PackageManagerName): PackageManager {
	return { name, bin: name, addArgs: addArgsFor(name) };
}

function readPackageManagerField(dir: string): PackageManagerName | null {
	const pkgPath = join(dir, "package.json");
	if (!existsSync(pkgPath)) return null;
	try {
		const raw = JSON.parse(readFileSync(pkgPath, "utf8")) as {
			packageManager?: string;
		};
		const field = raw.packageManager;
		if (!field) return null;
		const at = field.indexOf("@");
		const name = (at === -1 ? field : field.slice(0, at)) as PackageManagerName;
		if (
			name === "bun" ||
			name === "pnpm" ||
			name === "yarn" ||
			name === "npm"
		) {
			return name;
		}
		return null;
	} catch {
		return null;
	}
}

export function detectPackageManager(cwd: string): PackageManager {
	const root = parse(cwd).root;
	let dir = cwd;
	while (true) {
		for (const [file, name] of LOCKFILES) {
			if (existsSync(join(dir, file))) {
				return toPackageManager(name);
			}
		}
		const fromField = readPackageManagerField(dir);
		if (fromField) return toPackageManager(fromField);
		if (dir === root) break;
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return toPackageManager("npm");
}
