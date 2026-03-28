import type { CookiePolicyConfig, OpenPolicyConfig } from "@openpolicy/core";
import { type ReactNode, useContext } from "react";
import { OpenPolicyContext, OpenPolicyProvider } from "../context";
import { Slot } from "./Slot";

// ─── Overlay ──────────────────────────────────────────────────────────────────

type OverlayProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Overlay({ asChild, className, children }: OverlayProps) {
	const { route } = useContext(OpenPolicyContext);
	const open = route === "cookie";
	const dataProps = open ? { "data-open": "" } : { "data-closed": "" };
	if (asChild) {
		return (
			<Slot className={className} {...dataProps}>
				{children}
			</Slot>
		);
	}
	return (
		<div data-op-cookie-banner-overlay className={className} {...dataProps} />
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
	const open = route === "cookie";
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
			data-op-cookie-banner-card
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
		<div data-op-cookie-banner-header className={className}>
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
		<p data-op-cookie-banner-title className={className}>
			{children}
		</p>
	);
}

// ─── Description ─────────────────────────────────────────────────────────────

type DescriptionProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Description({ asChild, className, children }: DescriptionProps) {
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return (
		<p data-op-cookie-banner-description className={className}>
			{children}
		</p>
	);
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
		<div data-op-cookie-banner-footer className={className}>
			{children}
		</div>
	);
}

// ─── AcceptButton ─────────────────────────────────────────────────────────────

type AcceptButtonProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function AcceptButton({ asChild, className, children }: AcceptButtonProps) {
	const { accept } = useContext(OpenPolicyContext);
	if (asChild) {
		return (
			<Slot className={className} onClick={accept}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-banner-accept
			type="button"
			className={className}
			onClick={accept}
		>
			{children ?? "Accept all"}
		</button>
	);
}

// ─── RejectButton ─────────────────────────────────────────────────────────────

type RejectButtonProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function RejectButton({ asChild, className, children }: RejectButtonProps) {
	const { reject } = useContext(OpenPolicyContext);
	if (asChild) {
		return (
			<Slot className={className} onClick={reject}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-banner-reject
			type="button"
			className={className}
			onClick={reject}
		>
			{children ?? "Reject"}
		</button>
	);
}

// ─── CustomizeButton ──────────────────────────────────────────────────────────

type CustomizeButtonProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
	onClick?: () => void;
};

function CustomizeButton({
	asChild,
	className,
	children,
	onClick,
}: CustomizeButtonProps) {
	const { setRoute } = useContext(OpenPolicyContext);
	const handleClick = onClick ?? (() => setRoute("preferences"));
	if (asChild) {
		return (
			<Slot className={className} onClick={handleClick}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-banner-customize
			type="button"
			className={className}
			onClick={handleClick}
		>
			{children ?? "Manage"}
		</button>
	);
}

// ─── Default banner ───────────────────────────────────────────────────────────

type CookieBannerProps = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	shouldShow?: () => Promise<boolean>;
	onCustomize?: () => void;
	policyHref?: string;
};

function DefaultCookieBanner({
	config,
	shouldShow,
	onCustomize,
	policyHref = "/cookie-policy",
}: CookieBannerProps) {
	const link = (
		<a href={policyHref} className="op-cookie-policy-link">
			Cookie policy
		</a>
	);

	const content = (
		<Card>
			<Header>
				<Title>Cookie consent</Title>
				<Description>
					We use cookies to improve your experience. {link}
				</Description>
			</Header>
			<Footer>
				<RejectButton />
				{onCustomize && <CustomizeButton onClick={onCustomize} />}
				<AcceptButton />
			</Footer>
		</Card>
	);

	if (config && "company" in config) {
		return (
			<OpenPolicyProvider
				config={config as OpenPolicyConfig}
				shouldShow={shouldShow}
			>
				{content}
			</OpenPolicyProvider>
		);
	}
	return content;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const CookieBanner = Object.assign(DefaultCookieBanner, {
	Overlay,
	Card,
	Header,
	Title,
	Description,
	Footer,
	AcceptButton,
	RejectButton,
	CustomizeButton,
});
