import { NextResponse } from "next/server";
import { fetchSpotifyLibrary } from "@/services/spotify-api";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { SpotifyLibrary } from "@/types/spotify";
import logger from "@/lib/logger";

const libraryCache = createMemoryCache<SpotifyLibrary>(60_000); // 1 min

export async function GET() {
  const cached = libraryCache.get("default");
  if (cached) return NextResponse.json({ data: cached });

  try {
    const data = await fetchSpotifyLibrary();
    libraryCache.set("default", data);
    return NextResponse.json({ data });
  } catch (err: any) {
    logger.error("Spotify library error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
