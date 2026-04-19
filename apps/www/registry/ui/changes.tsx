import type { Change } from "@openpolicy/plus";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";

type Props = {
	changes: Change[];
	onApprove: () => void;
};

const policyOrder = ["privacy", "cookie"] as const;

const policyLabel: Record<Change["policy"], string> = {
	privacy: "Privacy Policy",
	cookie: "Cookie Policy",
};

const badgeClass: Record<Change["type"], string> = {
	added: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	removed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	modified:
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export function ChangesNotification({ changes, onApprove }: Props) {
	const [dismissed, setDismissed] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	if (changes.length === 0 || dismissed) return null;

	const grouped = changes.reduce<Partial<Record<Change["policy"], Change[]>>>(
		(acc, c) => {
			// biome-ignore lint/suspicious/noAssignInExpressions: todo
			(acc[c.policy] ??= []).push(c);
			return acc;
		},
		{},
	);

	return (
		<>
			<Card
				role="status"
				aria-live="polite"
				className={cn(
					"fixed bottom-4 left-4 z-50 w-sm animate-in fade-in-0 zoom-in-95 outline-none",
				)}
			>
				<CardHeader>
					<CardTitle>Your policies have been updated</CardTitle>
					<CardDescription>
						{changes.length} section{changes.length !== 1 ? "s" : ""} changed
						across your policy documents.
					</CardDescription>
				</CardHeader>
				<CardFooter className="gap-2">
					<Button onClick={() => setDialogOpen(true)}>Review changes</Button>
					<Button variant="outline" onClick={() => setDismissed(true)}>
						Dismiss
					</Button>
				</CardFooter>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Policy Updates</DialogTitle>
						<DialogDescription>
							Review the sections that have changed and approve to continue.
						</DialogDescription>
					</DialogHeader>

					<div className="max-h-[60vh] space-y-4 overflow-y-auto">
						{policyOrder.map((policy) => {
							const policyChanges = grouped[policy];
							if (!policyChanges?.length) return null;
							return (
								<div key={policy}>
									<p className="mb-2 text-sm font-semibold">
										{policyLabel[policy]}
									</p>
									<ul className="space-y-1.5">
										{policyChanges.map((c) => (
											<li
												key={c.sectionId}
												className="flex items-center gap-2 text-sm"
											>
												<span
													className={cn(
														"inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
														badgeClass[c.type],
													)}
												>
													{c.type}
												</span>
												<span className="text-muted-foreground">
													{c.sectionTitle}
												</span>
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								onApprove();
								setDialogOpen(false);
							}}
						>
							Approve &amp; accept
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
