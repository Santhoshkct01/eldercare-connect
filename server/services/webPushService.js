const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Configure VAPID with environment variables and secure fallbacks
const vapidPublicKey =
  process.env.WEB_PUSH_PUBLIC_KEY ||
  'BJxPDvpC_CT-XimeQ7zgd7RYtpuk0J9JlNJgYt_3JpajiZ74GaJnVcwasKVauvU4mYn9zwf3_7VYYqUe7b8luX8';
const vapidPrivateKey =
  process.env.WEB_PUSH_PRIVATE_KEY || 'Pbt3_seIoif29p12h49UKph6ejVrIp3Ou8jYkkYV95g';
const vapidSubject = process.env.WEB_PUSH_SUBJECT || 'mailto:support@eldercare-connect.org';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('[WebPush] Error setting VAPID details:', e.message);
}

/**
 * Returns public VAPID key for client registration
 */
function getPublicKey() {
  return vapidPublicKey;
}

/**
 * Sends a browser Web Push notification to all active devices subscribed by a user.
 * @param {string} userId
 * @param {object} payload - { title, message, link, icon, tag }
 * @returns {Promise<{ sent: number, failed: number }>}
 */
async function sendPushToUser(userId, payload) {
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0, reason: 'No active push subscriptions' };
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Medicine Reminder',
      body: payload.message || 'It is time to take your scheduled dose.',
      icon: payload.icon || '/icon-192.png',
      badge: '/badge.png',
      data: {
        link: payload.link || '/elder/medicines',
        scheduledTime: payload.scheduledTime,
      },
      tag: payload.tag || `medicine-${Date.now()}`,
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, notificationPayload);
        sent += 1;
      } catch (err) {
        failed += 1;
        // Clean up 404 or 410 expired subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    }

    return { sent, failed };
  } catch (err) {
    console.error('[WebPush] Error dispatching push:', err.message);
    return { sent: 0, failed: 0, error: err.message };
  }
}

module.exports = {
  getPublicKey,
  sendPushToUser,
};
