import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <View className="rounded-3xl bg-white p-6">
          <Text className="text-3xl font-atkinson-bold text-zinc-900">
            Área da empresa
          </Text>

          <Text className="mt-3 text-base font-atkinson text-zinc-600">
            Login empresarial reconhecido com sucesso.
          </Text>

          <View className="mt-6 rounded-2xl bg-zinc-100 p-4">
            <Text className="text-sm font-atkinson-bold text-zinc-700">
              Conta logada
            </Text>

            <Text className="mt-2 text-base font-atkinson text-zinc-900">
              {user?.name ?? "Empresa"}
            </Text>

            <Text className="mt-1 text-sm font-atkinson text-zinc-500">
              {user?.email}
            </Text>

            <Text className="mt-3 text-xs font-atkinson-bold uppercase text-[#2f3b69]">
              Tipo: {user?.userType}
            </Text>
          </View>

          <Text className="mt-5 text-sm font-atkinson text-zinc-500">
            Essa tela é provisória. A área completa da empresa será criada em
            uma próxima issue.
          </Text>

          <TouchableOpacity
            className="mt-6 rounded-xl bg-zinc-200 py-4"
            activeOpacity={0.85}
            onPress={handleSignOut}
          >
            <Text className="text-center text-base font-atkinson-bold text-zinc-700">
              Sair
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}