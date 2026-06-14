/**
 * AdminOpportunitiesScreen.tsx
 * -----------------------------------------------------------------------------
 * Tela 5 — Vagas. Busca + lista com categoria (badge) e empresa/local.
 * Só visualização.
 */

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
import { AdminOpportunity, AdminStatus } from "../admin.types";
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

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => (
  <View style={styles.catBadge}>
    <Text style={styles.catText}>{category}</Text>
  </View>
);

export interface AdminOpportunitiesScreenProps {
  onMenuPress: () => void;
}

const AdminOpportunitiesScreen: React.FC<AdminOpportunitiesScreenProps> = ({
  onMenuPress,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [items, setItems] = useState<AdminOpportunity[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await adminService.getOpportunities();
      setItems(data);
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
    if (!q) return items;
    return items.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AdminHeader
        title="Vagas"
        subtitle="Oportunidades abertas"
        onMenuPress={onMenuPress}
      />

      <View style={styles.searchWrap}>
        <AdminSearch
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar vaga ou categoria…"
        />
      </View>

      {status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <Text style={styles.hint}>Carregando vagas…</Text>
        </View>
      )}

      {status === "error" && (
        <AdminEmptyState
          icon="cloud-offline-outline"
          title="Erro ao carregar"
          description="Não foi possível obter as vagas."
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
              title={item.title}
              subtitle={`${item.company} · ${item.location}`}
              right={<CategoryBadge category={item.category} />}
              showChevron={false}
              onPress={() => router.push("/admin/opportunities")}
            />
          )}
          ListEmptyComponent={
            <AdminEmptyState
              icon="briefcase-outline"
              title="Nenhuma vaga encontrada"
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
  catBadge: {
    backgroundColor: "#EEF4F7",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 4,
  },
  catText: {
    fontFamily: "AtkinsonHyperlegible-Regular",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },
});

export default AdminOpportunitiesScreen;
