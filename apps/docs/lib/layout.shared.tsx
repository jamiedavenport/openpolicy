import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
	user: "jamiedavenport",
	repo: "openpolicy",
	branch: "main",
};

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				// biome-ignore lint/performance/noImgElement: todo
				<img src="/logo-wide.svg" className="h-3 w-auto" alt="OpenPolicy" />
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
