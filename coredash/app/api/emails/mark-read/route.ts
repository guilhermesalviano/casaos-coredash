import { NextResponse } from "next/server";
import { markGmailMessageAsRead } from "@/services/google-gmail-api";
import { gmailListCache, gmailMessageCache } from "@/lib/gmail-cache";
import logger from "@/lib/logger";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id: string | undefined = body?.id;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
  }

  try {
    await markGmailMessageAsRead(id);

    // Bust the list cache so next fetch reflects the updated read status
    gmailListCache.delete("default");

    // Update message cache entry if present
    const cached = gmailMessageCache.get(id);
    if (cached) gmailMessageCache.set(id, { ...cached, isUnread: false });

    logger.info(`Gmail message ${id} marked as read`);
    return NextResponse.json({ message: "Marked as read" });
  } catch (error: unknown) {
    const status = (error as { status?: number; code?: number })?.status
      ?? (error as { status?: number; code?: number })?.code
      ?? 500;
    const message = (error as { message?: string })?.message ?? "Unknown error";
    logger.error(`Failed to mark Gmail message ${id} as read: [${status}] ${message}`);
    // 403 = insufficient OAuth scope — token must be regenerated with gmail.modify scope
    return NextResponse.json({ error: "Failed to mark message as read", detail: message }, { status: 500 });
  }
}
