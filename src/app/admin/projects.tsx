import React from "react";
import AdminProjectsScreen from "../../features/admin/screens/AdminProjectsScreen";
import { openAdminDrawer } from "./_layout";

export default function AdminProjectsRoute() {
  return <AdminProjectsScreen onMenuPress={openAdminDrawer} />;
}
