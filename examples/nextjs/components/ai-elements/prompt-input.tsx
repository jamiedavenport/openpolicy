"use client";

import type { ChatStatus, FileUIPart, SourceDocumentUIPart } from "ai";
import { CornerDownLeftIcon, SquareIcon, XIcon } from "lucide-react";
import { nanoid } from "nanoid";
import type {
	ChangeEvent,
	ChangeEventHandler,
	ClipboardEventHandler,
	ComponentProps,
	FormEvent,
	FormEventHandler,
	HTMLAttributes,
	KeyboardEventHandler,
	RefObject,
} from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// ============================================================================
// Helpers
// ============================================================================

const convertBlobUrlToDataUrl = async (url: string): Promise<string | null> => {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		// FileReader uses callback-based API, wrapping in Promise is necessary
		// oxlint-disable-next-line eslint-plugin-promise(avoid-new)
		return new Promise((resolve) => {
			const reader = new FileReader();
			// oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
			reader.onloadend = () => resolve(reader.result as string);
			// oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};

// ============================================================================
// Provider Context & Types
// ============================================================================

export interface AttachmentsContext {
	files: (FileUIPart & { id: string })[];
	add: (files: File[] | FileList) => void;
	remove: (id: string) => void;
	clear: () => void;
	openFileDialog: () => void;
	fileInputRef: RefObject<HTMLInputElement | null>;
}

export interface TextInputContext {
	value: string;
	setInput: (v: string) => void;
	clear: () => void;
}

export interface PromptInputControllerProps {
	textInput: TextInputContext;
	attachments: AttachmentsContext;
	/** INTERNAL: Allows PromptInput to register its file textInput + "open" callback */
	__registerFileInput: (
		ref: RefObject<HTMLInputElement | null>,
		open: () => void,
	) => void;
}

const PromptInputController = createContext<PromptInputControllerProps | null>(
	null,
);
const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(
	null,
);

// Optional variants (do NOT throw). Useful for dual-mode components.
const useOptionalPromptInputController = () =>
	useContext(PromptInputController);

const useOptionalProviderAttachments = () =>
	useContext(ProviderAttachmentsContext);

// ============================================================================
// Component Context & Hooks
// ============================================================================

const LocalAttachmentsContext = createContext<AttachmentsContext | null>(null);

const usePromptInputAttachments = () => {
	// Prefer local context (inside PromptInput) as it has validation, fall back to provider
	const provider = useOptionalProviderAttachments();
	const local = useContext(LocalAttachmentsContext);
	const context = local ?? provider;
	if (!context) {
		throw new Error(
			"usePromptInputAttachments must be used within a PromptInput or PromptInputProvider",
		);
	}
	return context;
};

// ============================================================================
// Referenced Sources (Local to PromptInput)
// ============================================================================

interface ReferencedSourcesContext {
	sources: (SourceDocumentUIPart & { id: string })[];
	add: (sources: SourceDocumentUIPart[] | SourceDocumentUIPart) => void;
	remove: (id: string) => void;
	clear: () => void;
}

const LocalReferencedSourcesContext =
	createContext<ReferencedSourcesContext | null>(null);

export interface PromptInputMessage {
	text: string;
	files: FileUIPart[];
}

export type PromptInputProps = Omit<
	HTMLAttributes<HTMLFormElement>,
	"onSubmit" | "onError"
> & {
	// e.g., "image/*" or leave undefined for any
	accept?: string;
	multiple?: boolean;
	// When true, accepts drops anywhere on document. Default false (opt-in).
	globalDrop?: boolean;
	// Render a hidden input with given name and keep it in sync for native form posts. Default false.
	syncHiddenInput?: boolean;
	// Minimal constraints
	maxFiles?: number;
	// bytes
	maxFileSize?: number;
	onError?: (err: {
		code: "max_files" | "max_file_size" | "accept";
		message: string;
	}) => void;
	onSubmit: (
		message: PromptInputMessage,
		event: FormEvent<HTMLFormElement>,
	) => void | Promise<void>;
};

export const PromptInput = ({
	className,
	accept,
	multiple,
	globalDrop,
	syncHiddenInput,
	maxFiles,
	maxFileSize,
	onError,
	onSubmit,
	children,
	...props
}: PromptInputProps) => {
	// Try to use a provider controller if present
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;

	// Refs
	const inputRef = useRef<HTMLInputElement | null>(null);
	const formRef = useRef<HTMLFormElement | null>(null);

	// ----- Local attachments (only used when no provider)
	const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
	const files = usingProvider ? controller.attachments.files : items;

	// ----- Local referenced sources (always local to PromptInput)
	const [referencedSources, setReferencedSources] = useState<
		(SourceDocumentUIPart & { id: string })[]
	>([]);

	// Keep a ref to files for cleanup on unmount (avoids stale closure)
	const filesRef = useRef(files);

	useEffect(() => {
		filesRef.current = files;
	}, [files]);

	const openFileDialogLocal = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const matchesAccept = useCallback(
		(f: File) => {
			if (!accept || accept.trim() === "") {
				return true;
			}

			const patterns = accept
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);

			return patterns.some((pattern) => {
				if (pattern.endsWith("/*")) {
					// e.g: image/* -> image/
					const prefix = pattern.slice(0, -1);
					return f.type.startsWith(prefix);
				}
				return f.type === pattern;
			});
		},
		[accept],
	);

	const addLocal = useCallback(
		(fileList: File[] | FileList) => {
			const incoming = [...fileList];
			const accepted = incoming.filter((f) => matchesAccept(f));
			if (incoming.length && accepted.length === 0) {
				onError?.({
					code: "accept",
					message: "No files match the accepted types.",
				});
				return;
			}
			const withinSize = (f: File) =>
				maxFileSize ? f.size <= maxFileSize : true;
			const sized = accepted.filter(withinSize);
			if (accepted.length > 0 && sized.length === 0) {
				onError?.({
					code: "max_file_size",
					message: "All files exceed the maximum size.",
				});
				return;
			}

			setItems((prev) => {
				const capacity =
					typeof maxFiles === "number"
						? Math.max(0, maxFiles - prev.length)
						: undefined;
				const capped =
					typeof capacity === "number" ? sized.slice(0, capacity) : sized;
				if (typeof capacity === "number" && sized.length > capacity) {
					onError?.({
						code: "max_files",
						message: "Too many files. Some were not added.",
					});
				}
				const next: (FileUIPart & { id: string })[] = [];
				for (const file of capped) {
					next.push({
						filename: file.name,
						id: nanoid(),
						mediaType: file.type,
						type: "file",
						url: URL.createObjectURL(file),
					});
				}
				return [...prev, ...next];
			});
		},
		[matchesAccept, maxFiles, maxFileSize, onError],
	);

	const removeLocal = useCallback(
		(id: string) =>
			setItems((prev) => {
				const found = prev.find((file) => file.id === id);
				if (found?.url) {
					URL.revokeObjectURL(found.url);
				}
				return prev.filter((file) => file.id !== id);
			}),
		[],
	);

	// Wrapper that validates files before calling provider's add
	const addWithProviderValidation = useCallback(
		(fileList: File[] | FileList) => {
			const incoming = [...fileList];
			const accepted = incoming.filter((f) => matchesAccept(f));
			if (incoming.length && accepted.length === 0) {
				onError?.({
					code: "accept",
					message: "No files match the accepted types.",
				});
				return;
			}
			const withinSize = (f: File) =>
				maxFileSize ? f.size <= maxFileSize : true;
			const sized = accepted.filter(withinSize);
			if (accepted.length > 0 && sized.length === 0) {
				onError?.({
					code: "max_file_size",
					message: "All files exceed the maximum size.",
				});
				return;
			}

			const currentCount = files.length;
			const capacity =
				typeof maxFiles === "number"
					? Math.max(0, maxFiles - currentCount)
					: undefined;
			const capped =
				typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) {
				onError?.({
					code: "max_files",
					message: "Too many files. Some were not added.",
				});
			}

			if (capped.length > 0) {
				controller?.attachments.add(capped);
			}
		},
		[matchesAccept, maxFileSize, maxFiles, onError, files.length, controller],
	);

	const clearAttachments = useCallback(
		() =>
			usingProvider
				? controller?.attachments.clear()
				: setItems((prev) => {
						for (const file of prev) {
							if (file.url) {
								URL.revokeObjectURL(file.url);
							}
						}
						return [];
					}),
		[usingProvider, controller],
	);

	const clearReferencedSources = useCallback(
		() => setReferencedSources([]),
		[],
	);

	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider
		? controller.attachments.openFileDialog
		: openFileDialogLocal;

	const clear = useCallback(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);

	// Let provider know about our hidden file input so external menus can call openFileDialog()
	useEffect(() => {
		if (!usingProvider) {
			return;
		}
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);

	// Note: File input cannot be programmatically set for security reasons
	// The syncHiddenInput prop is no longer functional
	useEffect(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) {
			inputRef.current.value = "";
		}
	}, [files, syncHiddenInput]);

	// Attach drop handlers on nearest form and document (opt-in)
	useEffect(() => {
		const form = formRef.current;
		if (!form) {
			return;
		}
		if (globalDrop) {
			// when global drop is on, let the document-level handler own drops
			return;
		}

		const onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
		};
		const onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				add(e.dataTransfer.files);
			}
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);

	useEffect(() => {
		if (!globalDrop) {
			return;
		}

		const onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
		};
		const onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) {
				e.preventDefault();
			}
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				add(e.dataTransfer.files);
			}
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);

	useEffect(
		() => () => {
			if (!usingProvider) {
				for (const f of filesRef.current) {
					if (f.url) {
						URL.revokeObjectURL(f.url);
					}
				}
			}
		},
		[usingProvider],
	);

	const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.currentTarget.files) {
				add(event.currentTarget.files);
			}
			// Reset input value to allow selecting files that were previously removed
			event.currentTarget.value = "";
		},
		[add],
	);

	const attachmentsCtx = useMemo<AttachmentsContext>(
		() => ({
			add,
			clear: clearAttachments,
			fileInputRef: inputRef,
			files: files.map((item) => ({ ...item, id: item.id })),
			openFileDialog,
			remove,
		}),
		[files, add, remove, clearAttachments, openFileDialog],
	);

	const refsCtx = useMemo<ReferencedSourcesContext>(
		() => ({
			add: (incoming: SourceDocumentUIPart[] | SourceDocumentUIPart) => {
				const array = Array.isArray(incoming) ? incoming : [incoming];
				setReferencedSources((prev) => [
					...prev,
					...array.map((s) => ({ ...s, id: nanoid() })),
				]);
			},
			clear: clearReferencedSources,
			remove: (id: string) => {
				setReferencedSources((prev) => prev.filter((s) => s.id !== id));
			},
			sources: referencedSources,
		}),
		[referencedSources, clearReferencedSources],
	);

	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		async (event) => {
			event.preventDefault();

			const form = event.currentTarget;
			const text = usingProvider
				? controller.textInput.value
				: (() => {
						const formData = new FormData(form);
						return (formData.get("message") as string) || "";
					})();

			// Reset form immediately after capturing text to avoid race condition
			// where user input during async blob conversion would be lost
			if (!usingProvider) {
				form.reset();
			}

			try {
				// Convert blob URLs to data URLs asynchronously
				const convertedFiles: FileUIPart[] = await Promise.all(
					files.map(async ({ id: _id, ...item }) => {
						if (item.url?.startsWith("blob:")) {
							const dataUrl = await convertBlobUrlToDataUrl(item.url);
							// If conversion failed, keep the original blob URL
							return {
								...item,
								url: dataUrl ?? item.url,
							};
						}
						return item;
					}),
				);

				const result = onSubmit({ files: convertedFiles, text }, event);

				// Handle both sync and async onSubmit
				if (result instanceof Promise) {
					try {
						await result;
						clear();
						if (usingProvider) {
							controller.textInput.clear();
						}
					} catch {
						// Don't clear on error - user may want to retry
					}
				} else {
					// Sync function completed without throwing, clear inputs
					clear();
					if (usingProvider) {
						controller.textInput.clear();
					}
				}
			} catch {
				// Don't clear on error - user may want to retry
			}
		},
		[usingProvider, controller, files, onSubmit, clear],
	);

	// Render with or without local provider
	const inner = (
		<>
			<input
				accept={accept}
				aria-label="Upload files"
				className="hidden"
				multiple={multiple}
				onChange={handleChange}
				ref={inputRef}
				title="Upload files"
				type="file"
			/>
			<form
				className={cn("w-full", className)}
				onSubmit={handleSubmit}
				ref={formRef}
				{...props}
			>
				<InputGroup className="overflow-hidden">{children}</InputGroup>
			</form>
		</>
	);

	const withReferencedSources = (
		<LocalReferencedSourcesContext.Provider value={refsCtx}>
			{inner}
		</LocalReferencedSourcesContext.Provider>
	);

	// Always provide LocalAttachmentsContext so children get validated add function
	return (
		<LocalAttachmentsContext.Provider value={attachmentsCtx}>
			{withReferencedSources}
		</LocalAttachmentsContext.Provider>
	);
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({
	className,
	...props
}: PromptInputBodyProps) => (
	<div className={cn("contents", className)} {...props} />
);

export type PromptInputTextareaProps = ComponentProps<
	typeof InputGroupTextarea
>;

export const PromptInputTextarea = ({
	onChange,
	onKeyDown,
	className,
	placeholder = "What would you like to know?",
	...props
}: PromptInputTextareaProps) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = useState(false);

	const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
		(e) => {
			// Call the external onKeyDown handler first
			onKeyDown?.(e);

			// If the external handler prevented default, don't run internal logic
			if (e.defaultPrevented) {
				return;
			}

			if (e.key === "Enter") {
				if (isComposing || e.nativeEvent.isComposing) {
					return;
				}
				if (e.shiftKey) {
					return;
				}
				e.preventDefault();

				// Check if the submit button is disabled before submitting
				const { form } = e.currentTarget;
				const submitButton = form?.querySelector(
					'button[type="submit"]',
				) as HTMLButtonElement | null;
				if (submitButton?.disabled) {
					return;
				}

				form?.requestSubmit();
			}

			// Remove last attachment when Backspace is pressed and textarea is empty
			if (
				e.key === "Backspace" &&
				e.currentTarget.value === "" &&
				attachments.files.length > 0
			) {
				e.preventDefault();
				const lastAttachment = attachments.files.at(-1);
				if (lastAttachment) {
					attachments.remove(lastAttachment.id);
				}
			}
		},
		[onKeyDown, isComposing, attachments],
	);

	const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = useCallback(
		(event) => {
			const items = event.clipboardData?.items;

			if (!items) {
				return;
			}

			const files: File[] = [];

			for (const item of items) {
				if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) {
						files.push(file);
					}
				}
			}

			if (files.length > 0) {
				event.preventDefault();
				attachments.add(files);
			}
		},
		[attachments],
	);

	const handleCompositionEnd = useCallback(() => setIsComposing(false), []);
	const handleCompositionStart = useCallback(() => setIsComposing(true), []);

	const controlledProps = controller
		? {
				onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
					controller.textInput.setInput(e.currentTarget.value);
					onChange?.(e);
				},
				value: controller.textInput.value,
			}
		: {
				onChange,
			};

	return (
		<InputGroupTextarea
			className={cn("field-sizing-content max-h-48 min-h-16", className)}
			name="message"
			onCompositionEnd={handleCompositionEnd}
			onCompositionStart={handleCompositionStart}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}
			placeholder={placeholder}
			{...props}
			{...controlledProps}
		/>
	);
};

export type PromptInputFooterProps = Omit<
	ComponentProps<typeof InputGroupAddon>,
	"align"
>;

export const PromptInputFooter = ({
	className,
	...props
}: PromptInputFooterProps) => (
	<InputGroupAddon
		align="block-end"
		className={cn("justify-between gap-1", className)}
		{...props}
	/>
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
	className,
	...props
}: PromptInputToolsProps) => (
	<div
		className={cn("flex min-w-0 items-center gap-1", className)}
		{...props}
	/>
);

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
	status?: ChatStatus;
	onStop?: () => void;
};

export const PromptInputSubmit = ({
	className,
	variant = "default",
	size = "icon-sm",
	status,
	onStop,
	onClick,
	children,
	...props
}: PromptInputSubmitProps) => {
	const isGenerating = status === "submitted" || status === "streaming";

	let Icon = <CornerDownLeftIcon className="size-4" />;

	if (status === "submitted") {
		Icon = <Spinner />;
	} else if (status === "streaming") {
		Icon = <SquareIcon className="size-4" />;
	} else if (status === "error") {
		Icon = <XIcon className="size-4" />;
	}

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (isGenerating && onStop) {
				e.preventDefault();
				onStop();
				return;
			}
			onClick?.(e);
		},
		[isGenerating, onStop, onClick],
	);

	return (
		<InputGroupButton
			aria-label={isGenerating ? "Stop" : "Submit"}
			className={cn(className)}
			onClick={handleClick}
			size={size}
			type={isGenerating && onStop ? "button" : "submit"}
			variant={variant}
			{...props}
		>
			{children ?? Icon}
		</InputGroupButton>
	);
};
