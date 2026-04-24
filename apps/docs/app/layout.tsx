import { Banner } from "fumadocs-ui/components/banner";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Inter } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>
					<Banner id="not-legal-advice" height="2.5rem">
						<span className="text-xs">
							OpenPolicy generates policy documents from your config — it does not provide legal
							advice. Have a lawyer review your policies before publication.{" "}
							<a href="https://openpolicy.sh/legal-notice" className="underline hover:no-underline">
								Legal notice
							</a>
						</span>
					</Banner>
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
