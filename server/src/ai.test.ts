import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { noticeForError, selectProvider } from "./ai.js";

function apiError(status: number, message = "error"): Anthropic.APIError {
  return new Anthropic.APIError(status, undefined, message, undefined);
}

describe("noticeForError", () => {
  it("flags low credit balance on the billing message", () => {
    const err = apiError(400, "Your credit balance is too low to access the Anthropic API.");
    expect(noticeForError(err)).toMatch(/credits/i);
  });

  it("flags quota/rate limit on 429 or quota message", () => {
    expect(noticeForError(apiError(429))).toMatch(/quota or rate limit/i);
    expect(noticeForError(new Error("Resource has been exhausted (quota)"))).toMatch(/quota/i);
  });

  it("flags a rejected key on 401 or invalid-key message", () => {
    expect(noticeForError(apiError(401))).toMatch(/key/i);
    expect(noticeForError(new Error("API key not valid. Please pass a valid API key."))).toMatch(/key/i);
  });

  it("flags overloaded on 529", () => {
    expect(noticeForError(apiError(529))).toMatch(/overloaded/i);
  });

  it("flags a connection problem on network errors", () => {
    expect(noticeForError(new Error("fetch failed"))).toMatch(/reach the AI/i);
  });

  it("has a generic fallback for unknown errors", () => {
    expect(noticeForError("weird")).toMatch(/unavailable/i);
  });
});

describe("selectProvider", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it("returns none when no key is set", () => {
    expect(selectProvider()).toBe("none");
  });

  it("prefers gemini when only gemini is set", () => {
    process.env.GEMINI_API_KEY = "x";
    expect(selectProvider()).toBe("gemini");
  });

  it("falls back to anthropic when only anthropic is set", () => {
    process.env.ANTHROPIC_API_KEY = "x";
    expect(selectProvider()).toBe("anthropic");
  });

  it("prefers gemini over anthropic by default", () => {
    process.env.GEMINI_API_KEY = "x";
    process.env.ANTHROPIC_API_KEY = "y";
    expect(selectProvider()).toBe("gemini");
  });

  it("honours AI_PROVIDER=anthropic when its key is set", () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.GEMINI_API_KEY = "x";
    process.env.ANTHROPIC_API_KEY = "y";
    expect(selectProvider()).toBe("anthropic");
  });
});
