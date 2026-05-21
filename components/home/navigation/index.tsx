import { View, StyleSheet, Text, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/base/button";
import { CircleLoadingIndicator } from "@/components/ui/molecules/circle-loader";

const roundedFontFamily = Platform.select({
  ios: "SF Pro Rounded",
  default: undefined,
});

export default function App() {
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, [setLoading]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />

      <Button
        loadingText="Fetching…"
        isLoading={loading}
        onPress={onPress}
        loadingTextColor="#000"
        showLoadingIndicator
        loadingTextStyle={{
          fontFamily: roundedFontFamily,
        }}
        renderLoadingIndicator={() => (
          <View style={{ marginRight: 8 }}>
            <CircleLoadingIndicator
              dotRadius={3}
              dotSpacing={4}
              duration={500}
              style={styles.loader}
            />
          </View>
        )}
      >
        <View style={styles.btn}>
          <Ionicons name="arrow-forward" size={18} color="black" />
          <Text
            style={[
              styles.btnText,
              {
                fontFamily: roundedFontFamily,
              },
            ]}
          >
            Click Me!
          </Text>
        </View>
      </Button>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 110,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  btnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  loader: {
    height: 18,
  },
});
