import { WebPush } from '@/entities/WebPush';
import { getDatabaseConnection } from '@/lib/db';
import { Subscription } from '@/types/push';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const subscription: Subscription = await req.json();

    const db = await getDatabaseConnection();
    const webPushRepository = db.getRepository(WebPush);

    await webPushRepository.save({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save todos data" }, { status: 500 });
  }
}