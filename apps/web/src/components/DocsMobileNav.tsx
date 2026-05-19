import { useEffect, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { DocsSidebar } from "./DocsSidebar";

export function DocsMobileNav({ activeSlug }: { activeSlug: string }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	useEffect(() => {
		setOpen(false);
	}, [activeSlug]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-2 border-2 border-black bg-canvas px-4 py-2 text-xs tracking-wide uppercase hover:bg-ink hover:text-canvas lg:hidden"
				aria-expanded={open}
				aria-controls="docs-mobile-nav"
			>
				<ListIcon weight="bold" className="size-3.5 shrink-0" aria-hidden="true" />
				Docs menu
			</button>

			{open && (
				<div
					id="docs-mobile-nav"
					role="dialog"
					aria-modal="true"
					aria-label="Documentation navigation"
					className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden"
				>
					<div className="flex items-center justify-between border-b-2 border-black px-6 py-4">
						<span className="text-xs tracking-wide text-mute uppercase">Documentation</span>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="inline-flex items-center gap-2 text-xs tracking-wide uppercase hover:text-mute"
							aria-label="Close menu"
						>
							<XIcon weight="bold" className="size-4 shrink-0" aria-hidden="true" />
							Close
						</button>
					</div>
					<div className="flex-1 overflow-y-auto py-4">
						<DocsSidebar activeSlug={activeSlug} />
					</div>
				</div>
			)}
		</>
	);
}
