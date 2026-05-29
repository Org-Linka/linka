import { Image, Text, View } from "react-native";

import Logo from "@/assets/images/logoLight.png";
import { NotificationIconButton } from "@/shared/components/layout/NotificationIconButton";

type HomeHeaderProps = {
  onNotificationsPress: () => void;
  notificationUnreadCount?: number;
};

export function HomeHeader({
  onNotificationsPress,
  notificationUnreadCount = 0,
}: HomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-[#002B5B] px-5 py-4">
      <View className="flex-row items-center gap-4">
        <View className="rounded-xl bg-black/40 p-1">
          <Image source={Logo} style={{ width: 40, height: 40 }} resizeMode="contain" />
        </View>
        <Text className="text-center text-2xl font-bold text-white font-atkinson-bold">
          Linka
        </Text>
      </View>

      <NotificationIconButton
        onPress={onNotificationsPress}
        unreadCount={notificationUnreadCount}
      />
    </View>
  );
}
