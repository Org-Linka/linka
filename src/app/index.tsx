import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";

export default function IndexScreen() {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (userType === "company") {
    return <Redirect href="/company" />;
  }

  if (userType === "admin") {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/home" />;
}