import { Image, View } from "react-native";
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
    <View className="flex-row items-center justify-between bg-[#2F3B69] px-5 py-3">
      <Image
        source={require("@/assets/images/logoLightLinka.png")}
        style={{ width: 100, height: 36 }}
        resizeMode="contain"
      />

      <NotificationIconButton
        onPress={onNotificationsPress}
        unreadCount={notificationUnreadCount}
      />
    </View>
  );
}