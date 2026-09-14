import type { SummaryResult } from "../services/api";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-slate-400">None identified.</p>
      )}
    </div>
  );
}

export function ResultView({ result }: { result: SummaryResult }) {
  return (
    <div className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {result.mocked && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {result.notice ??
            "Showing sample output — set an ANTHROPIC_API_KEY on the server for real AI results."}
        </p>
      )}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Summary
        </h3>
        <p className="mt-2 leading-relaxed text-slate-800">{result.summary}</p>
      </div>
      <Section title="Key Decisions" items={result.decisions} />
      <Section title="Action Items" items={result.actionItems} />
    </div>
  );
}
