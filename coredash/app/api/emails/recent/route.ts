import { NextResponse } from "next/server";
import { fetchGoogleGmailAPI } from "@/services/google-gmail-api";
import { gmailListCache } from "@/lib/gmail-cache";
import { GmailInternalAPIResponse } from "@/types/gmail";
import logger from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageToken = searchParams.get("pageToken") ?? undefined;

  // Don't cache paginated requests
  if (!pageToken) {
    const cached = gmailListCache.get("default");
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

    if (!pageToken) gmailListCache.set("default", responseBody);

    return NextResponse.json({ message: "Gmail data retrieved successfully", data: responseBody });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to retrieve Gmail data" }, { status: 500 });
  }
}
