import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken } from "../services/api";

// Detect Expo Go — don't even load expo-notifications in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

if (isExpoGo) {
  console.log(
    "⚠️ Push notifications are not available in Expo Go (SDK 53+).\n" +
    "   They will work automatically in a development build."
  );
}

// Only load the module outside Expo Go
let Notifications = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    Notifications = null;
  }
}

/**
 * Register for push notifications and save token to backend.
 * Skipped entirely in Expo Go.
 */
export async function registerForPushNotifications() {
  if (!Notifications || isExpoGo) return null;

  try {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined,
    });
    const pushToken = tokenData.data;
    console.log("Expo Push Token:", pushToken);

    const authToken = await AsyncStorage.getItem("token");
    if (authToken) {
      await registerPushToken(authToken, pushToken);
      console.log("Push token registered with backend ✅");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#1565C0",
        sound: "default",
      });
    }

    return pushToken;
  } catch (error) {
    console.log("Push notification registration error:", error.message);
    return null;
  }
}

/**
 * Set up notification response listener (when user taps a notification).
 */
export function setupNotificationResponseListener(onNotificationTap) {
  if (!Notifications || isExpoGo) return null;

  try {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (onNotificationTap) onNotificationTap(data);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Listen for notifications received while app is in foreground.
 */
export function setupForegroundNotificationListener(onNotification) {
  if (!Notifications || isExpoGo) return null;

  try {
    return Notifications.addNotificationReceivedListener((notification) => {
      if (onNotification) onNotification(notification);
    });
  } catch (e) {
    return null;
  }
}
