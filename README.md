# AI Meeting Notes Assistant

A small full-stack app that turns raw meeting notes into a **summary**, **key decisions**, and **action items** using AI. Built for the Module 15 capstone.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript, proxying the AI provider
- **AI:** pluggable provider — **Google Gemini** (`@google/generative-ai`) or **Anthropic Claude** (`@anthropic-ai/sdk`). The backend auto-selects whichever key is set (Gemini preferred, since it has a free tier).
- **Tests:** Vitest (service + provider-selection + error-mapping layers)

The API key lives **only on the backend** — it is never exposed to the browser. If no key is set, the app runs in **mock mode**. If a real call fails (rate limit, overloaded, no credits, network), it **falls back to sample output** with a clear notice — it never hard-fails.

## Repository Layout

```
capstone-meeting-assistant/
  client/   # React frontend (deploys to Vercel)
  server/   # Express backend (deploys to Railway)
  README.md
  API.md
```

## Run Locally

Open two terminals.

**1. Backend**
```bash
cd server
npm.cmd install
copy .env.example .env      # then add GEMINI_API_KEY (free) or ANTHROPIC_API_KEY
npm.cmd run dev             # http://localhost:3001
```
Get a free Gemini key at https://aistudio.google.com/app/apikey. If you leave both
keys empty, the server runs in **MOCK mode** and returns placeholder output, so the
whole app works without a key.

**2. Frontend**
```bash
cd client
npm.cmd install
copy .env.example .env      # VITE_API_URL=http://localhost:3001
npm.cmd run dev             # http://localhost:5173
```

Open the frontend URL, paste notes (or click **Load sample**), and click **Summarize**.

## Environment Variables

**server/.env**
| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini key (free tier). Preferred when set. |
| `ANTHROPIC_API_KEY` | Anthropic Claude key. Used if no Gemini key. |
| `AI_PROVIDER` | Optional: force `gemini` or `anthropic`. |
| `GEMINI_MODEL` | Optional override (default `gemini-3.6-flash`). |
| `PORT` | Backend port (default 3001). |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated. |

If neither key is set, the server runs in mock mode.

**client/.env**
| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL of the backend API. |

## Test

```bash
cd server
npm.cmd test
```

## Build

```bash
cd server && npm.cmd run build
cd client && npm.cmd run build
```

## Deploy

See `Capstone_Deployment_Guidance.docx` for step-by-step Railway (backend) + Vercel
(frontend) deployment instructions.

## Features

- Paste notes → AI-generated summary, decisions, and action items
- Pluggable AI provider (Gemini or Claude), auto-selected by which key is set
- Resilient fallback: on rate limit / overload / no credits / network error, returns
  sample output with a clear notice instead of hard-failing
- Loading state while the request is in flight
- Clear, user-friendly error messages (no technical jargon)
- Mobile-responsive layout
- Mock mode so the app runs with no API key
- Backend input validation (min length, max length)
