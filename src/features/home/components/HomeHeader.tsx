import { Image, View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

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
        <AccessibleText className="text-center text-2xl font-bold text-white font-atkinson-bold">
          Linka
        </AccessibleText>
      </View>

      <NotificationIconButton
        onPress={onNotificationsPress}
        unreadCount={notificationUnreadCount}
      />
    </View>
  );
}
