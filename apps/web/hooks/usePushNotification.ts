'use client';

import { useState, useEffect } from 'react';

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.register('/sw.js');

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    setSubscription(sub);

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });

    return sub;
  }

  async function unsubscribe() {
    await subscription?.unsubscribe();
    setSubscription(null);
  }

  return { subscribe, unsubscribe, subscription, permission };
}