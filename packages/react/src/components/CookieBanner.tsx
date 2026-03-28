import {
	type CookieConsent,
	type CookieConsentStatus,
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
} from "react";
import { OpenPolicyContext } from "../context";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useShouldShowCookieBanner } from "../hooks/useShouldShowCookieBanner";
import { Slot } from "./Slot";

// ─── Config resolution ───────────────────────────────────────────────────────

function resolveCookieConfig(
	raw: OpenPolicyConfig | CookiePolicyConfig | null | undefined,
): CookiePolicyConfig | undefined {
	if (!raw) return undefined;
	if (isOpenPolicyConfig(raw) && raw.cookie)
		return { ...raw.cookie, company: raw.company } as CookiePolicyConfig;
	if (!isOpenPolicyConfig(raw)) return raw as CookiePolicyConfig;
	return undefined;
}

// ─── Internal context ─────────────────────────────────────────────────────────

type CookieBannerContextValue = {
	open: boolean;
	status: CookieConsentStatus;
	accept: () => void;
	reject: () => void;
	update: (partial: Partial<CookieConsent>) => void;
	reset: () => void;
	config: CookiePolicyConfig;
};

const CookieBannerContext = createContext<CookieBannerContextValue | null>(
	null,
);

function useCookieBannerContext(): CookieBannerContextValue {
	const ctx = useContext(CookieBannerContext);
	if (!ctx)
		throw new Error(
			"CookieBanner sub-components must be used inside CookieBanner.Root",
		);
	return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = HTMLAttributes<HTMLDivElement> & {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	shouldShow?: () => Promise<boolean>;
	children?: ReactNode;
	className?: string;
};

function Root({
	config: configProp,
	shouldShow,
	children,
	className,
	...divProps
}: RootProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const raw = configProp ?? contextConfig ?? undefined;
	const cookieConfig = useMemo(() => resolveCookieConfig(raw), [raw]);

	const { status, accept, reject, update, reset } =
		useCookieConsent(cookieConfig);

	const visible = useShouldShowCookieBanner(status, shouldShow);

	const dataState = visible ? "open" : "closed";

	if (!cookieConfig) return null;

	return (
		<CookieBannerContext.Provider
			value={{
				open: visible,
				status,
				accept,
				reject,
				update,
				reset,
				config: cookieConfig,
			}}
		>
			<div
				{...divProps}
				data-op-cookie-banner-root
				data-state={dataState}
				data-status={status}
				className={className}
				aria-hidden={visible ? undefined : true}
				style={
					visible ? undefined : { visibility: "hidden", pointerEvents: "none" }
				}
				role="dialog"
				aria-label="Cookie consent"
			>
				{children}
			</div>
		</CookieBannerContext.Provider>
	);
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

type OverlayProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Overlay({ asChild, className, children }: OverlayProps) {
	const { open } = useCookieBannerContext();
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
	const { open } = useCookieBannerContext();
	const dataProps = open ? { "data-open": "" } : { "data-closed": "" };
	if (asChild) {
		return (
			<Slot className={className} {...dataProps}>
				{children}
			</Slot>
		);
	}
	return (
		<div data-op-cookie-banner-card className={className} {...dataProps}>
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
	const { accept } = useCookieBannerContext();
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
	const { reject } = useCookieBannerContext();
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
	if (asChild) {
		return (
			<Slot className={className} onClick={onClick}>
				{children}
			</Slot>
		);
	}
	return (
		<button
			data-op-cookie-banner-customize
			type="button"
			className={className}
			onClick={onClick}
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

	return (
		<Root config={config} shouldShow={shouldShow}>
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
		</Root>
	);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const CookieBanner = Object.assign(DefaultCookieBanner, {
	Root,
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
