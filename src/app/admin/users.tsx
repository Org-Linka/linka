import React from "react";
import AdminUsersScreen from "../../features/admin/screens/AdminUsersScreen";
import { openAdminDrawer } from "./_layout";

export default function AdminUsersRoute() {
  return <AdminUsersScreen onMenuPress={openAdminDrawer} />;
}
