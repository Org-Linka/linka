import React, { memo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, CircleProps } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { ICircleLoadingIndicator } from "./types";

const AnimatedCircle =
  Animated.createAnimatedComponent<Partial<CircleProps>>(Circle);

function CircleLoadingIndicatorComponent({
  dotColor = "#007AFF",
  dotRadius = 6,
  dotSpacing = 20,
  duration = 950,
  style,
}: ICircleLoadingIndicator): React.JSX.Element {
  const progress1 = useSharedValue<number>(0);
  const progress2 = useSharedValue<number>(0);
  const progress3 = useSharedValue<number>(0);

  useEffect(() => {
    progress1.value = withRepeat(
      withTiming<number>(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    const secondDotTimer = setTimeout(() => {
      progress2.value = withRepeat(
        withTiming<number>(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }, duration / 3);

    const thirdDotTimer = setTimeout(() => {
      progress3.value = withRepeat<number>(
        withTiming<number>(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }, (2 * duration) / 3);

    return () => {
      clearTimeout(secondDotTimer);
      clearTimeout(thirdDotTimer);
    };
  }, [duration, progress1, progress2, progress3]);

  const jumpHeight = dotRadius * 0.85;

  const animatedProps1 = useAnimatedProps<
    Required<Partial<Pick<CircleProps, "cy">>>
  >(() => ({
    cy: 12 - progress1.value * jumpHeight,
  }));
  const animatedProps2 = useAnimatedProps<
    Required<Partial<Pick<CircleProps, "cy">>>
  >(() => ({
    cy: 12 - progress2.value * jumpHeight,
  }));
  const animatedProps3 = useAnimatedProps<
    Required<Partial<Pick<CircleProps, "cy">>>
  >(() => ({
    cy: 12 - progress3.value * jumpHeight,
  }));

  return (
    <View style={[styles.container, style]}>
      <Svg width={(dotRadius * 2 + dotSpacing) * 3} height={24}>
        <AnimatedCircle
          cx={dotRadius}
          cy={12}
          r={dotRadius}
          fill={dotColor}
          animatedProps={animatedProps1}
        />
        <AnimatedCircle
          cx={dotRadius + dotSpacing + dotRadius * 2}
          cy={12}
          r={dotRadius}
          fill={dotColor}
          animatedProps={animatedProps2}
        />
        <AnimatedCircle
          cx={dotRadius + (dotSpacing + dotRadius * 2) * 2}
          cy={12}
          r={dotRadius}
          fill={dotColor}
          animatedProps={animatedProps3}
        />
      </Svg>
    </View>
  );
}

CircleLoadingIndicatorComponent.displayName = "CircleLoadingIndicator";

export const CircleLoadingIndicator = memo(CircleLoadingIndicatorComponent);
CircleLoadingIndicator.displayName = "CircleLoadingIndicator";

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CircleLoadingIndicator;
