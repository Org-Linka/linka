import { useEffect } from "react";
import type { ScrollViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AnimatedScreenScrollViewProps = ScrollViewProps & {
  revealDuration?: number;
};

export function AnimatedScreenScrollView({
  children,
  revealDuration = 280,
  showsVerticalScrollIndicator,
  ...rest
}: AnimatedScreenScrollViewProps) {
  const revealProgress = useSharedValue(0);

  useEffect(() => {
    revealProgress.value = withTiming(1, {
      duration: revealDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [revealDuration, revealProgress]);

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [{ translateY: (1 - revealProgress.value) * 8 }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedWrapperStyle]}>
      <Animated.ScrollView
        {...rest}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
      >
        {children}
      </Animated.ScrollView>
    </Animated.View>
  );
}
