import "../../global.css";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { Platform } from "react-native";
import { loadOneSignal } from "@/shared/lib/onesignal";
import { AnimatedLaunchScreen } from "@/shared/components/layout/AnimatedLaunchScreen";
import { ToastProviderWithViewport } from "@/shared/components/ui/molecules/Toast";
import { AuthProvider } from "@/features/auth/auth.context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Atkinson-Regular": require("@/assets/fonts/AtkinsonHyperlegible-Regular.ttf"),
    "Atkinson-Bold": require("@/assets/fonts/AtkinsonHyperlegible-Bold.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "web") return;

    const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn("OneSignal não configurado: EXPO_PUBLIC_ONESIGNAL_APP_ID ausente.");
      return;
    }
    const oneSignalAppId = appId;

    let moduleLoaded: Awaited<ReturnType<typeof loadOneSignal>> = null;
    let isMounted = true;
    const clickListener = (event: unknown) => console.log("OneSignal click", event);

    async function setupOneSignal() {
      const oneSignalModule = await loadOneSignal();
      if (!isMounted || !oneSignalModule) return;

      moduleLoaded = oneSignalModule;

      const { OneSignal, LogLevel } = oneSignalModule;

      if (__DEV__) OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize(oneSignalAppId);
      OneSignal.Notifications.addEventListener("click", clickListener);
    }

    void setupOneSignal();

    return () => {
      isMounted = false;
      moduleLoaded?.OneSignal.Notifications.removeEventListener("click", clickListener);
    };
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ToastProviderWithViewport>
      <AuthProvider>
        <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }} />
        <AnimatedLaunchScreen />
      </AuthProvider>
    </ToastProviderWithViewport>
  );
}
