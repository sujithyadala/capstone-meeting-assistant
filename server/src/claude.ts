import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseModelResponse,
  type SummaryResult,
} from "./summarizer.js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

/** Calls the Anthropic Claude API to summarize notes. Throws on failure (caller handles fallback). */
export async function callClaude(
  notes: string
): Promise<Omit<SummaryResult, "mocked" | "notice">> {
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(notes) }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return parseModelResponse(text);
}
