import { AccessibleText } from "@/shared/components/ui/base/accessible-text";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import logoLight from "@/assets/images/logoLight.png";

type AuthScreenLayoutProps = {
  heroTitle?: string;
  children: ReactNode;
};

export function AuthScreenLayout({ heroTitle, children }: AuthScreenLayoutProps) {
  const { width, height } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const hasHeroTitle = Boolean(heroTitle?.trim());
  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";

  const heroHeightClassName = hasHeroTitle
    ? height < 700
      ? "min-h-[240px]"
      : "min-h-[280px]"
    : height < 700
      ? "min-h-[190px]"
      : "min-h-[220px]";

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const subscription = Keyboard.addListener(keyboardShowEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 120);
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1 bg-white dark:bg-zinc-900"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-white dark:bg-zinc-900"
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <View className="flex-1 bg-white dark:bg-zinc-900">
            <View
              className={`w-full items-center justify-center rounded-b-[110px] bg-[#2F3B69] pt-7 pb-8 ${containerPaddingClassName} ${heroHeightClassName}`}
            >
              <View
                className={`w-full max-w-[420px] items-center ${
                  hasHeroTitle ? "gap-6" : "justify-center"
                }`}
              >
                <View className="flex-row items-center justify-center self-center -translate-x-2">
                  <Image
                    source={logoLight}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                  <AccessibleText className="text-6xl text-white font-atkinson-bold">
                    Linka
                  </AccessibleText>
                </View>

                {hasHeroTitle && (
                  <AccessibleText className="mt-2 text-center text-4xl font-atkinson-bold text-white">
                    {heroTitle}
                  </AccessibleText>
                )}
              </View>
            </View>

            <View
              className={`w-full max-w-[420px] flex-1 self-center py-7 ${containerPaddingClassName}`}
            >
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
