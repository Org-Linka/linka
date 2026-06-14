import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { adminService } from "../admin.service";
import { AdminStats, AdminStatus } from "../admin.types";
import AdminHeader from "../components/AdminHeader";
import AdminMetricGrid from "../components/AdminMetricGrid";
import AdminSection from "../components/AdminSection";

const COLORS = {
  primary: "#2F3B69",
  secondary: "#3E829A",
  accent: "#FFDE59",
  background: "#FAFAFF",
  surface: "#FFFFFF",
  border: "#ECECF4",
  muted: "#7A7F99",
};

type QuickLink = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route:
    | "/admin/users"
    | "/admin/projects"
    | "/admin/companies"
    | "/admin/opportunities";
};

const QUICK_LINKS: QuickLink[] = [
  { icon: "people-outline", label: "Usuários", route: "/admin/users" },
  { icon: "cube-outline", label: "Projetos", route: "/admin/projects" },
  { icon: "business-outline", label: "Empresas", route: "/admin/companies" },
  { icon: "briefcase-outline", label: "Vagas", route: "/admin/opportunities" },
];

export interface AdminDashboardScreenProps {
  onMenuPress: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onMenuPress,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [stats, setStats] = useState<AdminStats | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await adminService.getStats();
      setStats(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AdminHeader
        title="Dashboard"
        subtitle="Visão geral da plataforma"
        onMenuPress={onMenuPress}
        showLogo
      />

      {status === "loading" && (
        <View style={styles.centerFill}>
          <ActivityIndicator color={COLORS.secondary} />

          <AccessibleText
            size={14}
            className="font-atkinson"
            style={styles.centerHint}
          >
            Carregando métricas…
          </AccessibleText>
        </View>
      )}

      {status === "error" && (
        <View style={styles.centerFill}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={28}
              color={COLORS.secondary}
            />
          </View>

          <AccessibleText
            size={16}
            className="font-atkinson-bold"
            style={styles.errorTitle}
          >
            Não foi possível carregar
          </AccessibleText>

          <AccessibleText
            size={14}
            className="font-atkinson"
            style={styles.errorDesc}
          >
            Verifique a conexão e tente novamente.
          </AccessibleText>

          <Pressable
            onPress={load}
            style={({ pressed }) => [
              styles.retry,
              pressed && styles.retryPressed,
            ]}
          >
            <Ionicons name="refresh" size={16} color={COLORS.primary} />

            <AccessibleText
              size={14}
              className="font-atkinson-bold"
              style={styles.retryText}
            >
              Tentar novamente
            </AccessibleText>
          </Pressable>
        </View>
      )}

      {status === "success" && stats && (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AdminSection title="Resumo">
            <AdminMetricGrid
              stats={stats}
              onPressUsers={() => router.push("/admin/users")}
              onPressProjects={() => router.push("/admin/projects")}
              onPressCompanies={() => router.push("/admin/companies")}
              onPressOpportunities={() => router.push("/admin/opportunities")}
            />
          </AdminSection>

          <AdminSection title="Navegação rápida">
            <View style={styles.quickGrid}>
              {QUICK_LINKS.map((link) => (
                <Pressable
                  key={link.route}
                  onPress={() => router.push(link.route)}
                  style={({ pressed }) => [
                    styles.quickItem,
                    pressed && styles.quickItemPressed,
                  ]}
                >
                  <View style={styles.quickIcon}>
                    <Ionicons
                      name={link.icon}
                      size={18}
                      color={COLORS.secondary}
                    />
                  </View>

                  <AccessibleText
                    size={15}
                    className="font-atkinson"
                    style={styles.quickLabel}
                  >
                    {link.label}
                  </AccessibleText>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.muted}
                  />
                </Pressable>
              ))}
            </View>
          </AdminSection>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },

  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  centerHint: {
    color: COLORS.muted,
    marginTop: 12,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EEF4F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  errorTitle: {
    color: COLORS.primary,
  },

  errorDesc: {
    color: COLORS.muted,
    marginTop: 6,
    textAlign: "center",
  },

  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },

  retryPressed: {
    opacity: 0.85,
  },

  retryText: {
    color: COLORS.primary,
  },

  quickGrid: {
    gap: 10,
  },

  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  quickItemPressed: {
    opacity: 0.85,
  },

  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEF4F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  quickLabel: {
    flex: 1,
  },
});

export default AdminDashboardScreen;
