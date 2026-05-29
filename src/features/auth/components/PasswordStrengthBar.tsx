import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { getPasswordStrength, type PasswordStrengthLevel } from "../auth.password-strength";
import { ReactixProgressBar } from "./ReactixProgressBar";

type PasswordStrengthBarProps = {
  password: string;
};

const LEVEL_TO_TONE: Record<PasswordStrengthLevel, number> = {
  "very-weak": 0,
  fair: 1,
  good: 2,
  excellent: 3,
};

const COLOR_STEPS = ["#7f1d1d", "#9a3412", "#14532d", "#065f46"] as const;

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = getPasswordStrength(password);
  const strengthLevel = strength?.level;
  const toneProgress = useSharedValue(0);

  useEffect(() => {
    const nextTone = strengthLevel ? LEVEL_TO_TONE[strengthLevel] : 0;

    toneProgress.value = withTiming(nextTone, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [strengthLevel, toneProgress]);

  const animatedLabelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      toneProgress.value,
      [0, 1, 2, 3],
      COLOR_STEPS as unknown as string[],
    ),
  }));

  if (!strength || !strengthLevel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ReactixProgressBar
        value={strength.percentage}
        tone={LEVEL_TO_TONE[strengthLevel]}
      />

      <Animated.Text style={[styles.label, animatedLabelStyle]}>
        {strength.label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "AtkinsonHyperlegible-Regular",
  },
});
