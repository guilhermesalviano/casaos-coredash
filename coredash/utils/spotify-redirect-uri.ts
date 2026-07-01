import { CONFIG } from "@/config/config";

/**
 * Returns the Spotify OAuth redirect URI derived from BASE_URL.
 * Register this exact value in your Spotify Developer Dashboard.
 */
export function getSpotifyRedirectUri(): string {
  return `${CONFIG.baseUrl.replace(/\/$/, "")}/api/spotify/callback`;
}
