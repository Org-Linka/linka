import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { useAuth } from "@/features/auth/auth.context";

export default function CompanyHomeScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]">
      <View className="flex-1 justify-center px-6">
        <View className="rounded-3xl bg-white dark:bg-zinc-900 p-6">
          <AccessibleText className="text-3xl font-atkinson-bold text-zinc-900 dark:text-white">
            Área da empresa
          </AccessibleText>

          <AccessibleText className="mt-3 text-base font-atkinson text-zinc-600 dark:text-zinc-300">
            Login empresarial reconhecido com sucesso.
          </AccessibleText>

          <View className="mt-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-4">
            <AccessibleText className="text-sm font-atkinson-bold text-zinc-700 dark:text-zinc-200">
              Conta logada
            </AccessibleText>

            <AccessibleText className="mt-2 text-base font-atkinson text-zinc-900 dark:text-white">
              {user?.name ?? "Empresa"}
            </AccessibleText>

            <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
              {user?.email}
            </AccessibleText>

            <AccessibleText className="mt-3 text-xs font-atkinson-bold uppercase text-[#2f3b69] dark:text-blue-100">
              Tipo: {user?.userType}
            </AccessibleText>
          </View>

          <AccessibleText className="mt-5 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
            Essa tela é provisória. A área completa da empresa será criada em
            uma próxima issue.
          </AccessibleText>

          <TouchableOpacity
            className="mt-6 rounded-xl bg-zinc-200 py-4"
            activeOpacity={0.85}
            onPress={handleSignOut}
          >
            <AccessibleText className="text-center text-base font-atkinson-bold text-zinc-700 dark:text-zinc-200">
              Sair
            </AccessibleText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
