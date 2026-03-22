"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";

const STARTERS = [
	"What data do you collect about me?",
	"How can I delete my data?",
	"What are the terms for account termination?",
	"What is the governing law for disputes?",
];

export default function ChatPage() {
	const { messages, sendMessage, status, stop } = useChat({
		transport: new DefaultChatTransport({ api: "/api/chat" }),
	});

	const isStreaming = status === "streaming" || status === "submitted";

	function handleSubmit({ text }: { text: string }) {
		if (!text.trim() || isStreaming) return;
		sendMessage({ text });
	}

	return (
		<div className="flex flex-col h-screen">
			<header className="px-6 py-4 border-b">
				<h1 className="text-xl font-semibold">Legal Assistant</h1>
				<p className="text-sm text-muted-foreground mt-0.5">
					Ask questions about our privacy policy and terms of service
				</p>
			</header>

			<Conversation className="flex-1">
				<ConversationContent>
					{messages.length === 0 && (
						<ConversationEmptyState title="" description="">
							<div className="flex flex-col gap-2 w-full max-w-sm">
								<p className="text-sm text-muted-foreground text-center mb-2">
									Try one of these questions:
								</p>
								{STARTERS.map((q) => (
									<button
										type="button"
										key={q}
										onClick={() => sendMessage({ text: q })}
										className="text-left text-sm px-4 py-2.5 rounded-lg border hover:bg-muted transition-colors"
									>
										{q}
									</button>
								))}
							</div>
						</ConversationEmptyState>
					)}

					{messages.map((msg, i) => {
						const text = msg.parts
							.filter((p) => p.type === "text")
							.map((p) => p.text)
							.join("");
						const isLastAssistant =
							msg.role === "assistant" && i === messages.length - 1;
						return (
							<Message key={msg.id} from={msg.role}>
								<MessageContent>
									<MessageResponse isAnimating={isLastAssistant && isStreaming}>
										{text}
									</MessageResponse>
								</MessageContent>
							</Message>
						);
					})}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<div className="px-4 py-4 border-t">
				<PromptInput onSubmit={handleSubmit}>
					<PromptInputBody>
						<PromptInputTextarea placeholder="Ask about our policies…" />
					</PromptInputBody>
					<PromptInputFooter>
						<PromptInputTools />
						<PromptInputSubmit status={status} onStop={stop} />
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
