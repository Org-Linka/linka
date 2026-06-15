import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { adminService } from "../admin.service";
import { AdminCompany, AdminStatus } from "../admin.types";
import AdminEmptyState from "../components/AdminEmptyState";
import AdminHeader from "../components/AdminHeader";
import AdminListItem from "../components/AdminListItem";
import AdminSearch from "../components/AdminSearch";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  background: "#FAFAFF",
  muted: "#7A7F99",
};

const RolesBadge: React.FC<{ count: number }> = ({ count }) => (
  <View style={styles.rolesBadge}>
    <Text style={styles.rolesNumber}>{count}</Text>
    <Text style={styles.rolesLabel}>vagas</Text>
  </View>
);

export interface AdminCompaniesScreenProps {
  onMenuPress: () => void;
}

const AdminCompaniesScreen: React.FC<AdminCompaniesScreenProps> = ({
  onMenuPress,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await adminService.getCompanies();
      setCompanies(data);
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
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.segment.toLowerCase().includes(q),
    );
  }, [companies, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AdminHeader
        title="Empresas"
        subtitle="Parceiras da plataforma"
        onMenuPress={onMenuPress}
      />

      <View style={styles.searchWrap}>
        <AdminSearch
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar empresa…"
        />
      </View>

      {status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <Text style={styles.hint}>Carregando empresas…</Text>
        </View>
      )}

      {status === "error" && (
        <AdminEmptyState
          icon="cloud-offline-outline"
          title="Erro ao carregar"
          description="Não foi possível obter as empresas."
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
              subtitle={item.segment}
              initials={item.initials}
              avatarShape="square"
              right={<RolesBadge count={item.openRoles} />}
              onPress={() => router.push("/admin/companies")}
            />
          )}
          ListEmptyComponent={
            <AdminEmptyState
              icon="business-outline"
              title="Nenhuma empresa encontrada"
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
  hint: {
    fontFamily: "AtkinsonHyperlegible-Regular",
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 12,
  },
  rolesBadge: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  rolesNumber: {
    fontFamily: "AtkinsonHyperlegible-Regular",
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  rolesLabel: {
    fontFamily: "AtkinsonHyperlegible-Regular",
    fontSize: 11,
    color: COLORS.muted,
  },
});

export default AdminCompaniesScreen;
