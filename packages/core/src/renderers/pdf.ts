import PDFDocument from "pdfkit";
import type {
	Document,
	DocumentSection,
	InlineNode,
	ListItemNode,
	ListNode,
} from "../documents/types";

const FONT_REGULAR = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const SIZE_HEADING = 14;
const SIZE_BODY = 11;
const COLOR_BODY = "#374151";
const COLOR_HEADING = "#111827";
const COLOR_LINK = "#2563eb";

function renderInlineNodes(
	doc: InstanceType<typeof PDFDocument>,
	nodes: InlineNode[],
): void {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];
		const continued = i < nodes.length - 1;
		switch (node!.type) {
			case "text":
				doc
					.font(FONT_REGULAR)
					.fillColor(COLOR_BODY)
					.text(node!.value, { continued });
				break;
			case "bold":
				doc
					.font(FONT_BOLD)
					.fillColor(COLOR_HEADING)
					.text(node!.value, { continued });
				break;
			case "link":
				doc
					.font(FONT_REGULAR)
					.fillColor(COLOR_LINK)
					.text(node!.value, { continued, link: node!.href, underline: true });
				doc.fillColor(COLOR_BODY);
				break;
		}
	}
}

function renderListItem(
	doc: InstanceType<typeof PDFDocument>,
	item: ListItemNode,
	depth: number,
): void {
	const indent = doc.page.margins.left + 10 + depth * 15;
	const bullet = depth === 0 ? "•" : "◦";

	const inlineNodes = item.children.filter(
		(c): c is InlineNode => c.type !== "list",
	);
	const nested =
		item.children.find((c): c is ListNode => c.type === "list") ?? null;

	doc
		.font(FONT_REGULAR)
		.fontSize(SIZE_BODY)
		.fillColor(COLOR_BODY)
		.text(`${bullet} `, { continued: true, indent });

	if (inlineNodes.length > 0) {
		renderInlineNodes(doc, inlineNodes);
	} else {
		doc.text("");
	}

	if (nested) {
		for (const child of nested.items) {
			renderListItem(doc, child, depth + 1);
		}
	}
}

function renderSection(
	doc: InstanceType<typeof PDFDocument>,
	section: DocumentSection,
	isFirst: boolean,
): void {
	if (!isFirst) {
		doc.moveDown(0.5);
		doc
			.moveTo(doc.page.margins.left, doc.y)
			.lineTo(doc.page.width - doc.page.margins.right, doc.y)
			.strokeColor("#e5e7eb")
			.lineWidth(0.5)
			.stroke();
		doc.moveDown(0.5);
	}

	for (const node of section.content) {
		switch (node.type) {
			case "heading":
				doc
					.font(FONT_BOLD)
					.fontSize(SIZE_HEADING)
					.fillColor(COLOR_HEADING)
					.text(node.value)
					.moveDown(0.3);
				break;
			case "paragraph":
				doc.font(FONT_REGULAR).fontSize(SIZE_BODY);
				renderInlineNodes(doc, node.children);
				doc.moveDown(0.3);
				break;
			case "list":
				doc.fontSize(SIZE_BODY);
				for (const item of node.items) {
					renderListItem(doc, item, 0);
				}
				doc.moveDown(0.3);
				break;
		}
	}
}

export function renderPDF(document: Document): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const pdf = new PDFDocument({ margin: 50, size: "A4" });
		const chunks: Buffer[] = [];
		pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
		pdf.on("end", () => resolve(Buffer.concat(chunks)));
		pdf.on("error", reject);

		for (let i = 0; i < document.sections.length; i++) {
			renderSection(pdf, document.sections[i]!, i === 0);
		}

		pdf.end();
	});
}
