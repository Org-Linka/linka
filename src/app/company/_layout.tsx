import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";

export default function CompanyLayout() {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (userType !== "company") {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}