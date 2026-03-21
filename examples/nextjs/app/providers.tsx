"use client";

import { OpenPolicy } from "@openpolicy/react";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import openpolicy from "../openpolicy";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<OpenPolicy config={openpolicy}>
			<TooltipProvider>{children}</TooltipProvider>
		</OpenPolicy>
	);
}
