import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { subscription, title, body, url } = await req.json();

  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title, body, url })
  );

  return Response.json({ success: true });
}