import type { ComponentProps } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ProjectCard from "../../components/home/ProjectCard";

import { TAB_BAR_HEIGHT } from "../../constants/layout";
import Logo from "../../assets/images/logoLight.png";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];
type Category = { id: string; nome: string; icone: IoniconsName };
type Highlight = { id: string; titulo: string; local: string; data: string };

const { width } = Dimensions.get("window");

const CATEGORIAS: Category[] = [
  { id: "1", nome: "Projetos", icone: "bulb-outline" },
  { id: "2", nome: "Vagas", icone: "briefcase-outline" },
  { id: "3", nome: "Oportunidades", icone: "business-outline" },
  { id: "4", nome: "Eventos", icone: "calendar-outline" },
];

const DESTAQUES: Highlight[] = [
  {
    id: "1",
    titulo: "Semana de Tecnologia",
    local: "Unisuam / Bonsucesso",
    data: "12 Out",
  },
  { id: "2", titulo: "Hackathon Linka", local: "Remoto", data: "20 Out" },
  {
    id: "3",
    titulo: "Hackathon Bradesco",
    local: "Centro / Av. Rio Branco",
    data: "30 Dec",
  },
  {
    id: "4",
    titulo: "Palestra de Cyber Security",
    local: "Remoto",
    data: "15 Mai",
  },
];

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        {/* HEADER */}
        <View className="flex-row justify-between bg-[#002B5B] items-center px-5 py-4">
          {/* <TouchableOpacity>
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity> */}

          <View className="flex justify-center items-center gap-4 flex-row">
            <Text className="bg-black/40 rounded-xl p-1">
              <Image
                source={Logo}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Text>
            <Text className="text-white text-2xl text-center font-bold font-atkinson-bold">
              Linka
            </Text>
          </View>

          <View className="flex-row">
            {/* <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="#fff" style={{ marginRight: 15 }} />
          </TouchableOpacity> */}
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white"
          contentContainerStyle={{
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20,
          }}
        >
          {/* ÁREA AZUL */}
          <View className="px-5 pb-20 pt-2 bg-[#002B5B]">
            <Text className="text-white text-3xl font-bold font-atkinson-bold">
              Olá, Aluno!
            </Text>
            <Text className="text-[#BDC3C7] text-base mt-1 font-atkinson">
              O que vamos descobrir hoje?
            </Text>
          </View>

          {/* ÁREA BRANCA */}
          <View className="bg-white rounded-t-[50px] px-2 pt-8 -mt-14">
            {/* CATEGORIAS */}
            <Text className="text-lg font-bold text-[#002B5B] mb-4">
              Categorias
            </Text>

            <FlatList
              horizontal
              data={CATEGORIAS}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity className="flex-row items-center bg-[#2a2a2a] px-4 py-2 rounded-full mr-3 mb-6 border border-zinc-800">
                  <Ionicons name={item.icone} size={20} color="#fff" />
                  <Text className="ml-2 text-zinc-200 font-medium">
                    {item.nome}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* DESTAQUES */}
            <Text className="text-lg font-bold text-[#002B5B] mb-4">
              Destaques
            </Text>

            <FlatList
              horizontal
              data={DESTAQUES}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  className="bg-[#F1F3F5] rounded-2xl mr-4 mb-6 overflow-hidden"
                  style={{ width: width * 0.7 }}
                >
                  <View className="h-[130px] bg-[#D1D5DB]" />

                  <View className="p-4">
                    <Text className="font-bold text-base text-[#333]">
                      {item.titulo}
                    </Text>
                    <Text className="text-xs text-[#666] mt-1">
                      {item.data} - {item.local}
                    </Text>
                  </View>
                </View>
              )}
            />

            {/* PROJETOS */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-[#002B5B]">
                Projetos em alta
              </Text>
              <TouchableOpacity>
                <Text className="text-[#666] text-xs">Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ProjectCard
              title="Aplicativo para Idosos"
              subtitle="Play Store / Apple Store"
            />

            <ProjectCard
              title="Aplicativo para Crianças Especiais"
              subtitle="Play Store / Apple Store"
            />

            <ProjectCard
              title="Consultório de Advocacia"
              subtitle="Centro - RJ"
            />

            <ProjectCard
              title="Consultório de Psicologia"
              subtitle="Santa Cruz - RJ"
            />
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          className="absolute bottom-[12%] right-6 bg-[#FFD700] w-[65px] h-[65px] rounded-full justify-center items-center"
          style={styles.fabShadow}
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
