// src/routes/__root.tsx
/// <reference types="vite/client" />

import { OpenPolicy } from "@openpolicy/react";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import openpolicy from "../openpolicy";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<TooltipProvider>
				<OpenPolicy config={openpolicy}>
					<Outlet />
				</OpenPolicy>
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
			<body>
				<nav className="p-5 flex items-center gap-5">
					<Link to="/tailwind">Tailwind</Link>
					<Link to="/css-vars">CSS Variables</Link>
					<Link to="/shadcn">Shadcn</Link>
				</nav>

				{children}
				<Scripts />
			</body>
		</html>
	);
}
