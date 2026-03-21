"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STARTERS = [
	"What data do you collect about me?",
	"How can I delete my data?",
	"What are the terms for account termination?",
	"What is the governing law for disputes?",
];

export default function ChatPage() {
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({ api: "/api/chat" }),
	});
	const [input, setInput] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);
	const isStreaming = status === "streaming";

	// biome-ignore lint/correctness/useExhaustiveDependencies: oki
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	function submit(text: string) {
		if (!text.trim() || isStreaming) return;
		sendMessage({ text });
		setInput("");
	}

	return (
		<div className="flex flex-col h-screen max-w-2xl mx-auto">
			<header className="px-6 py-4 border-b">
				<h1 className="text-xl font-semibold">Legal Assistant</h1>
				<p className="text-sm text-muted-foreground mt-0.5">
					Ask questions about our privacy policy and terms of service
				</p>
			</header>

			<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
				{messages.length === 0 && (
					<div className="pt-8">
						<p className="text-sm text-muted-foreground text-center mb-4">
							Try one of these questions:
						</p>
						<div className="flex flex-col gap-2">
							{STARTERS.map((q) => (
								<button
									type="button"
									key={q}
									onClick={() => submit(q)}
									className="text-left text-sm px-4 py-2.5 rounded-lg border hover:bg-muted transition-colors"
								>
									{q}
								</button>
							))}
						</div>
					</div>
				)}

				{messages.map((msg) => {
					const isUser = msg.role === "user";
					const text = msg.parts
						.filter((p) => p.type === "text")
						.map((p) => p.text)
						.join("");
					return (
						<div
							key={msg.id}
							className={cn("flex", isUser ? "justify-end" : "justify-start")}
						>
							<div
								className={cn(
									"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
									isUser
										? "bg-primary text-primary-foreground rounded-br-sm"
										: "bg-muted text-foreground rounded-bl-sm",
								)}
							>
								<p className="whitespace-pre-wrap">{text}</p>
							</div>
						</div>
					);
				})}

				{isStreaming && (
					<div className="flex justify-start">
						<div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
							<span className="flex gap-1 items-center">
								<span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
								<span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
								<span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
							</span>
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					submit(input);
				}}
				className="px-6 py-4 border-t flex gap-2"
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask about our policies…"
					disabled={isStreaming}
					className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
				/>
				<Button type="submit" disabled={!input.trim() || isStreaming}>
					Send
				</Button>
			</form>
		</div>
	);
}
