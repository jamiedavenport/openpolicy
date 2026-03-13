import { access, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type {
	CookiePolicyConfig,
	OpenPolicyConfig,
	OutputFormat,
	PrivacyPolicyConfig,
	TermsOfServiceConfig,
} from "@openpolicy/core";
import {
	compilePolicy,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	validateCookiePolicy,
	validatePrivacyPolicy,
	validateTermsOfService,
} from "@openpolicy/core";
import type { Plugin } from "vite";

export interface OpenPolicyOptions {
	configPath?: string;
	formats?: OutputFormat[];
	outDir?: string;
}

function detectType(filename: string): "privacy" | "terms" | "cookie" {
	if (filename.includes("cookie")) return "cookie";
	if (filename.includes("terms")) return "terms";
	return "privacy";
}

export async function generatePolicies(
	configPath: string,
	outDir: string,
	formats: OutputFormat[],
): Promise<void> {
	const mod = await import(`${configPath}?t=${Date.now()}`);
	const config =
		(mod as Record<string, unknown>)["default"] ??
		(mod as Record<string, unknown>)["module.exports"] ??
		mod;

	if (config === null || config === undefined || typeof config !== "object") {
		throw new Error(
			`[openpolicy] Config must export a non-null object: ${configPath}`,
		);
	}

	if (isOpenPolicyConfig(config)) {
		const inputs = expandOpenPolicyConfig(config as OpenPolicyConfig);
		await mkdir(outDir, { recursive: true });
		for (const input of inputs) {
			const issues =
				input.type === "terms"
					? validateTermsOfService(input)
					: input.type === "cookie"
						? validateCookiePolicy(input)
						: validatePrivacyPolicy(input);
			for (const issue of issues) {
				if (issue.level === "error")
					throw new Error(`[openpolicy] ${issue.message}`);
				console.warn(`[openpolicy] Warning: ${issue.message}`);
			}
			const results = compilePolicy(input, { formats });
			const outputFilename =
				input.type === "terms"
					? "terms-of-service"
					: input.type === "cookie"
						? "cookie-policy"
						: "privacy-policy";
			for (const result of results) {
				const ext = result.format === "markdown" ? "md" : result.format;
				await writeFile(
					join(outDir, `${outputFilename}.${ext}`),
					result.content,
					"utf8",
				);
			}
		}
		return;
	}

	const type = detectType(configPath);

	const issues =
		type === "terms"
			? validateTermsOfService(config as TermsOfServiceConfig)
			: type === "cookie"
				? validateCookiePolicy(config as CookiePolicyConfig)
				: validatePrivacyPolicy(config as PrivacyPolicyConfig);

	for (const issue of issues) {
		if (issue.level === "error") {
			throw new Error(`[openpolicy] Validation error: ${issue.message}`);
		}
		console.warn(`[openpolicy] Warning: ${issue.message}`);
	}

	const results = compilePolicy(
		type === "terms"
			? { type: "terms", ...(config as TermsOfServiceConfig) }
			: type === "cookie"
				? { type: "cookie", ...(config as CookiePolicyConfig) }
				: { type: "privacy", ...(config as PrivacyPolicyConfig) },
		{ formats },
	);

	const outputFilename =
		type === "terms"
			? "terms-of-service"
			: type === "cookie"
				? "cookie-policy"
				: "privacy-policy";

	await mkdir(outDir, { recursive: true });

	for (const result of results) {
		const ext = result.format === "markdown" ? "md" : result.format;
		await writeFile(
			join(outDir, `${outputFilename}.${ext}`),
			result.content,
			"utf8",
		);
	}
}

export function openPolicy(options: OpenPolicyOptions = {}): Plugin {
	const formats: OutputFormat[] = options.formats ?? ["markdown"];
	const configFile = options.configPath ?? "openpolicy.ts";
	let resolvedOutDir: string;
	let resolvedConfigPath: string;

	return {
		name: "openpolicy",

		configResolved(config) {
			resolvedOutDir = resolve(
				config.root,
				options.outDir ?? "public/policies",
			);
			resolvedConfigPath = resolve(config.root, configFile);
		},

		async buildStart() {
			const configExists = await access(resolvedConfigPath).then(
				() => true,
				() => false,
			);
			if (!configExists) {
				console.warn(`[openpolicy] no configuration file found`);
				return;
			}
			await generatePolicies(resolvedConfigPath, resolvedOutDir, formats);
		},

		configureServer(server) {
			server.watcher.add(resolvedConfigPath);
			server.watcher.on("change", async (path) => {
				if (path !== resolvedConfigPath) return;
				try {
					await generatePolicies(resolvedConfigPath, resolvedOutDir, formats);
					console.log("[openpolicy] Policies regenerated");
				} catch (err) {
					console.error("[openpolicy]", err);
				}
			});
		},
	};
}
