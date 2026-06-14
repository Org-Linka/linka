import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
  avatarBg: "#EEF1F8",
};

export interface AdminListItemProps {
  title: string;
  subtitle?: string;
  initials?: string;
  avatarShape?: "circle" | "square";
  right?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}

const AdminListItem: React.FC<AdminListItemProps> = ({
  title,
  subtitle,
  initials,
  avatarShape = "circle",
  right,
  showChevron = true,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {!!initials && (
        <View
          style={[
            styles.avatar,
            avatarShape === "square"
              ? styles.avatarSquare
              : styles.avatarCircle,
          ]}
        >
          <AccessibleText size={15} className="font-atkinson-bold">
            {initials}
          </AccessibleText>
        </View>
      )}

      <View style={styles.textWrap}>
        <AccessibleText
          size={15}
          className="font-atkinson-bold"
          numberOfLines={1}
        >
          {title}
        </AccessibleText>

        {!!subtitle && (
          <AccessibleText size={13} className="font-atkinson" numberOfLines={1}>
            {subtitle}
          </AccessibleText>
        )}
      </View>

      {right}

      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#7A7F99"
          style={styles.chevron}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  rowPressed: {
    opacity: 0.85,
  },

  avatar: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarCircle: {
    borderRadius: 22,
  },

  avatarSquare: {
    borderRadius: 12,
  },

  textWrap: {
    flex: 1,
  },

  chevron: {
    marginLeft: 8,
  },
});

export default AdminListItem;
