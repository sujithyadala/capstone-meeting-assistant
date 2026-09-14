import { mockSummary, type SummaryResult } from "./summarizer.js";
import { callClaude } from "./claude.js";
import { callGemini } from "./gemini.js";

export type Provider = "gemini" | "anthropic" | "none";

/**
 * Picks the AI provider: honours AI_PROVIDER if its key is set, otherwise
 * prefers Gemini (free), then Anthropic, then none (mock mode).
 */
export function selectProvider(): Provider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

  if (explicit === "gemini" && hasGemini) return "gemini";
  if (explicit === "anthropic" && hasAnthropic) return "anthropic";
  if (hasGemini) return "gemini";
  if (hasAnthropic) return "anthropic";
  return "none";
}

/** Reads an HTTP-like status from a provider error, if present. */
function statusOf(err: unknown): number | undefined {
  const s = (err as { status?: unknown })?.status;
  return typeof s === "number" ? s : undefined;
}

/** Maps a failed AI call to a user-friendly notice for the fallback result. */
export function noticeForError(err: unknown): string {
  const status = statusOf(err);
  const message = err instanceof Error ? err.message : String(err);

  if (/credit balance is too low|purchase credits|plans\s*&?\s*billing/i.test(message)) {
    return "The AI account has no credits \u2014 showing sample output. Add billing/credits in the provider console.";
  }
  if (/quota|resource_exhausted/i.test(message) || status === 429) {
    return "The AI quota or rate limit was reached \u2014 showing sample output. Please try again shortly.";
  }
  if (/api key not valid|invalid api key|unauthenticated|permission/i.test(message) || status === 401 || status === 403) {
    return "The AI API key was rejected \u2014 showing sample output. Check your key.";
  }
  if (status === 529 || status === 503) {
    return "The AI service is temporarily overloaded \u2014 showing sample output. Please try again shortly.";
  }
  if (status && status >= 500) {
    return "The AI service had an error \u2014 showing sample output. Please try again shortly.";
  }
  if (/timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND|fetch failed/i.test(message)) {
    return "Could not reach the AI service \u2014 showing sample output. Please check the connection.";
  }
  return "The AI service is unavailable \u2014 showing sample output. Please try again.";
}

/**
 * Summarizes notes using the selected provider. Falls back to a deterministic
 * mock when no key is configured OR when the real call fails, so the app never
 * hard-fails and always returns usable output.
 */
export async function summarizeNotes(notes: string): Promise<SummaryResult> {
  const provider = selectProvider();
  if (provider === "none") {
    return mockSummary(notes);
  }

  try {
    const parsed =
      provider === "gemini" ? await callGemini(notes) : await callClaude(notes);
    return { ...parsed, mocked: false };
  } catch (err) {
    console.error(`${provider} call failed, falling back to sample output:`, err);
    return mockSummary(notes, noticeForError(err));
  }
}
