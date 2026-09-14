import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseModelResponse,
  type SummaryResult,
} from "./summarizer.js";

const DEFAULT_MODEL = "gemini-3.6-flash";

/** Calls Google Gemini to summarize notes. Throws on failure (caller handles fallback). */
export async function callGemini(
  notes: string
): Promise<Omit<SummaryResult, "mocked" | "notice">> {
  const apiKey = process.env.GEMINI_API_KEY as string;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(buildUserPrompt(notes));
  const text = result.response.text();
  return parseModelResponse(text);
}