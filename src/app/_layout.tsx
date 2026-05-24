import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ToastProviderWithViewport } from "@/shared/components/ui/molecules/Toast";
import { AuthProvider } from "@/features/auth/auth.context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Atkinson-Regular": require("@/assets/fonts/AtkinsonHyperlegible-Regular.ttf"),
    "Atkinson-Bold": require("@/assets/fonts/AtkinsonHyperlegible-Bold.ttf"),
  });

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
      </AuthProvider>
    </ToastProviderWithViewport>
  );
}
