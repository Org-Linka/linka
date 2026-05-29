import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type NotificationIconButtonProps = {
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
  unreadCount?: number;
};

export function NotificationIconButton({
  onPress,
  iconColor = "#FFFFFF",
  iconSize = 24,
  unreadCount = 0,
}: NotificationIconButtonProps) {
  const hasUnread = unreadCount > 0;
  const pulseProgress = useSharedValue(0);
  const ringProgress = useSharedValue(0);
  const previousUnreadCountRef = useRef(unreadCount);

  useEffect(() => {
    if (hasUnread) {
      pulseProgress.value = withRepeat(
        withTiming(1, {
          duration: 880,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true,
      );
      return;
    }

    cancelAnimation(pulseProgress);
    pulseProgress.value = 0;
  }, [hasUnread, pulseProgress]);

  useEffect(() => {
    if (unreadCount > previousUnreadCountRef.current) {
      ringProgress.value = 0;
      ringProgress.value = withTiming(1, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      });
    }

    previousUnreadCountRef.current = unreadCount;
  }, [ringProgress, unreadCount]);

  const animatedPointStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseProgress.value, [0, 1], [0.78, 1]),
    transform: [{ scale: interpolate(pulseProgress.value, [0, 1], [1, 1.15]) }],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0, 1], [0.7, 0]),
    transform: [{ scale: interpolate(ringProgress.value, [0, 1], [1, 2.8]) }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center"
    >
      <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
      {hasUnread ? (
        <View pointerEvents="none" className="absolute right-[7px] top-[6px]">
          <Animated.View
            className="absolute h-2.5 w-2.5 rounded-full bg-[#38BDF8]"
            style={animatedRingStyle}
          />
          <Animated.View
            className="h-2.5 w-2.5 rounded-full border border-white bg-[#38BDF8]"
            style={animatedPointStyle}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
