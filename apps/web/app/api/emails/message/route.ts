import { NextResponse } from "next/server";
import { fetchGmailMessage } from "@/services/google-gmail-api";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { GmailMessage } from "@/types/gmail";
import logger from "@/lib/logger";

const messageCache = createMemoryCache<GmailMessage>(ONE_MINUTE_IN_MS * 5);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing required query param: id" }, { status: 400 });
  }

  const cached = messageCache.get(id);
  if (cached) {
    logger.info(`Gmail message ${id} retrieved from cache`);
    return NextResponse.json({ message: "Email retrieved from cache", data: cached });
  }

  try {
    const email = await fetchGmailMessage(id);

    messageCache.set(id, email);

    return NextResponse.json({ message: "Email retrieved successfully", data: email });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to retrieve Gmail message" }, { status: 500 });
  }
}
