import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

import Logo from "@/assets/images/logoLight.png";
import { NotificationIconButton } from "@/shared/components/layout/NotificationIconButton";
import { AccessibleText } from "../ui/base/accessible-text";

type AppTopBarProps = {
  title: string;
  showBackButton?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  notificationUnreadCount?: number;
};

export function AppTopBar({
  title,
  showBackButton = false,
  rightIcon,
  onRightPress,
  notificationUnreadCount = 0,
}: AppTopBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-[#2F3B69] px-5 py-4">
      <View className="flex-row items-center gap-4">
        {showBackButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="rounded-xl bg-black/40 p-1">
            <Image
              source={Logo}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </View>
        )}

        <AccessibleText 
          size={20}
          className="text-xl font-bold text-white font-atkinson-bold">
          {title}
        </AccessibleText>
      </View>

      {rightIcon ? (
        rightIcon === "notifications-outline" ? (
          <NotificationIconButton
            onPress={onRightPress}
            unreadCount={notificationUnreadCount}
          />
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color="#fff" />
          </TouchableOpacity>
        )
      ) : (
        <View className="h-10 w-10" />
      )}
    </View>
  );
}
