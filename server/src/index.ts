import "dotenv/config";
import express from "express";
import cors from "cors";
import { summarizeNotes, selectProvider } from "./ai.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());

app.use(cors({ origin: CORS_ORIGIN && CORS_ORIGIN.length ? CORS_ORIGIN : true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  const provider = selectProvider();
  res.json({ status: "ok", provider, aiConfigured: provider !== "none" });
});

app.post("/api/summarize", async (req, res) => {
  const notes = (req.body?.notes ?? "") as string;

  if (typeof notes !== "string" || notes.trim().length < 10) {
    return res.status(400).json({
      error: "Please paste at least a few sentences of meeting notes.",
      code: "INVALID_INPUT",
    });
  }
  if (notes.length > 20000) {
    return res.status(400).json({
      error: "That is too long. Please keep notes under 20,000 characters.",
      code: "INPUT_TOO_LONG",
    });
  }

  try {
    const result = await summarizeNotes(notes);
    return res.json(result);
  } catch (err) {
    console.error("summarize failed:", err);
    return res.status(502).json({
      error: "The assistant could not process the notes right now. Please try again.",
      code: "AI_ERROR",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  const provider = selectProvider();
  if (provider === "none") {
    console.warn("No AI key set (GEMINI_API_KEY or ANTHROPIC_API_KEY) — running in MOCK mode.");
  } else {
    console.log(`AI provider: ${provider}`);
  }
});
