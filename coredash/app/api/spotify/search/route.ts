import { NextRequest, NextResponse } from "next/server";
import { fetchSpotifySearch } from "@/services/spotify-api";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ data: [] });

  try {
    const data = await fetchSpotifySearch(q);
    return NextResponse.json({ data });
  } catch (err: any) {
    logger.error("Spotify search error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
