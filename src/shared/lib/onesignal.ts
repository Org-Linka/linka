import { Platform } from "react-native";

type OneSignalModule = typeof import("react-native-onesignal");

let cachedOneSignalModule: Promise<OneSignalModule | null> | null = null;

export async function loadOneSignal(): Promise<OneSignalModule | null> {
  if (Platform.OS === "web") {
    return null;
  }

  if (!cachedOneSignalModule) {
    cachedOneSignalModule = import("react-native-onesignal")
      .then((module) => module)
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido ao carregar OneSignal.";
        console.warn(`Falha ao carregar OneSignal: ${message}`);
        return null;
      });
  }

  return cachedOneSignalModule;
}
