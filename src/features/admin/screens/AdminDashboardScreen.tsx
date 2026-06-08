import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { useAuth } from "@/features/auth/auth.context";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";

type AdminCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function AdminCard({ title, description, icon, onPress }: AdminCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-[#f8fafc] p-5"
    >
      <View className="mb-3 flex-row items-center">
        <View className="rounded-xl bg-[#002B5B]/10 p-3">
          <Ionicons name={icon} size={22} color="#002B5B" />
        </View>

        <AccessibleText className="ml-3 text-lg font-bold text-[#002B5B] dark:text-blue-100">
          {title}
        </AccessibleText>
      </View>

      <AccessibleText className="text-sm leading-5 text-zinc-600 dark:text-zinc-300">{description}</AccessibleText>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <AppTopBar title="Painel Admin" rightIcon="settings-outline" />

        <AnimatedScreenScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        >
          <AccessibleText className="mb-2 text-2xl font-bold text-[#002B5B] dark:text-blue-100">
            Olá, {user?.name ?? "Admin"}
          </AccessibleText>

          <AccessibleText className="mb-6 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            Gerencie usuários, projetos e publicações da plataforma Linka.
          </AccessibleText>

          <AdminCard
            title="Usuários"
            description="Visualize estudantes, empresas e administradores cadastrados."
            icon="people-outline"
            onPress={() => router.push("/admin/users")}
          />

          <AdminCard
            title="Projetos"
            description="Acompanhe projetos enviados, publicados ou pendentes de revisão."
            icon="folder-open-outline"
            onPress={() => router.push("/admin/projects")}
          />

          <AdminCard
            title="Relatórios"
            description="Área reservada para métricas futuras da plataforma."
            icon="stats-chart-outline"
            onPress={() => {}}
          />

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <AccessibleText className="ml-2 font-bold text-red-500">Sair</AccessibleText>
          </TouchableOpacity>
        </AnimatedScreenScrollView>
      </View>
    </SafeAreaView>
  );
}
