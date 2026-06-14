import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

const COLORS = {
  primary: "#2F3B69",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
  showLogo?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
  showLogo,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
        hitSlop={10}
        style={({ pressed }) => [
          styles.menuButton,
          pressed && styles.menuButtonPressed,
        ]}
      >
        <Ionicons name="menu" size={24} color={COLORS.primary} />
      </Pressable>

      <View style={styles.titleWrap}>
        <AccessibleText size={22} className="font-atkinson-bold">
          {title}
        </AccessibleText>

        {!!subtitle && (
          <AccessibleText size={13} className="font-atkinson">
            {subtitle}
          </AccessibleText>
        )}
      </View>

      {showLogo ? (
        <Image
          source={require("../../../../assets/images/logoLightLinka.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo"
        />
      ) : (
        <View style={styles.logoSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonPressed: {
    opacity: 0.7,
  },

  titleWrap: {
    flex: 1,
    marginLeft: 14,
  },

  logo: {
    width: 38,
    height: 38,
    marginLeft: 12,
  },

  logoSpacer: {
    width: 0,
    height: 38,
  },
});

export default AdminHeader;
