const isDev = process.env.NODE_ENV === "development";
const MOCK_BASE_URL = "http://localhost:1080";

function api(prod: string, path: string): string {
  return `${isDev ? MOCK_BASE_URL : prod}${path}`;
}

function required(key: string): string {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return process.env[key] ?? "";
  }
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const EXTERNAL_SERVICES = {
  openMeteo: api("https://api.open-meteo.com", "/v1/forecast"),
  nominatim: api("https://nominatim.openstreetmap.org", "/reverse"),
  serpApi: api("https://serpapi.com", "/search"),
  brapi: api("https://brapi.dev", "/api/quote"),
  mediastack: "https://api.mediastack.com/v1/news",
  ollama: optional("OLLAMA_URL", "http://192.168.3.140:11434"),
}

export const LOCATION = {
  latitude: optional("LATITUDE", "-23.533773"),
  longitude: optional("LONGITUDE", "-46.625290"),
  timezone: "America/Sao_Paulo",
}

export const UPDATE_INTERVAL_MS = 1 * 60 * 60 * 1000;

export const DB = {
  host: required("DB_HOST"),
  port: Number(optional("DB_PORT", "3306")),
  name: required("DB_NAME"),
  username: required("DB_USER"),
  password: required("DB_PASSWORD"),
}

export const GOOGLE = {
  clientEmail: required("GOOGLE_CLIENT_EMAIL"),
  privateKey: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  calendarIds: optional("GOOGLE_CALENDAR_IDS").split(";").filter(Boolean),
  gmailClientId: required("GOOGLE_GMAIL_CLIENT_ID"),
  gmailClientSecret: required("GOOGLE_GMAIL_CLIENT_SECRET"),
  gmailRefreshToken: required("GOOGLE_GMAIL_REFRESH_TOKEN"),
}

export const APIS = {
  brapiToken: required("BRAPI_TOKEN"),
  serpApiKey: required("SERPAPI_KEY"),
  newsApiKey: required("NEWS_API_KEY"),
  geminiApiKey: optional("GEMINI_API_KEY"),
}

export const AI = {
  model: optional("AI_MODEL", "gemma4:e2b"),
  personalContext: optional("PERSONAL_CONTEXT"),
}

export const CONFIG = {
  isDev,
  logLevel: optional("LOG_LEVEL", isDev ? "debug" : "info"),
  baseUrl: required("BASE_URL"),
} as const;