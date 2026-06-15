import React from "react";
import { StyleSheet, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

const COLORS = {
  primary: "#2F3B69",
  muted: "#7A7F99",
};

export interface AdminSectionProps {
  title: string;
  trailing?: string;
  children: React.ReactNode;
}

const AdminSection: React.FC<AdminSectionProps> = ({
  title,
  trailing,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AccessibleText size={16} className="font-atkinson-bold">
          {title}
        </AccessibleText>

        {!!trailing && (
          <AccessibleText size={13} className="font-atkinson">
            {trailing}
          </AccessibleText>
        )}
      </View>

      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default AdminSection;
