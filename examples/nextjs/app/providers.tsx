"use client";

import { OpenPolicy } from "@openpolicy/react";
import type { ReactNode } from "react";
import openpolicy from "../openpolicy";

export function Providers({ children }: { children: ReactNode }) {
	return <OpenPolicy config={openpolicy}>{children}</OpenPolicy>;
}
