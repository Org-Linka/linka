import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const TEST_NOTIFICATION_CHANNEL_ID = "test-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(TEST_NOTIFICATION_CHANNEL_ID, {
    name: "Testes de notificacao",
    description: "Notificacoes disparadas pelo botao de teste do Linka.",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#38BDF8",
    sound: "default",
  });
}

export async function requestLocalNotificationPermission() {
  if (Platform.OS === "web") return false;

  await ensureAndroidNotificationChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.granted) return true;

  const requestedPermission = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requestedPermission.granted;
}

export async function scheduleTestLocalNotification() {
  const hasPermission = await requestLocalNotificationPermission();

  if (!hasPermission) {
    throw new Error("Permissao de notificacao local negada.");
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Linka",
      body: "Notificacao local funcionando.",
      sound: "default",
      color: "#38BDF8",
      data: {
        type: "local_test_notification",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: TEST_NOTIFICATION_CHANNEL_ID,
    },
  });
}
