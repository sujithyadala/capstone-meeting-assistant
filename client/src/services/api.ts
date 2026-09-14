export interface SummaryResult {
  summary: string;
  decisions: string[];
  actionItems: string[];
  mocked: boolean;
  notice?: string;
}

interface ApiError {
  error: string;
  code: string;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Calls the backend to summarize meeting notes. Throws a user-friendly Error on failure. */
export async function summarize(notes: string): Promise<SummaryResult> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = (await response.json()) as ApiError;
      if (data?.error) message = data.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  return (await response.json()) as SummaryResult;
}
