import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type ReactixProgressBarProps = {
  value: number;
  tone: number;
  height?: number;
  duration?: number;
};

const COLOR_STEPS = ["#7f1d1d", "#9a3412", "#14532d", "#065f46"] as const;

export function ReactixProgressBar({
  value,
  tone,
  height = 8,
  duration = 240,
}: ReactixProgressBarProps) {
  const progress = useSharedValue(0);
  const toneProgress = useSharedValue(0);

  useEffect(() => {
    const clampedValue = Math.max(0, Math.min(100, value));
    const clampedTone = Math.max(0, Math.min(3, tone));

    progress.value = withTiming(clampedValue, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    toneProgress.value = withTiming(clampedTone, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [duration, progress, tone, toneProgress, value]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: interpolateColor(
      toneProgress.value,
      [0, 1, 2, 3],
      COLOR_STEPS as unknown as string[],
    ),
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
          },
          animatedFillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#e4e4e7",
  },
  fill: {
    width: "0%",
  },
});
