import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { getSupabaseClient } from "@/shared/lib/supabase";

type AdminProjectItem = {
  id: string;
  title: string;
  status: string;
  owner_id: string;
  published_at: string | null;
};

export default function AdminProjectsScreen() {
  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
          .from("projects")
          .select("id, title, status, owner_id, published_at")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data ?? []);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <View className="flex-row items-center bg-[#2F3B69] px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <AccessibleText className="ml-4 text-xl font-bold text-white">Projetos</AccessibleText>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <AccessibleText className="mt-3 text-zinc-500 dark:text-zinc-400">Carregando projetos...</AccessibleText>
          </View>
        ) : (
          <AnimatedScreenScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {projects.map((project) => (
              <View
                key={project.id}
                className="mb-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-[#f8fafc] p-4"
              >
                <AccessibleText className="text-base font-bold text-[#2F3B69] dark:text-blue-100">
                  {project.title}
                </AccessibleText>

                <AccessibleText className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Dono: {project.owner_id}
                </AccessibleText>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <AccessibleText className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {project.status}
                  </AccessibleText>

                  {project.published_at ? (
                    <AccessibleText className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      Publicado
                    </AccessibleText>
                  ) : (
                    <AccessibleText className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      Não publicado
                    </AccessibleText>
                  )}
                </View>
              </View>
            ))}

            {projects.length === 0 ? (
              <AccessibleText className="text-center text-zinc-500 dark:text-zinc-400">
                Nenhum projeto encontrado.
              </AccessibleText>
            ) : null}
          </AnimatedScreenScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
