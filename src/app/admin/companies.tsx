import React from "react";
import AdminCompaniesScreen from "../../features/admin/screens/AdminCompaniesScreen";
import { openAdminDrawer } from "./_layout";

export default function AdminCompaniesRoute() {
  return <AdminCompaniesScreen onMenuPress={openAdminDrawer} />;
}
