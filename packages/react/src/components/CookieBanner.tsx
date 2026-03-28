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
	useEffect,
	useMemo,
	useRef,
} from "react";
import { OpenPolicyContext } from "../context";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { useShouldShowCookieBanner } from "../hooks/useShouldShowCookieBanner";
import { Slot } from "./Slot";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CookieBannerTranslations = {
	title: string;
	description: string;
	learnMore: string;
	accept: string;
	reject: string;
	customize: string;
};

const defaultTranslations: CookieBannerTranslations = {
	title: "Cookie consent",
	description: "We use cookies to improve your experience.",
	learnMore: "Cookie policy",
	accept: "Accept all",
	reject: "Reject",
	customize: "Manage",
};

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
	status: CookieConsentStatus;
	accept: () => void;
	reject: () => void;
	update: (partial: Partial<CookieConsent>) => void;
	reset: () => void;
	config: CookiePolicyConfig;
	translations: CookieBannerTranslations;
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

// ─── Focus helpers ───────────────────────────────────────────────────────────

function trapFocusIn(node: HTMLElement) {
	const focusable = node.querySelectorAll<HTMLElement>(
		"a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
	);
	if (focusable.length === 0) return undefined;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (!first || !last) return undefined;
	const firstEl = first;
	const lastEl = last;

	function onKeyDown(event: KeyboardEvent) {
		if (event.key !== "Tab") return;
		if (event.shiftKey) {
			if (document.activeElement === firstEl) {
				event.preventDefault();
				lastEl.focus();
			}
		} else {
			if (document.activeElement === lastEl) {
				event.preventDefault();
				firstEl.focus();
			}
		}
	}

	node.addEventListener("keydown", onKeyDown);
	return () => node.removeEventListener("keydown", onKeyDown);
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type RootProps = HTMLAttributes<HTMLDivElement> & {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	shouldShow?: () => Promise<boolean>;
	scrollLock?: boolean;
	trapFocus?: boolean;
	translations?: Partial<CookieBannerTranslations>;
	children?: ReactNode;
	className?: string;
};

function Root({
	config: configProp,
	shouldShow,
	scrollLock = false,
	trapFocus = true,
	translations: translationsProp,
	children,
	className,
	...divProps
}: RootProps) {
	const { config: contextConfig } = useContext(OpenPolicyContext);
	const raw = configProp ?? contextConfig ?? undefined;
	const cookieConfig = useMemo(() => resolveCookieConfig(raw), [raw]);

	const mergedTranslations = useMemo(
		() => ({ ...defaultTranslations, ...translationsProp }),
		[translationsProp],
	);

	const { status, accept, reject, update, reset } =
		useCookieConsent(cookieConfig);

	const visible = useShouldShowCookieBanner(status, shouldShow);

	const dataState = visible ? "open" : "closed";
	const rootRef = useRef<HTMLDivElement | null>(null);
	const lastActiveRef = useRef<HTMLElement | null>(null);

	// Scroll lock
	useEffect(() => {
		if (!visible || !scrollLock) return;
		const { body } = document;
		const previous = body.style.overflow;
		body.style.overflow = "hidden";
		return () => {
			body.style.overflow = previous;
		};
	}, [visible, scrollLock]);

	// Focus trap + return focus
	useEffect(() => {
		const node = rootRef.current;
		if (!node || !visible || !trapFocus) return;
		lastActiveRef.current = document.activeElement as HTMLElement | null;
		node.tabIndex = node.tabIndex === -1 ? -1 : node.tabIndex || -1;
		node.focus();
		const cleanupTrap = trapFocusIn(node);
		return () => {
			cleanupTrap?.();
			lastActiveRef.current?.focus?.();
		};
	}, [visible, trapFocus]);

	if (!cookieConfig) return null;

	return (
		<CookieBannerContext.Provider
			value={{
				status,
				accept,
				reject,
				update,
				reset,
				config: cookieConfig,
				translations: mergedTranslations,
			}}
		>
			<div
				{...divProps}
				ref={rootRef}
				data-op-cookie-banner-root
				data-state={dataState}
				data-status={status}
				className={className}
				aria-hidden={visible ? undefined : true}
				style={
					visible ? undefined : { visibility: "hidden", pointerEvents: "none" }
				}
				role="dialog"
				aria-label={mergedTranslations.title}
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
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return <div data-op-cookie-banner-overlay className={className} />;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type CardProps = {
	asChild?: boolean;
	className?: string;
	children?: ReactNode;
};

function Card({ asChild, className, children }: CardProps) {
	if (asChild) {
		return <Slot className={className}>{children}</Slot>;
	}
	return (
		<div data-op-cookie-banner-card className={className}>
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
	const { accept, translations } = useCookieBannerContext();
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
			{children ?? translations.accept}
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
	const { reject, translations } = useCookieBannerContext();
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
			{children ?? translations.reject}
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
	const { translations } = useCookieBannerContext();
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
			{children ?? translations.customize}
		</button>
	);
}

// ─── Default banner ───────────────────────────────────────────────────────────

type CookieBannerProps = {
	config?: OpenPolicyConfig | CookiePolicyConfig;
	shouldShow?: () => Promise<boolean>;
	onCustomize?: () => void;
	policyHref?: string;
	translations?: Partial<CookieBannerTranslations>;
};

function DefaultCookieBanner({
	config,
	shouldShow,
	onCustomize,
	policyHref = "/cookie-policy",
	translations,
}: CookieBannerProps) {
	const link = (
		<a href={policyHref} className="op-cookie-policy-link">
			{translations?.learnMore ?? defaultTranslations.learnMore}
		</a>
	);

	return (
		<Root config={config} shouldShow={shouldShow} translations={translations}>
			<Card>
				<Header>
					<Title>{translations?.title ?? defaultTranslations.title}</Title>
					<Description>
						{translations?.description ?? defaultTranslations.description}{" "}
						{link}
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
