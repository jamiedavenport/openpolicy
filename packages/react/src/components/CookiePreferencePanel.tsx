import type {
	CookieConsent,
	CookiePolicyConfig,
	OpenPolicyConfig,
} from "@openpolicy/core";
import { type ReactNode, useContext } from "react";
import {
	type CookieCategory,
	OpenPolicyContext,
	OpenPolicyProvider,
} from "../context";
import { Slot } from "./Slot";

export type { CookieCategory };

// ─── Overlay ──────────────────────────────────────────────────────────────────

type OverlayProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Overlay({ asChild, className, children }: OverlayProps) {
	const { route } = useContext(OpenPolicyContext);
	const open = route === "preferences";
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

type CardProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Card({ asChild, className, children }: CardProps) {
	const { route } = useContext(OpenPolicyContext);
	const open = route === "preferences";
	const dataState = open ? "open" : "closed";
	const dataProps = open ? { "data-open": "" } : { "data-closed": "" };
	if (asChild) {
		return (
			<Slot className={className} data-state={dataState} {...dataProps}>
				{children}
			</Slot>
		);
	}
	return (
		<div
			data-op-cookie-preferences-card
			className={className}
			data-state={dataState}
			{...dataProps}
		>
			{children}
		</div>
	);
}

// ─── Header ───────────────────────────────────────────────────────────────────

type HeaderProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

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

// ─── Title ────────────────────────────────────────────────────────────────────

type TitleProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

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

// ─── CategoryList ─────────────────────────────────────────────────────────────

type CategoryListProps = {
	className?: string;
	asChild?: boolean;
	children?: ReactNode;
};

function CategoryList({ className, asChild, children }: CategoryListProps) {
	if (asChild) return <Slot className={className}>{children}</Slot>;
	return (
		<div data-op-cookie-preferences-category-list className={className}>
			{children}
		</div>
	);
}

// ─── Category ─────────────────────────────────────────────────────────────────

type CategoryRenderProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

type CategoryProps = {
	name: string;
	asChild?: boolean;
	className?: string;
	children?: (props: CategoryRenderProps) => ReactNode;
};

function Category({ name, asChild, className, children }: CategoryProps) {
	const { categories, toggle } = useContext(OpenPolicyContext);
	const cat = categories.find((c) => c.key === name);
	if (!cat) return null;

	const onCheckedChange = (_checked: boolean) => {
		if (!cat.locked) toggle(name);
	};

	if (children) {
		const rendered = children({ checked: cat.enabled, onCheckedChange });
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

// ─── Footer ───────────────────────────────────────────────────────────────────

type FooterProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

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

// ─── RejectAllButton ──────────────────────────────────────────────────────────

type RejectAllButtonProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function RejectAllButton({
	asChild,
	className,
	children,
}: RejectAllButtonProps) {
	const { rejectAll } = useContext(OpenPolicyContext);
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

// ─── SaveButton ───────────────────────────────────────────────────────────────

type SaveButtonProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
	onSave?: (consent: CookieConsent) => void;
};

function SaveButton({ asChild, className, children, onSave }: SaveButtonProps) {
	const { save } = useContext(OpenPolicyContext);
	const handleSave = () => save(onSave);
	if (asChild) {
		return (
			<Slot className={className} onClick={handleSave}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-preferences-save
			type="button"
			className={className}
			onClick={handleSave}
		>
			{children ?? "Save preferences"}
		</button>
	);
}

// ─── Default panel ────────────────────────────────────────────────────────────

type CookiePreferencePanelProps = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
};

function DefaultCookiePreferencePanel({ config }: CookiePreferencePanelProps) {
	const { cookieConfig } = useContext(OpenPolicyContext);
	const categoryKeys = cookieConfig ? Object.keys(cookieConfig.cookies) : [];

	const content = (
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
	);

	if (config && "company" in config) {
		return (
			<OpenPolicyProvider config={config as OpenPolicyConfig}>
				{content}
			</OpenPolicyProvider>
		);
	}
	return content;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const CookiePreferencePanel = Object.assign(
	DefaultCookiePreferencePanel,
	{
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
