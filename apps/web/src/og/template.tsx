import { defineOgTemplate, type OgTemplateFont } from "@jxdltd/tanstack/og";
import GeistMonoRegular from "./fonts/GeistMono-Regular.ttf?inline";
import GeistMonoMedium from "./fonts/GeistMono-Medium.ttf?inline";

declare module "@jxdltd/tanstack/og" {
	interface OgData {
		eyebrow?: string;
		readingTime?: string;
	}
}

const decode = (dataUrl: string) => Buffer.from(dataUrl.split(",")[1], "base64");

const fonts: OgTemplateFont[] = [
	{ name: "Geist Mono", data: decode(GeistMonoRegular), weight: 400, style: "normal" },
	{ name: "Geist Mono", data: decode(GeistMonoMedium), weight: 500, style: "normal" },
];

const INK = "#000000";
const CANVAS = "#ffffff";
const MUTE = "#6b6b6b";
const BORDER = 3;
const INSET = 28;

function titleSize(text: string): number {
	if (text.length > 60) return 52;
	if (text.length > 40) return 60;
	return 68;
}

function formatDate(iso: string | undefined): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d
		.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
		.toUpperCase();
}

function Frame({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				background: CANVAS,
				display: "flex",
				padding: INSET,
				fontFamily: "Geist Mono",
				color: INK,
			}}
		>
			<div
				style={{
					flex: 1,
					border: `${BORDER}px solid ${INK}`,
					padding: "56px 64px",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{children}
			</div>
		</div>
	);
}

function Wordmark() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
			<div style={{ width: 22, height: 22, background: INK }} />
			<div style={{ fontSize: 16, fontWeight: 500, letterSpacing: 1.5 }}>POLICYSTACK</div>
		</div>
	);
}

function Eyebrow({ text }: { text: string }) {
	if (!text) return null;
	return (
		<div
			style={{
				fontSize: 14,
				letterSpacing: 2,
				color: MUTE,
				textTransform: "uppercase",
			}}
		>
			{text}
		</div>
	);
}

function Title({ text, size }: { text: string; size: number }) {
	return (
		<div
			style={{
				fontSize: size,
				fontWeight: 500,
				lineHeight: 1.1,
				letterSpacing: -1.5,
				color: INK,
				maxWidth: 920,
				display: "flex",
			}}
		>
			{text}
		</div>
	);
}

function Footer({ left }: { left: string }) {
	return (
		<div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
			<div style={{ height: BORDER, background: INK, marginBottom: 20 }} />
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					fontSize: 14,
					color: MUTE,
					letterSpacing: 1.5,
					textTransform: "uppercase",
				}}
			>
				<div>{left}</div>
				<div style={{ width: 18, height: 18, background: INK }} />
			</div>
		</div>
	);
}

export default defineOgTemplate({
	width: 1200,
	height: 630,
	fonts,
	render: ({ data }) => {
		const size = titleSize(data.title);

		if (data.type === "article") {
			const tag = (data.tag ?? "POST").toUpperCase();
			const author = data.author ?? "Jamie Davenport";
			const date = formatDate(data.date);
			const readingTime = data.readingTime ?? "";
			return (
				<Frame>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Wordmark />
						<Eyebrow text="BLOG" />
					</div>
					<div
						style={{
							marginTop: 56,
							display: "flex",
							alignItems: "center",
							gap: 16,
							fontSize: 14,
							color: MUTE,
							letterSpacing: 2,
							textTransform: "uppercase",
						}}
					>
						<span style={{ color: INK }}>{tag}</span>
						<span style={{ width: 32, height: 2, background: INK }} />
						{readingTime ? <span>{readingTime} read</span> : null}
					</div>
					<div style={{ marginTop: 24, display: "flex" }}>
						<Title text={data.title} size={size} />
					</div>
					<Footer left={`${author}  ·  ${date}`} />
				</Frame>
			);
		}

		return (
			<Frame>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Wordmark />
					<Eyebrow text={data.eyebrow ?? ""} />
				</div>
				<div style={{ marginTop: 72, display: "flex", flexDirection: "column" }}>
					<Title text={data.title} size={size} />
				</div>
				<Footer left={data.description ?? ""} />
			</Frame>
		);
	},
});
