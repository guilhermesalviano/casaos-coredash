import { NextResponse } from "next/server";
import { fetchSpotifyPlayer } from "@/services/spotify-api";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { SpotifyPlayerResponse } from "@/types/spotify";
import logger from "@/lib/logger";

const spotifyCache = createMemoryCache<SpotifyPlayerResponse>(10_000); // 10 s

export async function GET() {
  const cached = spotifyCache.get("default");
  if (cached) return NextResponse.json({ data: cached });

  try {
    const data = await fetchSpotifyPlayer();
    spotifyCache.set("default", data);
    return NextResponse.json({ data });
  } catch (err: any) {
    if (err.message === "not_connected") {
      return NextResponse.json({ data: { connected: false, track: null, devices: [] } });
    }
    logger.error("Spotify GET error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
