import { NextRequest, NextResponse } from "next/server";
import { CONFIG, SPOTIFY } from "@/config/config";
import { getSpotifyRedirectUri } from "@/utils/spotify-redirect-uri";

export async function GET(req: NextRequest) {
  const resolvedRedirectUri = getSpotifyRedirectUri();
  return NextResponse.json({
    resolvedRedirectUri,
    registerThisInSpotifyDashboard: resolvedRedirectUri,
    requestOrigin: req.nextUrl.origin,
    configBaseUrl: CONFIG.baseUrl,
    spotifyClientIdSet: !!SPOTIFY.clientId,
    spotifyClientSecretSet: !!SPOTIFY.clientSecret,
    spotifyRefreshTokenSet: !!SPOTIFY.refreshToken,
  });
}
