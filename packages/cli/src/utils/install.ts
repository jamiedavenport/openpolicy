import { spawn as nodeSpawn } from "node:child_process";
import type { PackageManager } from "./detect-pm";

export type InstallOptions = {
	dev: boolean;
	cwd: string;
	dryRun?: boolean;
	spawnImpl?: typeof nodeSpawn;
	log?: (line: string) => void;
};

export function formatCommand(pm: PackageManager, deps: string[], dev: boolean): string {
	return [pm.bin, ...pm.addArgs(deps, dev)].join(" ");
}

export function runInstall(
	pm: PackageManager,
	deps: string[],
	opts: InstallOptions,
): Promise<void> {
	if (deps.length === 0) return Promise.resolve();
	const args = pm.addArgs(deps, opts.dev);
	const log = opts.log ?? ((line) => process.stdout.write(`${line}\n`));
	if (opts.dryRun) {
		log(`> ${pm.bin} ${args.join(" ")}`);
		return Promise.resolve();
	}
	const spawnFn = opts.spawnImpl ?? nodeSpawn;
	log(`> ${pm.bin} ${args.join(" ")}`);
	return new Promise((resolve, reject) => {
		const child = spawnFn(pm.bin, args, {
			cwd: opts.cwd,
			stdio: "inherit",
			shell: process.platform === "win32",
		});
		child.on("error", reject);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${pm.bin} exited with code ${code ?? "null"}`));
			}
		});
	});
}
