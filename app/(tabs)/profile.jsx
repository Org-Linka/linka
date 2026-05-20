import React, { useState } from "react";
import { View, Text, ScrollView, Alert, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { TAB_BAR_HEIGHT } from "@/constants/layout";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import InfoCard from "@/components/profile/InfoCard";
import InfoRow from "@/components/profile/InfoRow";
import ProjectSection from "@/components/profile/ProjectSection";
import SocialLinks from "@/components/profile/SocialLinks";
import LogoutButton from "@/components/profile/LogoutButton";
import { Ionicons } from "@expo/vector-icons";

export default function StudentProfile() {

  const insets = useSafeAreaInsets();
  const [screenMode, setScreenMode] = useState("main");

  const [userData, setUserData] = useState ({
    name: "Nome de usuário",
    course: "Análise e Desenv. de Sistemas",
    bio: "Estudante de Análise e Desenvolvimento de Sistemas, com interesse em desenvolvimento full stack, tecnologia social e criação de soluções acessíveis. Busco oportunidades para aplicar meus conhecimentos em projetos reais e continuar evoluindo profissionalmente.",

    email: "aluno@example.com",
    phone: "(11) 98765-4321",

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
      linkedin: "",
      github: "https://github.com/mizuno-p",
      instagram: "",
      portfolio: ""
    }
  });

  const [personalForm, setPersonalForm] = useState({
    name: userData.name,
    bio: userData.bio,
    email: userData.email,
    phone: userData.phone,
    linkedin: userData.links.linkedin,
    github: userData.links.github,
    instagram: userData.links.instagram,
    portfolio: userData.links.portfolio,
  });

  const [academicForm, setAcademicForm] = useState({
    university: userData.university,
    course: userData.course,
    semester: userData.semester,
  });

  const [skillsForm, setSkillsForm] = useState({
    field: userData.field,
    tools: userData.tools,
    languages: userData.languages,
    skills: userData.skills,
  });

  async function handlePickProfileImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para alterar sua foto de perfil."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUserData((prev) => ({
      ...prev,
      avatarUrl: result.assets[0].uri,
    }));

  }

  function handleSavePersonalData() {
    setUserData((prev => ({
      ...prev,
      name: personalForm.name,
      bio: personalForm.bio,
      email: personalForm.email,
      phone: personalForm.phone,
      links: {
        ...prev.links,
        linkedin: personalForm.linkedin,
        github: personalForm.github,
        instagram: personalForm.instagram,
        portfolio: personalForm.portfolio,
      },
    })));

    Alert.alert(
      "Sucesso",
      "Informações pessoais atualizadas."
    );
    setScreenMode("main");
  }

  function handleSaveAcademicData() {
    setUserData((prev) => ({
      ...prev,
      university: academicForm.university,
      course: academicForm.course,
      semester: academicForm.semester,
    }));

    Alert.alert(
      "Sucesso", 
      "Dados acadêmicos atualizados."
    );
    setScreenMode("main");
  }

  function handleSaveSkillsData() {
    setUserData((prev) => ({
      ...prev,
      field: skillsForm.field,
      tools: skillsForm.tools,
      languages: skillsForm.languages,
      skills: skillsForm.skills,
    }));

    Alert.alert(
      "Sucesso", 
      "Habilidades atualizadas."
    );
    setScreenMode("main");
  }

  if (screenMode === "personal") {
    return (
      <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
        <View className="flex-1 bg-white">
          <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
            <TouchableOpacity onPress={() => setScreenMode("main")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text className="ml-4 text-white text-xl font-bold">
              Editar Perfil
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20,
            }}
          >
            <View className="items-center mb-8">
              <TouchableOpacity onPress={handlePickProfileImage} className="relative">
                <View className="w-28 h-28 rounded-full border border-zinc-200 overflow-hidden bg-zinc-200 justify-center items-center">
                  {userData.avatarUrl ? (
                    <Image source={{ uri: userData.avatarUrl }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="person" size={50} color="#666" />
                  )}
                </View>

                <View className="absolute bottom-0 right-0 bg-[#ffd700] p-2 rounded-full">
                  <Ionicons name="camera" size={18} color="#000" />
                </View>
              </TouchableOpacity>

              <Text className="mt-3 text-sm text-zinc-500">
                Alterar foto de perfil
              </Text>
            </View>

            <ProfileInput
              label="Nome completo"
              placeholder="Digite seu nome"
              value={personalForm.name}
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, name: value }))
              }
            />

            <ProfileInput
              label="Bio"
              placeholder="Conte um pouco sobre você"
              value={personalForm.bio}
              multiline
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, bio: value }))
              }
            />

            <ProfileInput
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={personalForm.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, email: value }))
              }
            />

            <ProfileInput
              label="Telefone"
              placeholder="Digite seu telefone"
              value={personalForm.phone}
              keyboardType="phone-pad"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, phone: value }))
              }
            />

            <ProfileInput
              label="LinkedIn"
              placeholder="Link do LinkedIn"
              value={personalForm.linkedin}
              autoCapitalize="none"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, linkedin: value }))
              }
            />

            <ProfileInput
              label="GitHub"
              placeholder="Link do GitHub"
              value={personalForm.github}
              autoCapitalize="none"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, github: value }))
              }
            />

            <ProfileInput
              label="Instagram"
              placeholder="Link do Instagram"
              value={personalForm.instagram}
              autoCapitalize="none"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, instagram: value }))
              }
            />

            <ProfileInput
              label="Portfólio"
              placeholder="Link do portfólio"
              value={personalForm.portfolio}
              autoCapitalize="none"
              onChangeText={(value) =>
                setPersonalForm((prev) => ({ ...prev, portfolio: value }))
              }
            />

            <TouchableOpacity
              onPress={handleSavePersonalData}
              className="mt-4 rounded-2xl bg-[#002B5B] py-4"
            >
              <Text className="text-center text-white font-bold text-base">
                Salvar alterações
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screenMode === "academic") {
    return (
      <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
        <View className="flex-1 bg-white">
          <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
            <TouchableOpacity onPress={() => setScreenMode("main")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text className="ml-4 text-white text-xl font-bold">
              Editar Dados Acadêmicos
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20,
            }}
          >

            <ProfileInput
              label="Universidade"
              placeholder="Digite sua universidade"
              value={academicForm.university}
              onChangeText={(value) =>
                setAcademicForm((prev) => ({ ...prev, university: value }))
              }
            />

            <ProfileInput
              label="Curso"
              placeholder="Digite seu curso"
              value={academicForm.course}
              onChangeText={(value) =>
                setAcademicForm((prev) => ({ ...prev, course: value }))
              }
            />

            <ProfileInput
              label="Semestre"
              placeholder="Ex: 4° semestre"
              value={academicForm.semester}
              onChangeText={(value) =>
                setAcademicForm((prev) => ({ ...prev, semester: value }))
              }
            />

            <TouchableOpacity
              onPress={handleSaveAcademicData}
              className="mt-4 rounded-2xl bg-[#002B5B] py-4"
            >
              <Text className="text-center text-white font-bold text-base">
                Salvar alterações
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (screenMode === "skills") {
    return (
      <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
        <View className="flex-1 bg-white">
          <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
            <TouchableOpacity onPress={() => setScreenMode("main")}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text className="ml-4 text-white text-xl font-bold">
              Editar Habilidades
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20,
            }}
          >
            <ProfileInput
              label="Área de foco"
              placeholder="Ex: Desenvolvimento Full Stack"
              value={skillsForm.field}
              onChangeText={(value) =>
                setSkillsForm((prev) => ({ ...prev, field: value }))
              }
            />

            <ProfileInput
              label="Ferramentas"
              placeholder="Ex: React, Git, Node.js"
              value={skillsForm.tools}
              multiline
              onChangeText={(value) =>
                setSkillsForm((prev) => ({ ...prev, tools: value }))
              }
            />

            <ProfileInput
              label="Idiomas"
              placeholder="Ex: Inglês, Espanhol"
              value={skillsForm.languages}
              onChangeText={(value) =>
                setSkillsForm((prev) => ({ ...prev, languages: value }))
              }
            />

            <ProfileInput
              label="Habilidades"
              placeholder="Ex: Comunicação, trabalho em equipe"
              value={skillsForm.skills}
              multiline
              onChangeText={(value) =>
                setSkillsForm((prev) => ({ ...prev, skills: value }))
              }
            />

            <TouchableOpacity
              onPress={handleSaveSkillsData}
              className="mt-4 rounded-2xl bg-[#002B5B] py-4"
            >
              <Text className="text-center text-white font-bold text-base">
                Salvar alterações
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002b5b]" edges={["top"]}>

      <View className="flex-1 bg-white">

        <ProfileHeader />

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <ProfileInfo 
            user={userData}
            onPickImage={handlePickProfileImage}
          />

          <View className="bg-white rounded-t-[50px] px-6 pt-10 -mt-12 flex-1">

            <InfoCard
              title="Sobre mim"
              icon="document-text-outline"
            >
              <Text className="text-zinc-700 text-sm leading-6">
                  {userData.bio || "Nenhuma bio adicionada ainda."}
              </Text>
            </InfoCard>

            <InfoCard
              title="Informações Pessoais"
              icon="person-outline"
              onEdit={() => setScreenMode("personal")}
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

            <InfoCard 
              title="Dados Acadêmicos"
              icon="school-outline"
              onEdit={() => setScreenMode("academic")}
            >

              <InfoRow 
                label="Universidade" 
                value={userData.university} 
              />

              <InfoRow 
                label="Curso" 
                value={userData.course} 
              />

              <InfoRow 
                label="Semestre" 
                value={userData.semester} 
                isLast 
              />

            </InfoCard>

            <InfoCard
              title="Habilidades"
              icon="star-outline"
              onEdit={() => setScreenMode("skills")}
            >
              <InfoRow
                label="Áreas de foco"
                value={userData.field}
              />
            
              <InfoRow
                label="Ferramentas"
                value={userData.tools}
              />
        
              <InfoRow
                label="Idiomas"
                value={userData.languages}
              />
        
              <InfoRow
                label="Habilidades"
                value={userData.skills}
                isLast
              />
            </InfoCard>

            <ProjectSection
              projects={userData.projects}
            />

            <SocialLinks
              links={userData.links}
              onEdit={() => setScreenMode("personal")}
            />

            <LogoutButton />

          </View>
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

function ProfileInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  multiline = false,
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-bold text-zinc-700">
        {label}
      </Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#a1a1aa"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 ${
          multiline ? "min-h-[120px] py-4" : "py-4"
        }`}
      />
    </View>
  );
}
