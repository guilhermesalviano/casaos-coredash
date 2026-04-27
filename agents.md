# Agents & Automation — CoreDash

Overview of all automated agents, internal APIs, and AI features in the project.

---

## Internal API Routes

All routes live under `apps/web/app/api/` and are consumed by the dashboard frontend.

| Route | Method | Description | Cache TTL |
|---|---|---|---|
| `/api/calendar` | GET | Google Calendar events (today + next 7 days) | 3 hours |
| `/api/gmail` | GET | Last 10 Gmail inbox emails | 5 minutes |
| `/api/todo` | GET | Pending to-do items from the database | — |
| `/api/habits` | GET | Daily habit tracking data | — |
| `/api/weather` | GET | Current weather + hourly forecast (Open-Meteo) | — |
| `/api/news` | GET | Latest news headlines | — |
| `/api/stocks` | GET | Stock quotes (BRAPI / Yahoo Finance) | — |
| `/api/flights` | GET | Flight information (SerpAPI) | — |
| `/api/ai/narrative` | POST | AI-generated daily briefing (streaming) | — |

---

## AI Agent — Rocky

**File:** `lib/ai/assistants/rocky/instruction.ts`  
**Endpoint:** `POST /api/ai/narrative`

Rocky is a streaming AI assistant inspired by *Project Hail Mary*. On each request it:

1. Fetches `/api/todo`, `/api/calendar`, and `/api/habits` in parallel
2. Builds a compact prompt with weather, forecast, events, pending tasks, and habit status
3. Streams a personalized daily narrative back to the frontend

### Providers

| Provider | File | Notes |
|---|---|---|
| Ollama (default) | `lib/ai/providers/ollama.ts` | Self-hosted LLM; configured via `OLLAMA_URL` env var |
| Gemini | `lib/ai/providers/gemini.ts` | Google Gemini; requires `GEMINI_API_KEY` |

Model is selected via the `AI_MODEL` env var (default: `gemma4:e2b`).

---

## Google Integrations

### Calendar (`services/google-calendar-api.ts`)
- Auth: **Service Account** (no user interaction required)
- Scopes: `calendar.readonly`
- Env vars: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_IDS`

### Gmail (`services/google-gmail-api.ts`)
- Auth: **OAuth2 with refresh token** (personal inbox access)
- Scopes: `gmail.readonly`
- Env vars: `GOOGLE_GMAIL_CLIENT_ID`, `GOOGLE_GMAIL_CLIENT_SECRET`, `GOOGLE_GMAIL_REFRESH_TOKEN`
- Returns: `id`, `threadId`, `snippet`, `from`, `subject`, `date`, `isUnread`

#### Generating the Gmail refresh token
```bash
cd apps/web
npx tsx scripts/get-gmail-token.ts
```
Opens a local OAuth flow on `http://localhost:3001/oauth/callback` and prints the token to the terminal.

---

## Caching

Internal APIs use an in-memory cache (`utils/in-memory-cache.ts`) to avoid hammering external services on every dashboard refresh.

```ts
const cache = createMemoryCache<T>(TTL_IN_MS);
cache.get("default");   // returns cached value or undefined
cache.set("default", data);
```

---

## Adding a New Agent / API

1. Create `app/api/<name>/route.ts` with a `GET` (or `POST`) handler
2. Add a service file in `services/<provider>-api.ts` for external calls
3. Add types in `types/<name>.ts`
4. Add required env vars to `config/config.ts` and `.env.example`
5. Wrap with `createMemoryCache` if the data doesn't need to be real-time
