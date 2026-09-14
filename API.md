# API Reference

Base URL (local): `http://localhost:3001`

All requests and responses are JSON.

---

## GET /api/health

Health check and AI configuration status.

**Auth:** none

**Response 200**
```json
{ "status": "ok", "provider": "gemini", "aiConfigured": true }
```
- `provider` is `gemini`, `anthropic`, or `none`.
- `aiConfigured` is `false` (and `provider` is `none`) when the server is in mock mode.

---

## POST /api/summarize

Summarize raw meeting notes into a summary, decisions, and action items.

**Auth:** none

**Request body**
```json
{ "notes": "string (10 - 20000 chars)" }
```

**Response 200**
```json
{
  "summary": "string",
  "decisions": ["string"],
  "actionItems": ["string"],
  "mocked": false,
  "notice": "string (only when mocked)"
}
```
- `mocked` is `true` when the response came from the local mock — either no key is
  configured, or a real AI call failed and the server fell back to sample output.
- `notice` (present only when `mocked` is true) explains why, e.g. rate limit,
  overloaded, no credits, network error, or no key configured.

**Errors**

| Status | code | When |
|--------|------|------|
| 400 | `INVALID_INPUT` | `notes` missing or shorter than 10 characters |
| 400 | `INPUT_TOO_LONG` | `notes` longer than 20,000 characters |
| 502 | `AI_ERROR` | Unexpected server error (real AI failures fall back to mock, not 502) |

**Error shape**
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

---

## Example

```bash
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"Sprint planning. Agreed to ship v1. Alex to write the spec by Friday.\"}"
```
