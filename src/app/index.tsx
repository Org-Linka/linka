import "@/global.css";
import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";

export default function Index() {
  const { isLoading, isAuthenticated, userType } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (userType === "admin") {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/home" />;
}
