const { Expo } = require("expo-server-sdk");

const expo = new Expo();

/**
 * Send a push notification to a single user.
 * @param {string} pushToken - Expo push token (ExponentPushToken[xxx])
 * @param {string} title    - Notification title
 * @param {string} body     - Notification body text
 * @param {object} data     - Extra data payload (e.g. { screen: "Chat", appointmentId: "..." })
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    console.log("Invalid or missing push token:", pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
    priority: "high",
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push ticket:", ticketChunk);
    }
  } catch (error) {
    console.error("Push notification error:", error);
  }
}

/**
 * Send push notifications to multiple users.
 * @param {Array<{pushToken: string, title: string, body: string, data: object}>} notifications
 */
async function sendPushNotifications(notifications) {
  const messages = notifications
    .filter((n) => n.pushToken && Expo.isExpoPushToken(n.pushToken))
    .map((n) => ({
      to: n.pushToken,
      sound: "default",
      title: n.title,
      body: n.body,
      data: n.data || {},
      priority: "high",
    }));

  if (messages.length === 0) return;

  try {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push tickets:", ticketChunk);
    }
  } catch (error) {
    console.error("Push notifications error:", error);
  }
}

module.exports = { sendPushNotification, sendPushNotifications };
