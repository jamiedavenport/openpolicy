export interface ComparisonRow {
	feature: string;
	openpolicy: string;
	competitor: string;
}

export interface Narrative {
	heading: string;
	body: string;
}

export interface Comparison {
	slug: string;
	competitor: string;
	tagline: string;
	verdict: string;
	rows: ComparisonRow[];
	narrative: Narrative[];
}

export interface HomepageRow {
	feature: string;
	openpolicy: string;
	lawyers: string;
	templates: string;
	termly: string;
	iubenda: string;
}

export const comparisons: Comparison[] = [
	{
		slug: "lawyers",
		competitor: "Lawyers",
		tagline: "OpenPolicy vs hiring a lawyer",
		verdict:
			"Get correct, up-to-date policies in minutes — not weeks — without a $3,000 invoice.",
		rows: [
			{
				feature: "Time to first policy",
				openpolicy: "Minutes",
				competitor: "Days to weeks",
			},
			{
				feature: "Cost",
				openpolicy: "Free (open source)",
				competitor: "$500–$5,000+",
			},
			{
				feature: "Updates as product changes",
				openpolicy: "✓ Automatic on every build",
				competitor: "Manual re-engagement",
			},
			{
				feature: "Version controlled in Git",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "TypeScript type safety",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "GDPR & CCPA coverage",
				openpolicy: "✓",
				competitor: "✓",
			},
			{
				feature: "Multi-format output",
				openpolicy: "Markdown, HTML, PDF",
				competitor: "Word / PDF only",
			},
			{
				feature: "Integrates with CI/CD",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Self-hostable",
				openpolicy: "✓",
				competitor: "N/A",
			},
		],
		narrative: [
			{
				heading: "The cost problem",
				body: "A lawyer-drafted privacy policy or terms of service typically costs $500–$5,000 upfront, and that's before revisions. When your product changes — new data types, new features, new markets — you pay again. For early-stage teams, this compounds fast.",
			},
			{
				heading: "The maintenance problem",
				body: "Lawyers deliver a document. They don't integrate with your build pipeline. When you add a new analytics provider or launch in Germany, your policy is already out of date — and you might not notice for months. OpenPolicy regenerates on every build, so your policy stays in sync automatically.",
			},
			{
				heading: "When to use a lawyer anyway",
				body: "For high-stakes situations — a Series A, an acquisition, a regulatory inquiry — a lawyer's review is irreplaceable. OpenPolicy is not legal advice. But for the 90% of developer products that need correct, up-to-date policies without the overhead, it's the right default.",
			},
		],
	},
	{
		slug: "templates",
		competitor: "Templates",
		tagline: "OpenPolicy vs generic policy templates",
		verdict:
			"Templates are static documents that go stale. OpenPolicy generates policies from your actual configuration — so they stay accurate as your product evolves.",
		rows: [
			{
				feature: "Stays in sync with your product",
				openpolicy: "✓ Regenerated on every build",
				competitor: "✗ Manual updates",
			},
			{
				feature: "Type-safe configuration",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Catches missing required fields",
				openpolicy: "✓ At compile time",
				competitor: "✗",
			},
			{
				feature: "Version controlled in Git",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Multi-format output",
				openpolicy: "Markdown, HTML, PDF",
				competitor: "Word / PDF only",
			},
			{
				feature: "GDPR & CCPA coverage",
				openpolicy: "✓",
				competitor: "Varies",
			},
			{
				feature: "Framework integration",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Cost",
				openpolicy: "Free",
				competitor: "Free to $50+",
			},
		],
		narrative: [
			{
				heading: "Templates are a snapshot, not a system",
				body: "A template gives you a document that was correct when it was written. From that point on, it's your responsibility to keep it accurate. Add a new third-party service? Change your data retention period? Expand to the EU? The template doesn't know — and neither does anything in your build pipeline.",
			},
			{
				heading: "Type safety catches what you'd otherwise miss",
				body: "OpenPolicy's TypeScript config means your editor tells you when a required field is missing before you ship. Templates have no equivalent — it's just text with placeholders, and a missed placeholder means a broken policy.",
			},
			{
				heading: "One config, multiple outputs",
				body: "Templates produce one document. OpenPolicy produces Markdown, HTML, and PDF from the same config, integrates with your framework at build time, and keeps everything in version control. It's the difference between a static file and a living part of your codebase.",
			},
		],
	},
	{
		slug: "termly",
		competitor: "Termly",
		tagline: "OpenPolicy vs Termly",
		verdict:
			"Termly is built for non-technical users managing policies through a dashboard. OpenPolicy is built for developers who want policies in their codebase — not a SaaS subscription.",
		rows: [
			{
				feature: "Developer-native workflow",
				openpolicy: "✓ Code, Git, CI",
				competitor: "✗ Dashboard only",
			},
			{
				feature: "Version controlled in Git",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "TypeScript config",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Output format",
				openpolicy: "Markdown, HTML, PDF",
				competitor: "Hosted page only",
			},
			{
				feature: "Self-hostable",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Open source",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "GDPR & CCPA coverage",
				openpolicy: "✓",
				competitor: "✓",
			},
			{
				feature: "Pricing",
				openpolicy: "Free",
				competitor: "$10–$30+/mo",
			},
			{
				feature: "Framework integration",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Works offline / in CI",
				openpolicy: "✓",
				competitor: "✗",
			},
		],
		narrative: [
			{
				heading: "Dashboard vs codebase",
				body: "Termly is a web app. You log in, fill out forms, and get a hosted policy page. That's fine for a non-technical founder — but for a developer, it means your policies live outside your codebase, outside your version control, and outside your deployment pipeline. OpenPolicy puts them back where they belong.",
			},
			{
				heading: "No lock-in",
				body: "With Termly, your policy is hosted on Termly's servers. If you cancel, the page goes away. OpenPolicy generates static files — Markdown, HTML, or PDF — that you own and can deploy anywhere. Nothing depends on a third-party service staying online.",
			},
			{
				heading: "The subscription math",
				body: "Termly's paid plans start around $10–$30/month per site. For a team with multiple products, that compounds quickly. OpenPolicy is open source and free to use — you only pay for the infrastructure you already have.",
			},
		],
	},
	{
		slug: "iubenda",
		competitor: "iubenda",
		tagline: "OpenPolicy vs iubenda",
		verdict:
			"iubenda is a compliance SaaS aimed at non-technical users. OpenPolicy gives developers the same legal coverage — as code, in their repo, with no monthly fee.",
		rows: [
			{
				feature: "Developer-native workflow",
				openpolicy: "✓ Code, Git, CI",
				competitor: "✗ Dashboard only",
			},
			{
				feature: "Version controlled in Git",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Output format",
				openpolicy: "Markdown, HTML, PDF",
				competitor: "Hosted widget only",
			},
			{
				feature: "Self-hostable",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Open source",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "GDPR & CCPA coverage",
				openpolicy: "✓",
				competitor: "✓",
			},
			{
				feature: "Works without external CDN",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "TypeScript config",
				openpolicy: "✓",
				competitor: "✗",
			},
			{
				feature: "Pricing",
				openpolicy: "Free",
				competitor: "$27–$129+/yr",
			},
			{
				feature: "Framework integration",
				openpolicy: "✓",
				competitor: "✗",
			},
		],
		narrative: [
			{
				heading: "Your policy is a widget on their server",
				body: "iubenda's primary model is an embedded widget — your policy is fetched from iubenda's CDN and rendered on your page. That means your compliance documentation has a runtime dependency on a third-party service. If iubenda has an outage, your privacy page does too. OpenPolicy generates static output that you deploy with your app.",
			},
			{
				heading: "Code, not forms",
				body: "iubenda works through a web interface where you pick clauses from a list. It works, but it's a fundamentally non-developer experience — no version history, no PR review, no type safety. OpenPolicy is configured in TypeScript, reviewed in pull requests, and regenerated on every build.",
			},
			{
				heading: "Comparable coverage, no subscription",
				body: "iubenda's pricing scales with the number of sites and features — reasonable for a law firm managing dozens of clients, less so for a developer building one product. OpenPolicy covers GDPR, CCPA, and multi-jurisdiction requirements out of the box, for free.",
			},
		],
	},
];

export const homepageRows: HomepageRow[] = [
	{
		feature: "Developer workflow (Git, TypeScript, CI)",
		openpolicy: "✓",
		lawyers: "✗",
		templates: "✗",
		termly: "✗",
		iubenda: "✗",
	},
	{
		feature: "Version controlled",
		openpolicy: "✓",
		lawyers: "✗",
		templates: "✗",
		termly: "✗",
		iubenda: "✗",
	},
	{
		feature: "Markdown / HTML / PDF output",
		openpolicy: "✓",
		lawyers: "PDF only",
		templates: "Word / PDF",
		termly: "Hosted page",
		iubenda: "Hosted widget",
	},
	{
		feature: "GDPR + CCPA coverage",
		openpolicy: "✓",
		lawyers: "✓",
		templates: "Varies",
		termly: "✓",
		iubenda: "✓",
	},
	{
		feature: "Always in sync with codebase",
		openpolicy: "✓",
		lawyers: "✗",
		templates: "✗",
		termly: "✗",
		iubenda: "✗",
	},
	{
		feature: "No ongoing subscription",
		openpolicy: "✓",
		lawyers: "✗",
		templates: "✓",
		termly: "✗",
		iubenda: "✗",
	},
	{
		feature: "Self-hostable / open source",
		openpolicy: "✓",
		lawyers: "—",
		templates: "—",
		termly: "✗",
		iubenda: "✗",
	},
	{
		feature: "Framework integration",
		openpolicy: "✓",
		lawyers: "✗",
		templates: "✗",
		termly: "✗",
		iubenda: "✗",
	},
];
