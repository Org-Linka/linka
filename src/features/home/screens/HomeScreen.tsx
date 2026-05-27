import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { listHighlightedProjects } from "@/features/projects/project.service";

import { CategoryPill } from "../components/CategoryPill";
import { HighlightCard } from "../components/HighlightCard";
import { HomeHeader } from "../components/HomeHeader";
import { listHomeCategories, listHomeHighlights } from "../home.service";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const categories = listHomeCategories();
  const highlights = listHomeHighlights();
  const highlightedProjects = listHighlightedProjects();

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <HomeHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white"
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <View className="bg-[#002B5B] px-5 pb-20 pt-2">
            <Text className="text-3xl font-bold text-white font-atkinson-bold">Olá, Aluno!</Text>
            <Text className="mt-1 text-base text-[#BDC3C7] font-atkinson">
              O que vamos descobrir hoje?
            </Text>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white px-2 pt-8">
            <Text className="mb-4 text-lg font-bold text-[#002B5B]">Categorias</Text>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <CategoryPill category={item} />}
            />

            <Text className="mb-4 text-lg font-bold text-[#002B5B]">Destaques</Text>
            <FlatList
              horizontal
              data={highlights}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <HighlightCard highlight={item} width={width * 0.7} />}
            />

            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#002B5B]">Projetos em alta</Text>
              <TouchableOpacity>
                <Text className="text-xs text-[#666]">Ver todos</Text>
              </TouchableOpacity>
            </View>

            {highlightedProjects.map((project) => (
              <ProjectCard key={project.id} title={project.title} subtitle={project.subtitle} />
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
           className="absolute bottom-[12%] right-6 h-[65px] w-[65px] items-center       justify-center rounded-full bg-[#FFD700]"
          style={styles.fabShadow}
          activeOpacity={0.85}
          onPress={() => router.push("/projects/create" as Href)}
                  >
            <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fabShadow: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
