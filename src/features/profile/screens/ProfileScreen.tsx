import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";

import { InfoCard } from "../components/InfoCard";
import { InfoRow } from "../components/InfoRow";
import { ProfileHero } from "../components/ProfileHero";
import { getCurrentProfile } from "../profile.service";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = getCurrentProfile();

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <AppTopBar title="Meu Perfil" rightIcon="settings-outline" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <ProfileHero user={user} />

          <View className="-mt-12 flex-1 rounded-t-[50px] bg-white px-6 pt-10">
            <Text className="mb-4 text-lg font-bold text-[#002b5b]">Minha Conta</Text>

            <InfoCard title="Informações Pessoais" icon="person-outline" onEdit={() => {}}>
              <InfoRow label="Nome Completo" value={user.name} />
              <InfoRow label="E-mail" value={user.email} />
              <InfoRow label="Telefone" value={user.phone} isLast />
            </InfoCard>

            <InfoCard title="Dados Acadêmicos" icon="school-outline">
              <InfoRow label="Matrícula" value={user.registration} />
              <InfoRow label="Universidade" value={user.university} />
              <InfoRow label="Curso" value={user.course} />
              <InfoRow label="Semestre" value={user.semester} isLast />
            </InfoCard>

            <InfoCard title="Segurança" icon="shield-checkmark-outline">
              <InfoRow label="Senha" value="********" isAction />
              <InfoRow label="Autenticação" value="Ativada" statusColor="text-green-600" isAction isLast />
            </InfoCard>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="mb-10 mt-6 flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 p-4"
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="ml-2 font-bold text-red-500">Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
