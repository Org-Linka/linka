import { Image, KeyboardAvoidingView, Platform, StatusBar, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

import logoLight from "@/assets/images/logoLight.png";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";

type AuthScreenLayoutProps = {
  heroTitle: string;
  children: ReactNode;
};

export function AuthScreenLayout({ heroTitle, children }: AuthScreenLayoutProps) {
  const { width, height } = useWindowDimensions();
  const containerPaddingClassName = width < 360 ? "px-5" : "px-6";
  const heroHeightClassName = height < 700 ? "min-h-[260px]" : "min-h-[300px]";

  return (
    <SafeAreaView className="flex-1 bg-[#2f3b69]" edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <AnimatedScreenScrollView
          className="flex-1 bg-white"
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 bg-white">
            <View
              className={`w-full items-center justify-center rounded-b-[110px] bg-[#2f3b69] pt-7 pb-8 ${containerPaddingClassName} ${heroHeightClassName}`}
            >
              <View className="w-full max-w-[420px] items-center gap-6">
                <View className="flex-row items-center justify-center">
                  <Image source={logoLight} style={{ width: 60, height: 60 }} resizeMode="contain" />
                  <Text className="text-6xl text-white font-atkinson-bold">Linka</Text>
                </View>
                <Text className="mt-2 text-center text-4xl font-atkinson-bold text-white">
                  {heroTitle}
                </Text>
              </View>
            </View>

            <View className={`w-full max-w-[420px] flex-1 self-center py-7 ${containerPaddingClassName}`}>
              {children}
            </View>
          </View>
        </AnimatedScreenScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
