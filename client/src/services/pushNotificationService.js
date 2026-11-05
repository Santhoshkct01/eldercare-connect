import api from './api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers the service worker and subscribes the user to Web Push
 */
export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[WebPush] Push messaging is not supported in this browser.');
    return { supported: false, permission: Notification.permission };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { supported: true, permission };
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Get public VAPID key from backend
    const keyRes = await api.get('/medicines/vapid-key');
    const vapidPublicKey = keyRes.data.publicKey;

    if (!vapidPublicKey) {
      console.warn('[WebPush] No VAPID public key received.');
      return { supported: true, permission, subscribed: false };
    }

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription to backend
    await api.post('/medicines/subscribe-push', {
      subscription: subscription.toJSON(),
    });

    return { supported: true, permission: 'granted', subscribed: true };
  } catch (err) {
    console.error('[WebPush] Error setting up web push:', err);
    return { supported: true, permission: Notification.permission, error: err.message };
  }
}
