import { describe, it, expect } from "vitest";
import {
  buildUserPrompt,
  parseModelResponse,
  mockSummary,
  SYSTEM_PROMPT,
} from "./summarizer.js";

describe("buildUserPrompt", () => {
  it("includes the raw notes", () => {
    const prompt = buildUserPrompt("Discussed roadmap");
    expect(prompt).toContain("Discussed roadmap");
  });
});

describe("SYSTEM_PROMPT", () => {
  it("instructs JSON-only output", () => {
    expect(SYSTEM_PROMPT).toContain("valid JSON");
  });
});

describe("parseModelResponse", () => {
  it("parses clean JSON", () => {
    const raw = JSON.stringify({
      summary: "We agreed on the plan.",
      decisions: ["Ship v1"],
      actionItems: ["Alex to write spec"],
    });
    const result = parseModelResponse(raw);
    expect(result.summary).toBe("We agreed on the plan.");
    expect(result.decisions).toEqual(["Ship v1"]);
    expect(result.actionItems).toEqual(["Alex to write spec"]);
  });

  it("tolerates code-fenced JSON", () => {
    const raw = '```json\n{"summary":"S","decisions":[],"actionItems":[]}\n```';
    const result = parseModelResponse(raw);
    expect(result.summary).toBe("S");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseModelResponse("not json")).toThrow();
  });

  it("throws when summary is missing", () => {
    const raw = JSON.stringify({ decisions: [], actionItems: [] });
    expect(() => parseModelResponse(raw)).toThrow();
  });

  it("filters non-string array items", () => {
    const raw = JSON.stringify({
      summary: "S",
      decisions: ["ok", 5, null],
      actionItems: [],
    });
    const result = parseModelResponse(raw);
    expect(result.decisions).toEqual(["ok"]);
  });
});

describe("mockSummary", () => {
  it("returns a mocked result flagged as mocked with a default notice", () => {
    const result = mockSummary("Kickoff meeting about the new pipeline");
    expect(result.mocked).toBe(true);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.actionItems.length).toBeGreaterThan(0);
    expect(result.notice).toContain("ANTHROPIC_API_KEY");
  });

  it("uses a custom notice when provided", () => {
    const result = mockSummary("notes", "rate limit exceeded");
    expect(result.notice).toBe("rate limit exceeded");
  });
});
