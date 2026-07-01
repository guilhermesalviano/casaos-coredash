import { NextResponse } from "next/server";
import { fetchGoogleGmailAPI } from "@/services/google-gmail-api";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { GmailInternalAPIResponse } from "@/types/gmail";
import logger from "@/lib/logger";

const gmailCache = createMemoryCache<GmailInternalAPIResponse>(ONE_MINUTE_IN_MS * 5);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken") ?? undefined;

  // Don't cache paginated requests
  if (!pageToken) {
    const cached = gmailCache.get("default");
    if (cached) {
      logger.info("Gmail data retrieved from cache successfully");
      return NextResponse.json({ message: "Gmail data from cache successfully", data: cached });
    }
  }

  try {
    const result = await fetchGoogleGmailAPI({ pageToken });

    const responseBody: GmailInternalAPIResponse = {
      emails: result.emails,
      nextPageToken: result.nextPageToken,
    };

    if (!pageToken) gmailCache.set("default", responseBody);

    return NextResponse.json({ message: "Gmail data retrieved successfully", data: responseBody });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to retrieve Gmail data" }, { status: 500 });
  }
}
