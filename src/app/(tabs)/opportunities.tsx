import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";
import OpportunitiesScreen from "@/features/opportunities/screens/OpportunitiesScreen";

export default function OpportunitiesRoute() {
  const { isLoading, userType } = useAuth();

  if (isLoading) {
    return null;
  }

  if (userType === "company") {
    return <Redirect href="/home" />;
  }

  if (userType === "admin") {
    return <Redirect href="/admin/index" />;
  }

  return <OpportunitiesScreen />;
}

// Empresas aind não acessam catálogo do aluno. 
// A aba permanece visível temporariamente caso o fluxo de empresa utilize
// essa entrada para outra tela
