import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { adminService } from "../admin.service";
import { AdminStatus, AdminUser } from "../admin.types";
import AdminEmptyState from "../components/AdminEmptyState";
import AdminHeader from "../components/AdminHeader";
import AdminListItem from "../components/AdminListItem";
import AdminSearch from "../components/AdminSearch";

const COLORS = {
  background: "#FAFAFF",
  secondary: "#3E829A",
  muted: "#7A7F99",
};

export interface AdminUsersScreenProps {
  onMenuPress: () => void;
}

const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ onMenuPress }) => {
  const router = useRouter();
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await adminService.getUsers();
      setUsers(data);
      setStatus(data.length ? "success" : "empty");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.subtitle.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AdminHeader
        title="Usuários"
        subtitle="Todos os membros"
        onMenuPress={onMenuPress}
      />

      <View style={styles.searchWrap}>
        <AdminSearch
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar usuário…"
        />
      </View>

      {status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <AccessibleText
            size={14}
            className="font-atkinson"
            style={styles.hint}
          >
            Carregando usuários…
          </AccessibleText>
        </View>
      )}

      {status === "error" && (
        <AdminEmptyState
          icon="cloud-offline-outline"
          title="Erro ao carregar"
          description="Não foi possível obter os usuários."
        />
      )}

      {(status === "success" || status === "empty") && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <AdminListItem
              title={item.name}
              subtitle={item.subtitle}
              initials={item.initials}
              avatarShape="circle"
              onPress={() => router.push("/admin/users")}
            />
          )}
          ListEmptyComponent={
            <AdminEmptyState
              icon="people-outline"
              title="Nenhum usuário encontrado"
              description="Ajuste a busca para ver outros resultados."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  sep: { height: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { color: COLORS.muted, marginTop: 12 },
});

export default AdminUsersScreen;