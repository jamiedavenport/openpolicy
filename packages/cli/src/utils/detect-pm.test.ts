import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectPackageManager, toPackageManager } from "./detect-pm";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "op-pm-"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

test("detects bun from bun.lock", () => {
	writeFileSync(join(dir, "bun.lock"), "");
	expect(detectPackageManager(dir).name).toBe("bun");
});

test("detects bun from bun.lockb", () => {
	writeFileSync(join(dir, "bun.lockb"), "");
	expect(detectPackageManager(dir).name).toBe("bun");
});

test("detects pnpm from pnpm-lock.yaml", () => {
	writeFileSync(join(dir, "pnpm-lock.yaml"), "");
	expect(detectPackageManager(dir).name).toBe("pnpm");
});

test("detects yarn from yarn.lock", () => {
	writeFileSync(join(dir, "yarn.lock"), "");
	expect(detectPackageManager(dir).name).toBe("yarn");
});

test("detects npm from package-lock.json", () => {
	writeFileSync(join(dir, "package-lock.json"), "");
	expect(detectPackageManager(dir).name).toBe("npm");
});

test("walks up to parent directory lockfile", () => {
	const nested = join(dir, "packages", "app");
	mkdirSync(nested, { recursive: true });
	writeFileSync(join(dir, "pnpm-lock.yaml"), "");
	expect(detectPackageManager(nested).name).toBe("pnpm");
});

test("honors packageManager field when no lockfile", () => {
	writeFileSync(
		join(dir, "package.json"),
		JSON.stringify({ name: "x", packageManager: "yarn@4.0.0" }),
	);
	expect(detectPackageManager(dir).name).toBe("yarn");
});

test("falls back to npm when nothing is detected", () => {
	expect(detectPackageManager(dir).name).toBe("npm");
});

test("lockfile wins over packageManager field", () => {
	writeFileSync(join(dir, "bun.lock"), "");
	writeFileSync(join(dir, "package.json"), JSON.stringify({ packageManager: "npm@10.0.0" }));
	expect(detectPackageManager(dir).name).toBe("bun");
});

test("addArgs builds correct install args per PM", () => {
	expect(toPackageManager("bun").addArgs(["a", "b"], false)).toEqual(["add", "a", "b"]);
	expect(toPackageManager("bun").addArgs(["a"], true)).toEqual(["add", "-d", "a"]);
	expect(toPackageManager("pnpm").addArgs(["a"], true)).toEqual(["add", "-D", "a"]);
	expect(toPackageManager("yarn").addArgs(["a"], true)).toEqual(["add", "-D", "a"]);
	expect(toPackageManager("npm").addArgs(["a"], true)).toEqual(["install", "-D", "a"]);
	expect(toPackageManager("npm").addArgs(["a", "b"], false)).toEqual(["install", "a", "b"]);
});
