import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const subscription = await req.json();

  // Salve no banco de dados aqui (ex: Prisma, Drizzle)
  // await db.pushSubscription.create({ data: subscription })

  console.log('Nova subscription:', subscription);

  return Response.json({ success: true });
}