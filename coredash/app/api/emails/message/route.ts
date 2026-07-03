import { NextResponse } from "next/server";
import { fetchGmailMessage } from "@/services/google-gmail-api";
import { gmailMessageCache } from "@/lib/gmail-cache";
import { GmailMessage } from "@/types/gmail";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing required query param: id" }, { status: 400 });
  }

  const cached = gmailMessageCache.get(id);
  if (cached) {
    logger.info(`Gmail message ${id} retrieved from cache`);
    return NextResponse.json({ message: "Email retrieved from cache", data: cached });
  }

  try {
    const email = await fetchGmailMessage(id);

    gmailMessageCache.set(id, email);

    return NextResponse.json({ message: "Email retrieved successfully", data: email });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to retrieve Gmail message" }, { status: 500 });
  }
}
