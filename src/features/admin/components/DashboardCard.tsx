import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  accent: "#FFDE59",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

export interface DashboardCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  value,
  label,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={COLORS.secondary} />
        </View>

        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
      </View>

      <AccessibleText
        size={28}
        className="font-atkinson-bold"
        style={styles.value}
        numberOfLines={1}
      >
        {value}
      </AccessibleText>

      <AccessibleText
        size={13}
        className="font-atkinson"
        style={styles.label}
        numberOfLines={1}
      >
        {label}
      </AccessibleText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#2F3B69",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  value: {
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  label: {
    color: COLORS.muted,
    marginTop: 2,
  },
});

export default DashboardCard;
