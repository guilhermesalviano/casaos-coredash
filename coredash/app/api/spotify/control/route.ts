import { NextRequest, NextResponse } from "next/server";
import {
  spotifyPlay,
  spotifyPause,
  spotifyNext,
  spotifyPrev,
  spotifyTransferDevice,
  spotifyPlayUri,
} from "@/services/spotify-api";
import { SpotifyControlAction } from "@/types/spotify";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body: SpotifyControlAction = await req.json();

    switch (body.action) {
      case "play":
        await spotifyPlay();
        break;
      case "pause":
        await spotifyPause();
        break;
      case "next":
        await spotifyNext();
        break;
      case "prev":
        await spotifyPrev();
        break;
      case "transfer":
        await spotifyTransferDevice(body.deviceId);
        break;
      case "play_uri":
        await spotifyPlayUri(body.uri, body.deviceId);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logger.error("Spotify control error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
