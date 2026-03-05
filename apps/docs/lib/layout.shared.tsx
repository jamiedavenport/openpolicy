import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
	user: "jamiedavenport",
	repo: "openpolicy.sh",
	branch: "main",
};

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "OpenPolicy",
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
