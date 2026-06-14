import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

const COLORS = {
  primary: "#2F3B69",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

export interface AdminSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const AdminSearch: React.FC<AdminSearchProps> = ({
  value,
  onChangeText,
  placeholder = "Buscar…",
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={COLORS.muted} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        autoCorrect={false}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={8}
          accessibilityLabel="Limpar busca"
        >
          <Ionicons name="close-circle" size={18} color={COLORS.muted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.primary,
    paddingVertical: 0,
  },
});

export default AdminSearch;
