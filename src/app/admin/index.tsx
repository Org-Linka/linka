import React from "react";
import AdminDashboardScreen from "../../features/admin/screens/AdminDashboardScreen";
import { openAdminDrawer } from "./_layout";

export default function AdminIndexRoute() {
  return <AdminDashboardScreen onMenuPress={openAdminDrawer} />;
}
