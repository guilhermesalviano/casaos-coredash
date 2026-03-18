import { NextRequest, NextResponse } from "next/server";
import webpush from 'web-push';

export async function POST(req: NextRequest) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_MAILTO!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const { subscription, title, body, url } = await req.json();

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url })
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save todos data" }, { status: 500 });
  }
}