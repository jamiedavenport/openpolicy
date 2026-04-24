/// <reference types="vite-plus/client" />

import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Baseline — TanStack" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<TooltipProvider>
				<Outlet />
			</TooltipProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background text-foreground">
				<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
					<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
						<Link to="/" className="font-semibold text-foreground">
							Baseline
						</Link>
					</div>
				</header>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
