import type { Locale } from "../types";
import { en } from "./en";
import { fr } from "./fr";
import type { Dictionary } from "./types";

export const LOCALES: readonly Locale[] = ["en", "fr"] as const;

export const dictionaries: Record<Locale, Dictionary> = { en, fr };

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
