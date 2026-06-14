import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated";
import { SymbolView } from "expo-symbols";
import { BlurView, type BlurViewProps } from "expo-blur";
import type { SearchBarProps } from "./SearchBar.types";
import { scheduleOnRN } from "react-native-worklets";
import { Ionicons } from "@expo/vector-icons";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";
import { useFont } from "@/features/accessibility/hooks";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedBlurView =
  Animated.createAnimatedComponent<BlurViewProps>(BlurView);

const { width: screenWidth } = Dimensions.get("window");

export const SearchBar = ({
  placeholder = "Search",
  onSearch,
  onClear,
  style,
  inputStyle,
  renderLeadingIcons,
  renderTrailingIcons,
  onSearchDone = () => {},
  onSearchMount = () => {},
  containerWidth,
  focusedWidth,
  cancelButtonWidth = 68,
  enableWidthAnimation = true,
  centerWhenUnfocused = true,
  tint,
  iconStyle,
  textCenterOffset,
  iconCenterOffset,
  ...textInputProps
}: SearchBarProps) => {
  const { fontScale } = useFont();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0 });
  const inputRef = useRef<TextInput>(null);

  const focusProgress = useSharedValue(0);
  const clearButtonScale = useSharedValue(0);
  const clearButtonOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const textScale = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  const currentWidth = useSharedValue(containerWidth || screenWidth - 32);

  useEffect(() => {
    if (containerWidth) {
      currentWidth.value = containerWidth;
    } else if (containerDimensions.width > 0) {
      currentWidth.value = containerDimensions.width;
    }
  }, [containerWidth, containerDimensions.width, currentWidth]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!enableWidthAnimation) {
      return { width: "100%" };
    }

    const searchBarWidth = interpolate(
      focusProgress.value,
      [0, 1],
      [
        currentWidth.value,
        focusedWidth || currentWidth.value - cancelButtonWidth,
      ],
    );
    return { width: searchBarWidth };
  });

  const animatedCancelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(focusProgress.value, [0, 0.5, 1], [0, 0, 1]);
    const translateX = interpolate(focusProgress.value, [0, 1], [20, 0]);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const animatedBlurViewProps = useAnimatedProps(() => {
    const blurAmount = withSpring(
      interpolate(focusProgress.value, [0, 0.3, 0.5, 1], [0, 20, 30, 0]),
    );
    return {
      intensity: blurAmount,
    };
  });

  const animatedSearchContentStyle = useAnimatedStyle(() => {
    const justifyContent =
      focusProgress.value === 0 && centerWhenUnfocused
        ? "center"
        : "flex-start";
    const paddingLeft = interpolate(focusProgress.value, [0, 1], [0, 12]);
    return { justifyContent, paddingLeft };
  });

  const animatedInputWrapperStyle = useAnimatedStyle(() => {
    if (!centerWhenUnfocused) {
      return { transform: [{ translateX: 0 }] };
    }

    const iconAndPadding = 40;
    const _centerOffSetValue = textCenterOffset ?? 2.5;
    const centerOffset =
      (currentWidth.value - iconAndPadding * _centerOffSetValue) / 2 - 10;

    const translateX = interpolate(
      focusProgress.value,
      [0, 1],
      [centerOffset, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return {
      transform: [{ translateX }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    if (!centerWhenUnfocused) {
      return { transform: [{ translateX: 0 }] };
    }
    const _iconCenterValue = iconCenterOffset ?? 2.5;
    const centerOffset = (currentWidth.value - 36 * _iconCenterValue) / 2 - 10;
    const translateX = interpolate(
      focusProgress.value,
      [0, 1],
      [centerOffset, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return {
      transform: [{ translateX }],
    };
  });

  const animatedClearButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clearButtonScale.value }],
    opacity: clearButtonOpacity.value,
  }));

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { scale: textScale.value },
        { translateY: textTranslateY.value },
      ],
    };
  });

  const handleFocus = () => {
    onSearchMount();
    setIsFocused(true);
    focusProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
      velocity: 0.5,
      duration: 550 as any,
    });
  };

  const handleCancel = () => {
    inputRef.current?.blur();
    setIsFocused(false);
    setQuery("");
    onSearchDone();
    onClear?.();
    focusProgress.value = withTiming(0);
    clearButtonScale.value = withTiming(0);
    clearButtonOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleBlur = () => {
    if (!query) handleCancel();
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      clearButtonScale.value = withSpring(1);
      clearButtonOpacity.value = withTiming(1, { duration: 200 });
      textOpacity.value = withTiming(1, { duration: 150 });
    } else {
      clearButtonScale.value = withSpring(0);
      clearButtonOpacity.value = withTiming(0, { duration: 200 });
    }

    onSearch?.(text);
  };

  const handleClear = () => {
    textOpacity.value = withTiming(0, { duration: 150 }, () => {
      scheduleOnRN(setQuery, "");
      textOpacity.value = withTiming(1, { duration: 150 });
    });

    clearButtonScale.value = withTiming(0);
    clearButtonOpacity.value = withTiming(0, { duration: 200 });
    onClear?.();
    inputRef.current?.focus();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerDimensions({ width });
  };

  const shouldShowCancelButton = enableWidthAnimation && isFocused;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <View style={styles.searchRow}>
        <AnimatedView
          style={[
            styles.searchBarContainer,
            animatedContainerStyle,
          ]}
        >
          <BlurView
            intensity={15}
            tint="systemChromeMaterialDark"
            style={styles.blurContainer}
          >
            <View style={styles.searchContainer}>
              <AnimatedView
                style={[styles.searchContent, animatedSearchContentStyle]}
              >
                <AnimatedView
                  style={[
                    styles.searchIconContainer,
                    animatedIconStyle,
                    iconStyle,
                  ]}
                >
                  {renderLeadingIcons ? (
                    renderLeadingIcons()
                  ) : (
                    <SymbolView
                      name="magnifyingglass"
                      size={18}
                      tintColor="#8E8E93"
                      fallback={
                        <Ionicons name="search" size={18} color="#8E8E93" />
                      }
                    />
                  )}
                </AnimatedView>

                <AnimatedView style={[styles.inputWrapper, animatedInputWrapperStyle]}>
                  <AnimatedTextInput
                    {...textInputProps}
                    ref={inputRef}
                    style={[
                      styles.input,
                      { fontSize: 17 * fontScale },
                      animatedInputStyle,
                      inputStyle,
                    ]}
                    cursorColor={tint ?? "#007AFF"}
                    placeholder={placeholder}
                    placeholderTextColor="#8E8E93"
                    value={query}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    selectionColor={tint ?? "#007AFF"}
                  />
                </AnimatedView>

                {Platform.OS === "ios" && (
                  <AnimatedBlurView
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        overflow: "hidden",
                      },
                    ]}
                    animatedProps={animatedBlurViewProps}
                    pointerEvents={"none"}
                  />
                )}
                {query.length > 0 && (
                  <AnimatedTouchable
                    onPress={handleClear}
                    style={[styles.clearButton, animatedClearButtonStyle]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {renderTrailingIcons ? (
                      renderTrailingIcons()
                    ) : (
                      <SymbolView
                        name="xmark.circle.fill"
                        size={18}
                        tintColor="#8E8E93"
                      />
                    )}
                  </AnimatedTouchable>
                )}
              </AnimatedView>
            </View>
          </BlurView>
        </AnimatedView>

        {shouldShowCancelButton ? (
          <AnimatedView
            style={[styles.cancelButtonContainer, animatedCancelStyle]}
          >
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <AccessibleText
                size={17}
                style={[
                  styles.cancelText,
                  {
                    color: tint ?? "#007AFF",
                  },
                ]}
              >
                Cancel
              </AccessibleText>
            </TouchableOpacity>
          </AnimatedView>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },
  searchBarContainer: {
    flexShrink: 1,
    minWidth: 0,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  searchContainer: {
    backgroundColor: "rgba(118, 118, 128, 0.12)",
    borderRadius: 12,
    minHeight: 35,
    justifyContent: "center",
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 5,
  },
  searchIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    flex: 1,
    width: "100%",
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "System",
    fontWeight: "400",

    includeFontPadding: false,
    textAlignVertical: "center",
    minHeight: 24,

    textAlign: "left",
  },
  clearButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  cancelButtonContainer: {
    paddingLeft: 12,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  cancelText: {
    fontSize: 17,
    fontFamily: "System",
    fontWeight: "400",
  },
});
