import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  muted: "#7A7F99",
  iconBg: "#EEF4F7",
};

export interface AdminEmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon = "file-tray-outline",
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={COLORS.secondary} />
      </View>

      <AccessibleText
        size={16}
        className="font-atkinson-bold"
        style={styles.title}
      >
        {title}
      </AccessibleText>

      {!!description && (
        <AccessibleText
          size={14}
          className="font-atkinson"
          style={styles.description}
        >
          {description}
        </AccessibleText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: COLORS.primary,
    textAlign: "center",
  },

  description: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});

export default AdminEmptyState;
