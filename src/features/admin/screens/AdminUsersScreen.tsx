import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { getSupabaseClient } from "@/shared/lib/supabase";

type AdminUserItem = {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  status: string;
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, user_type, status")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setUsers(data ?? []);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <AccessibleText className="ml-4 text-xl font-bold text-white">Usuários</AccessibleText>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <AccessibleText className="mt-3 text-zinc-500 dark:text-zinc-400">Carregando usuários...</AccessibleText>
          </View>
        ) : (
          <AnimatedScreenScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {users.map((user) => (
              <View
                key={user.id}
                className="mb-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-[#f8fafc] p-4"
              >
                <AccessibleText className="text-base font-bold text-[#002B5B] dark:text-blue-100">
                  {user.full_name}
                </AccessibleText>

                <AccessibleText className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </AccessibleText>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <AccessibleText className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {user.user_type}
                  </AccessibleText>

                  <AccessibleText className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                    {user.status}
                  </AccessibleText>
                </View>
              </View>
            ))}

            {users.length === 0 ? (
              <AccessibleText className="text-center text-zinc-500 dark:text-zinc-400">
                Nenhum usuário encontrado.
              </AccessibleText>
            ) : null}
          </AnimatedScreenScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
