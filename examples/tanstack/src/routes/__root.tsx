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
import openpolicy from "../openpolicy";

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
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<OpenPolicy config={openpolicy}>
				<Outlet />
			</OpenPolicy>
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
				<nav>
					<Link to="/">Home</Link>
					<Link to="/privacy">Privacy</Link>
					<Link to="/terms">Terms</Link>
					<Link to="/framework/privacy">Framework Privacy</Link>
				</nav>

				{children}
				<Scripts />
			</body>
		</html>
	);
}
