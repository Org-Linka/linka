import React from "react";
import AdminOpportunitiesScreen from "../../features/admin/screens/AdminOpportunitiesScreen";
import { openAdminDrawer } from "./_layout";

export default function AdminOpportunitiesRoute() {
  return <AdminOpportunitiesScreen onMenuPress={openAdminDrawer} />;
}
