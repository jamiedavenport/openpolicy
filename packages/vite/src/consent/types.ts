export type CookieKind =
	| "document.cookie"
	| "js-cookie"
	| "cookies-next"
	| "react-cookie"
	| "next-headers"
	| "set-cookie-header";

export type Cookie = {
	file: string;
	line: number;
	column: number;
	kind: CookieKind;
	name?: string;
	vendor?: string;
};

export type VendorVia = "import" | "global" | "script-url";

export type VendorHit = {
	file: string;
	line: number;
	column: number;
	vendor: string;
	category: string;
	via: VendorVia;
};

export type Hit = Cookie | VendorHit;

export type Ungated = {
	file: string;
	line: number;
	reason: "cookie-outside-gate" | "vendor-outside-gate";
	hit: Hit;
};

export type ScanResult = {
	cookies: Cookie[];
	vendors: VendorHit[];
	ungated: Ungated[];
};

export type VendorEntry = {
	vendor: string;
	category: string;
	imports?: string[];
	globals?: string[];
	scriptUrls?: string[];
};

export type VendorRegistry = VendorEntry[];

export type Lang = "js" | "jsx" | "ts" | "tsx";

export type ImportInfo = {
	source: string;
	imported: string;
};

export type ParsedFile = {
	file: string;
	source: string;
	lang: Lang;
	ast: AnyNode;
	comments: ParsedComment[];
	lineOffset: number;
	localBindings: Set<string>;
	imports: Map<string, ImportInfo>;
};

export type ParsedComment = {
	type: "Line" | "Block";
	value: string;
	line: number;
};

export type AnyNode = {
	type: string;
	start: number;
	end: number;
	[key: string]: unknown;
};

export type VisitContext = {
	file: string;
	source: string;
	node: AnyNode;
	parents: AnyNode[];
	lineOffset: number;
	registry: VendorRegistry;
	localBindings: Set<string>;
	imports: Map<string, ImportInfo>;
	report: (hit: Hit) => void;
	position: (offset: number) => { line: number; column: number };
};

export type Rule = {
	name: string;
	visit: (ctx: VisitContext) => void;
};

export type ScanOptions = {
	cwd: string;
	include?: string[];
	exclude?: string[];
	rules?: Rule[];
	vendors?: VendorRegistry;
	concurrency?: number;
};
