import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text className="ml-4 text-xl font-bold text-white">Projetos</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-3 text-zinc-500">Carregando projetos...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {projects.map((project) => (
              <View
                key={project.id}
                className="mb-3 rounded-2xl border border-zinc-100 bg-[#f8fafc] p-4"
              >
                <Text className="text-base font-bold text-[#002B5B]">
                  {project.title}
                </Text>

                <Text className="mt-2 text-sm text-zinc-500">
                  Dono: {project.owner_id}
                </Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Text className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    {project.status}
                  </Text>

                  {project.published_at ? (
                    <Text className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      Publicado
                    </Text>
                  ) : (
                    <Text className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                      Não publicado
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {projects.length === 0 ? (
              <Text className="text-center text-zinc-500">
                Nenhum projeto encontrado.
              </Text>
            ) : null}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}