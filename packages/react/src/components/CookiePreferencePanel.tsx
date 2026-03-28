import {
	type CookieConsent,
	type CookiePolicyConfig,
	isOpenPolicyConfig,
	type OpenPolicyConfig,
} from "@openpolicy/core";
import {
	createContext,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";
import { OpenPolicyContext } from "../context";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { Slot } from "./Slot";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CookieCategory {
	key: keyof CookieConsent;
	label: string;
	enabled: boolean;
	locked: boolean;
}

// ─── Config resolution ────────────────────────────────────────────────────────

function resolveCookieConfig(
	raw: OpenPolicyConfig | CookiePolicyConfig | null | undefined,
): CookiePolicyConfig | undefined {
	if (!raw) return undefined;
	if (isOpenPolicyConfig(raw) && raw.cookie)
		return { ...raw.cookie, company: raw.company } as CookiePolicyConfig;
	if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
	return undefined;
}

const CATEGORY_LABELS: Record<string, string> = {
	essential: "Essential",
	analytics: "Analytics",
	functional: "Functional",
	marketing: "Marketing",
};

// ─── Internal context ─────────────────────────────────────────────────────────

type CookiePreferencePanelContextValue = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categories: CookieCategory[];
	toggle: (key: string) => void;
	save: () => void;
	rejectAll: () => void;
};

const CookiePreferencePanelContext =
	createContext<CookiePreferencePanelContextValue | null>(null);

function useCookiePreferencePanelContext(): CookiePreferencePanelContextValue {
	const ctx = useContext(CookiePreferencePanelContext);
	if (!ctx)
		throw new Error(
			"CookiePreferencePanel sub-components must be used inside CookiePreferencePanel.Root",
		);
	return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = HTMLAttributes<HTMLDivElement> & {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSave?: (consent: CookieConsent) => void;
	children?: ReactNode;
	className?: string;
};

function Root({
	config: configProp,
	open = true,
	onOpenChange,
	onSave,
	children,
	className,
	...divProps
}: RootProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const raw = configProp ?? contextConfig ?? undefined;
	const cookieConfig = useMemo(() => resolveCookieConfig(raw), [raw]);

	const { consent, update } = useCookieConsent(cookieConfig);
	const [draft, setDraft] = useState<Partial<CookieConsent>>({});

	const categories: CookieCategory[] = cookieConfig
		? (
				Object.keys(cookieConfig.cookies) as Array<
					keyof typeof cookieConfig.cookies
				>
			)
				.filter((key) => cookieConfig.cookies[key])
				.map((key) => ({
					key,
					label: CATEGORY_LABELS[String(key)] ?? String(key),
					enabled:
						key === "essential"
							? true
							: (draft[key] ?? consent?.[key] ?? false),
					locked: key === "essential",
				}))
		: [];

	const toggle = (key: string) => {
		if (key === "essential") return;
		setDraft((prev) => ({
			...prev,
			[key]: !(
				prev[key as keyof CookieConsent] ??
				consent?.[key as keyof CookieConsent] ??
				false
			),
		}));
	};

	const save = () => {
		const next = {
			...(consent ?? {}),
			...draft,
			essential: true,
		} as CookieConsent;
		update(next);
		setDraft({});
		onSave?.(next);
		onOpenChange?.(false);
	};

	const rejectAll = () => {
		if (!cookieConfig) return;
		const next: CookieConsent = { essential: true };
		for (const key of Object.keys(cookieConfig.cookies)) {
			if (key !== "essential") {
				next[key] = false;
			}
		}
		update(next);
		setDraft({});
		onOpenChange?.(false);
	};

	const dataState = open ? "open" : "closed";
	if (!cookieConfig) return null;

	return (
		<CookiePreferencePanelContext.Provider
			value={{
				open,
				onOpenChange: onOpenChange ?? (() => {}),
				categories,
				toggle,
				save,
				rejectAll,
			}}
		>
			<div
				{...divProps}
				data-op-cookie-preferences-root
				data-state={dataState}
				className={className}
				style={
					open ? undefined : { visibility: "hidden", pointerEvents: "none" }
				}
				role="dialog"
				aria-label="Cookie preferences"
			>
				{children}
			</div>
		</CookiePreferencePanelContext.Provider>
	);
}

// ─── Overlay ─────────────────────────────────────────────────────────────────-

interface OverlayProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function Overlay({ asChild, className, children }: OverlayProps) {
	const { open } = useCookiePreferencePanelContext();
	const dataProps = open ? { "data-open": "" } : { "data-closed": "" };
	if (asChild) {
		return (
			<Slot className={className} {...dataProps}>
				{children}
			</Slot>
		);
	}
	return (
		<div
			data-op-cookie-preferences-overlay
			className={className}
			{...dataProps}
		/>
	);
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function Card({ asChild, className, children }: CardProps) {
	const { open } = useCookiePreferencePanelContext();
	const dataProps = open ? { "data-open": "" } : { "data-closed": "" };
	if (asChild) {
		return (
			<Slot className={className} {...dataProps}>
				{children}
			</Slot>
		);
	}
	return (
		<div data-op-cookie-preferences-card className={className} {...dataProps}>
			{children}
		</div>
	);
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function Header({ asChild, className, children }: HeaderProps) {
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return (
		<div data-op-cookie-preferences-header className={className}>
			{children}
		</div>
	);
}

// ─── Title ─────────────────────────────────────────────────────────────────---

interface TitleProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function Title({ asChild, className, children }: TitleProps) {
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return (
		<p data-op-cookie-preferences-title className={className}>
			{children}
		</p>
	);
}

// ─── CategoryList ─────────────────────────────────────────────────────────----

interface CategoryListProps {
	className?: string;
	asChild?: boolean;
	children?: ReactNode;
}

function CategoryList({ className, asChild, children }: CategoryListProps) {
	if (asChild) return <Slot className={className}>{children}</Slot>;
	return (
		<div data-op-cookie-preferences-category-list className={className}>
			{children}
		</div>
	);
}

// ─── Category ─────────────────────────────────────────────────────────────────

interface CategoryRenderProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

interface CategoryProps {
	name: string;
	asChild?: boolean;
	className?: string;
	children?: (props: CategoryRenderProps) => ReactNode;
}

function Category({ name, asChild, className, children }: CategoryProps) {
	const { categories, toggle } = useCookiePreferencePanelContext();
	const cat = categories.find((c) => c.key === name);
	if (!cat) return null;

	const onCheckedChange = (_checked: boolean) => {
		if (!cat.locked) toggle(name);
	};

	if (children) {
		const rendered = children({
			checked: cat.enabled,
			onCheckedChange,
		});
		if (asChild) return <Slot className={className}>{rendered}</Slot>;
		return rendered;
	}

	const fieldset = (
		<fieldset data-op-cookie-category className={className}>
			<legend>{cat.label}</legend>
			<input
				type="checkbox"
				checked={cat.enabled}
				disabled={cat.locked}
				onChange={(e) => onCheckedChange(e.target.checked)}
			/>
		</fieldset>
	);
	return asChild ? <Slot className={className}>{fieldset}</Slot> : fieldset;
}

// ─── Footer ─────────────────────────────────────────────────────────────────--

interface FooterProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function Footer({ asChild, className, children }: FooterProps) {
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return (
		<div data-op-cookie-preferences-footer className={className}>
			{children}
		</div>
	);
}

// ─── RejectAllButton ─────────────────────────────────────────────────---------

interface RejectAllButtonProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function RejectAllButton({
	asChild,
	className,
	children,
}: RejectAllButtonProps) {
	const { rejectAll } = useCookiePreferencePanelContext();
	if (asChild) {
		return (
			<Slot className={className} onClick={rejectAll}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-preferences-reject-all
			type="button"
			className={className}
			onClick={rejectAll}
		>
			{children ?? "Reject all"}
		</button>
	);
}

// ─── SaveButton ─────────────────────────────────────────────────────────------

interface SaveButtonProps {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
}

function SaveButton({ asChild, className, children }: SaveButtonProps) {
	const { save } = useCookiePreferencePanelContext();
	if (asChild) {
		return (
			<Slot className={className} onClick={save}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-preferences-save
			type="button"
			className={className}
			onClick={save}
		>
			{children ?? "Save preferences"}
		</button>
	);
}

// ─── Default panel ─────────────────────────────────────────────────────────---

type CookiePreferencePanelProps = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSave?: (consent: CookieConsent) => void;
};

function DefaultCookiePreferencePanel({
	config,
	open,
	onOpenChange,
	onSave,
}: CookiePreferencePanelProps) {
	const cookieConfig = useMemo(() => resolveCookieConfig(config), [config]);
	const categoryKeys = cookieConfig ? Object.keys(cookieConfig.cookies) : [];

	return (
		<Root
			config={config}
			open={open}
			onOpenChange={onOpenChange}
			onSave={onSave}
			role="dialog"
			aria-label="Cookie preferences"
		>
			<Card>
				<Header>
					<Title>Cookie preferences</Title>
				</Header>
				<CategoryList>
					{categoryKeys.map((key) => (
						<Category key={key} name={key} />
					))}
				</CategoryList>
				<Footer>
					<RejectAllButton />
					<SaveButton />
				</Footer>
			</Card>
		</Root>
	);
}

// ─── Export ─────────────────────────────────────────────────────────────────--

export const CookiePreferencePanel = Object.assign(
	DefaultCookiePreferencePanel,
	{
		Root,
		Overlay,
		Card,
		Header,
		Title,
		CategoryList,
		Category,
		Footer,
		RejectAllButton,
		SaveButton,
	},
);
