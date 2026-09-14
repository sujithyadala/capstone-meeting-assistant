import { useState } from "react";
import { summarize, type SummaryResult } from "./services/api";
import { Spinner } from "./components/Spinner";
import { ResultView } from "./components/ResultView";

const SAMPLE = `Sprint planning, Sept 12.
Attendees: Alex, Sam, Priya.
Discussed the new ingestion pipeline. Agreed to use the medallion architecture.
Priya raised concern about data quality checks - decided to add validation after Silver.
Sam will set up the CI pipeline. Alex to draft the schema by Friday.
Open question: which storage tier for cold data.`;

export default function App() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await summarize(notes);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-bold sm:text-2xl">AI Meeting Notes Assistant</h1>
          <p className="mt-1 text-sm text-slate-500">
            Paste raw notes and get a summary, key decisions, and action items.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit}>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
            Meeting notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            placeholder="Paste your raw meeting notes here..."
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Spinner />}
              {loading ? "Summarizing..." : "Summarize"}
            </button>
            <button
              type="button"
              onClick={() => setNotes(SAMPLE)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Load sample
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          >
            {error}
          </div>
        )}

        {result && <ResultView result={result} />}
      </main>

      <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-sm text-slate-400 sm:px-6">
        Built with React, Express &amp; an AI API (Gemini or Claude).
      </footer>
    </div>
  );
}
