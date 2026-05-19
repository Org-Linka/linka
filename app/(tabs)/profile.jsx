import { View, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/constants/layout";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import InfoCard from "@/components/profile/InfoCard";
import InfoRow from "@/components/profile/InfoRow";
import SkillsSection from "@/components/profile/SkillsSection";
import ProjectSection from "@/components/profile/ProjectSection";
import SocialLinks from "@/components/profile/SocialLinks";
import LogoutButton from "@/components/profile/LogoutButton";

export default function StudentProfile() {
  const insets = useSafeAreaInsets();

  const userData = {
    name: "Nome de usuário",
    course: "Análise e Desenv. de Sistemas",
    email: "aluno@example.com",
    phone: "(11) 98765-4321",
    registration: "2021123456",
    university: "Universidade exemplo",
    semester: "4° semestre",
    avatarUrl: "https://github.com/mizuno-p.png",
    field: "Desenvolvimento Full Stack",
    tools: "Git/Github, JavaScript, React, Next.js",
    languages: "Inglês, Espanhol",
    skills: "Boa comunicação, trabalho em equipe, metodologias ágeis",

    projects: [
      { id: '1', title: "App para Idosos", subtitle: "Projeto Acadêmico" },
      { id: '2', title: "Plataforma de Pais Atípicos", subtitle: "Projeto Acadêmico" }
    ],

    links: {
      linkedin: "https://example.com",
      github: "https://github.com/mizuno-p",
      instagram: "https://instagram.com/seu-usuario",
      portfolio: "https://seu-portfolio.com"
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#002b5b]" edges={["top"]}>

      <View className="flex-1 bg-white">

        <ProfileHeader />

        <ScrollView 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <ProfileInfo user={userData} />

          <View className="bg-white rounded-t-[50px] px-6 pt-10 -mt-12 flex-1">

            <InfoCard
              title="Informações Pessoais"
              icon="person-outline"
            >
              <InfoRow
                label="Nome Completo"
                value={userData.name}
              />

              <InfoRow
                label="E-mail"
                value={userData.email}
              />

              <InfoRow
                label="Telefone"
                value={userData.phone}
                isLast
              />

            </InfoCard>

            <SkillsSection user={userData} />

            <ProjectSection
              projects={userData.projects}
            />

            <SocialLinks
              links={userData.links}
            />

            <LogoutButton />

          </View>
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}
