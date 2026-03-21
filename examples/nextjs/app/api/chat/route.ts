import { anthropic } from "@ai-sdk/anthropic";
import { compile, expandOpenPolicyConfig } from "@openpolicy/core";
import { renderMarkdown } from "@openpolicy/renderers";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import openpolicy from "../../../openpolicy";

const inputs = expandOpenPolicyConfig(openpolicy);
const policiesMarkdown = inputs
	.map((input) => renderMarkdown(compile(input)))
	.join("\n\n---\n\n");

const SYSTEM_PROMPT = `You are a legal assistant for ${openpolicy.company.name}. \
Answer questions about the following policies clearly and concisely. \
Cite specific sections when relevant. Do not speculate beyond what the policies state.

${policiesMarkdown}`;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	const result = streamText({
		model: anthropic("claude-sonnet-4-6"),
		system: SYSTEM_PROMPT,
		messages: convertToModelMessages(messages),
	});
	return result.toUIMessageStreamResponse();
}
