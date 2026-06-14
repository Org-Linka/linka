/**
 * AdminProjectsScreen.tsx
 * -----------------------------------------------------------------------------
 * Tela 3 — Projetos. Busca + cards com tags e status visual. Só visualização.
 */

import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { adminService } from "../admin.service";
import { AdminProject, AdminProjectStatus, AdminStatus } from "../admin.types";
import AdminEmptyState from "../components/AdminEmptyState";
import AdminHeader from "../components/AdminHeader";
import AdminSearch from "../components/AdminSearch";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  background: "#FAFAFF",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

type StatusMeta = {
  label: string;
  bg: string;
  fg: string;
};

const STATUS_META: Record<AdminProjectStatus, StatusMeta> = {
  active: { label: "Ativo", bg: "#E4F2E9", fg: "#2E7D5B" },
  review: { label: "Em análise", bg: "#FCF3D6", fg: "#9A7A12" },
  paused: { label: "Pausado", bg: "#EFEFF4", fg: "#6B6F85" },
  done: { label: "Concluído", bg: "#E7EEF6", fg: "#2F3B69" },
};

interface StatusBadgeProps {
  status: AdminProjectStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
};

interface ProjectCardProps {
  project: AdminProject;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {project.title}
        </Text>

        <StatusBadge status={project.status} />
      </View>

      <Text style={styles.cardOwner} numberOfLines={1}>
        {project.owner}
      </Text>

      {project.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {project.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

export interface AdminProjectsScreenProps {
  onMenuPress: () => void;
}

const AdminProjectsScreen: React.FC<AdminProjectsScreenProps> = ({
  onMenuPress,
}) => {
  const router = useRouter();

  const [status, setStatus] = useState<AdminStatus>("loading");
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await adminService.getProjects();
      setProjects(data);
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

    if (!q) return projects;

    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AdminHeader
        title="Projetos"
        subtitle="Iniciativas da plataforma"
        onMenuPress={onMenuPress}
      />

      <View style={styles.searchWrap}>
        <AdminSearch
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar projeto ou tag…"
        />
      </View>

      {status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />

          <AccessibleText style={styles.hint}>
            Carregando projetos…
          </AccessibleText>
        </View>
      )}

      {status === "error" && (
        <AdminEmptyState
          icon="cloud-offline-outline"
          title="Erro ao carregar"
          description="Não foi possível obter os projetos."
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
            <ProjectCard
              project={item}
              onPress={() => router.push("/admin/projects")}
            />
          )}
          ListEmptyComponent={
            <AdminEmptyState
              icon="cube-outline"
              title="Nenhum projeto encontrado"
              description="Ajuste a busca para ver outros resultados."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  sep: {
    height: 12,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  hint: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 12,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  cardPressed: {
    opacity: 0.9,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  cardOwner: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  tag: {
    backgroundColor: "#EEF4F7",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.secondary,
  },

  badge: {
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default AdminProjectsScreen;
