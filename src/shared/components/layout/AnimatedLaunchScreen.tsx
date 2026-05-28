import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";

export function AnimatedLaunchScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 560,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(420),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsVisible(false);
    });
  }, [opacity, scale]);

  if (!isVisible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.logoFrame, { transform: [{ scale }] }]}>
        <Image
          source={require("@/assets/images/logoDarkIcon.png")}
          resizeMode="contain"
          style={styles.logo}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#000000",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: {
    height: "100%",
    width: "100%",
  },
  logoFrame: {
    aspectRatio: 1,
    maxHeight: 220,
    maxWidth: 220,
    width: "42%",
  },
});
