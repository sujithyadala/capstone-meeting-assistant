export interface SummaryResult {
  summary: string;
  decisions: string[];
  actionItems: string[];
  mocked: boolean;
  /** When mocked, explains why (no key, rate limit, AI unavailable, etc.). */
  notice?: string;
}

export const SYSTEM_PROMPT =
  "You are a precise meeting-notes assistant. Given raw meeting notes, you extract a concise " +
  "summary, the key decisions made, and clear action items. Respond ONLY with valid JSON of the " +
  'shape: { "summary": string, "decisions": string[], "actionItems": string[] }. ' +
  "Do not include any prose outside the JSON. Keep the summary to 2-4 sentences. Each action item " +
  "should start with a verb and, where possible, name the owner.";

export function buildUserPrompt(notes: string): string {
  return `Here are the raw meeting notes. Extract the summary, decisions, and action items.\n\n${notes}`;
}

/**
 * Parses the model's JSON response into a typed result.
 * Tolerates the model wrapping JSON in code fences.
 */
export function parseModelResponse(raw: string): Omit<SummaryResult, "mocked"> {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response was not valid JSON.");
  }
  const obj = data as Record<string, unknown>;
  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const decisions = Array.isArray(obj.decisions)
    ? obj.decisions.filter((d): d is string => typeof d === "string")
    : [];
  const actionItems = Array.isArray(obj.actionItems)
    ? obj.actionItems.filter((a): a is string => typeof a === "string")
    : [];

  if (!summary) {
    throw new Error("The AI response did not contain a summary.");
  }
  return { summary, decisions, actionItems };
}

/** Deterministic mock used when the real AI is unavailable. */
export function mockSummary(notes: string, notice?: string): SummaryResult {
  const firstLine = notes.split("\n").map((l) => l.trim()).find(Boolean) ?? "the meeting";
  return {
    summary:
      `Sample summary: the team discussed ${firstLine.slice(0, 80)}. ` +
      "This is placeholder output.",
    decisions: [
      "Proceed with the proposed approach (sample).",
      "Revisit open questions next week (sample).",
    ],
    actionItems: [
      "Owner: Alex \u2014 draft the first version by Friday (sample).",
      "Owner: Sam \u2014 schedule the follow-up meeting (sample).",
    ],
    mocked: true,
    notice: notice ?? "No ANTHROPIC_API_KEY configured \u2014 showing sample output.",
  };
}
