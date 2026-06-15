/**
 * AdminMetricGrid.tsx
 * -----------------------------------------------------------------------------
 * Grade 2x2 de DashboardCards exibindo as métricas agregadas (AdminStats).
 * Cada card é clicável e leva à respectiva listagem.
 */

import React from "react";
import { StyleSheet, View } from "react-native";
import { AdminStats } from "../admin.types";
import DashboardCard from "./DashboardCard";

export interface AdminMetricGridProps {
  stats: AdminStats;
  onPressUsers?: () => void;
  onPressProjects?: () => void;
  onPressCompanies?: () => void;
  onPressOpportunities?: () => void;
}

const AdminMetricGrid: React.FC<AdminMetricGridProps> = ({
  stats,
  onPressUsers,
  onPressProjects,
  onPressCompanies,
  onPressOpportunities,
}) => {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <DashboardCard
          icon="people-outline"
          value={stats.users}
          label="Usuários"
          onPress={onPressUsers}
        />
        <View style={styles.gap} />
        <DashboardCard
          icon="cube-outline"
          value={stats.projects}
          label="Projetos"
          onPress={onPressProjects}
        />
      </View>

      <View style={styles.rowSpacer} />

      <View style={styles.row}>
        <DashboardCard
          icon="business-outline"
          value={stats.companies}
          label="Empresas"
          onPress={onPressCompanies}
        />
        <View style={styles.gap} />
        <DashboardCard
          icon="briefcase-outline"
          value={stats.opportunities}
          label="Vagas"
          onPress={onPressOpportunities}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  gap: {
    width: 14,
  },
  rowSpacer: {
    height: 14,
  },
});

export default AdminMetricGrid;
