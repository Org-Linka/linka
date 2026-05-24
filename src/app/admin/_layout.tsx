import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";

export default function AdminLayout() {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (userType !== "admin") {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}