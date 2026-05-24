import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardTypeOptions,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useAuth } from "@/features/auth/auth.context";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";

import { InfoCard } from "../components/InfoCard";
import { InfoRow } from "../components/InfoRow";
import { ProfileHero } from "../components/ProfileHero";
import { ProjectSection } from "../components/ProjectSection";
import { SocialLinks } from "../components/SocialLinks";
import { getCurrentProfile } from "../profile.service";
import { getStoredProfile, saveStoredProfile } from "../profile.storage";
import type {
  CompanyForm,
  CompanyProfileUser,
  ProfileUser,
  StudentAcademicForm,
  StudentPersonalForm,
  StudentProfileUser,
  StudentSkillsForm,
} from "../profile.types";

type ScreenMode = "main" | "personal" | "academic" | "skills" | "company";

type ProfileInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  multiline?: boolean;
};

type EditLayoutProps = {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  bottomPadding: number;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userType, isLoading, signOut } = useAuth();
  const [screenMode, setScreenMode] = useState<ScreenMode>("main");
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 20;

  useEffect(() => {
    async function loadProfile() {
      if (!user || !userType) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const storedProfile = await getStoredProfile(user.id);
        const defaultProfile = getCurrentProfile(userType, user.email, user.name);

        setProfile(storedProfile ?? defaultProfile);
      } finally {
        setIsProfileLoading(false);
      }
    }

    loadProfile();
  }, [user, userType]);

  if (isLoading || isProfileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-atkinson text-zinc-500">Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!user || !userType || !profile) {
    router.replace("/login");
    return null;
  }

  const currentProfile = profile;
  const isCompany = currentProfile.userType === "company";

  async function persistProfile(nextProfile: ProfileUser) {
    if (!user) {
      Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
      return;
    }

    setProfile(nextProfile);
    await saveStoredProfile(user.id, nextProfile);
  }

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  async function handlePickProfileImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para alterar sua foto de perfil.",
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

    const nextProfile: ProfileUser = {
      ...currentProfile,
      avatarUrl: result.assets[0].uri,
    };

    await persistProfile(nextProfile);
  }

  if (currentProfile.userType === "student") {
    return (
      <StudentProfile
        userData={currentProfile}
        screenMode={screenMode}
        setScreenMode={setScreenMode}
        setProfile={persistProfile}
        bottomPadding={bottomPadding}
        onLogout={handleLogout}
        onPickImage={handlePickProfileImage}
      />
    );
  }

  return (
    <CompanyProfile
      companyData={currentProfile}
      screenMode={screenMode}
      setScreenMode={setScreenMode}
      setProfile={persistProfile}
      bottomPadding={bottomPadding}
      onLogout={handleLogout}
      onPickImage={handlePickProfileImage}
      title={isCompany ? "Perfil da Empresa" : "Meu Perfil"}
    />
  );
}

type StudentProfileProps = {
  userData: StudentProfileUser;
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
  setProfile: (profile: ProfileUser) => void | Promise<void>;
  bottomPadding: number;
  onLogout: () => void;
  onPickImage: () => void;
};

function StudentProfile({
  userData,
  screenMode,
  setScreenMode,
  setProfile,
  bottomPadding,
  onLogout,
  onPickImage,
}: StudentProfileProps) {
  const [personalForm, setPersonalForm] = useState<StudentPersonalForm>({
    name: userData.name,
    bio: userData.bio,
    email: userData.email,
    phone: userData.phone,
    linkedin: userData.links.linkedin,
    github: userData.links.github,
    instagram: userData.links.instagram,
    portfolio: userData.links.portfolio,
  });

  const [academicForm, setAcademicForm] = useState<StudentAcademicForm>({
    university: userData.university,
    course: userData.course,
    semester: userData.semester,
  });

  const [skillsForm, setSkillsForm] = useState<StudentSkillsForm>({
    field: userData.field,
    tools: userData.tools,
    languages: userData.languages,
    skills: userData.skills,
  });

  async function handleSavePersonalData() {
    await setProfile({
      ...userData,
      name: personalForm.name,
      bio: personalForm.bio,
      email: personalForm.email,
      phone: personalForm.phone,
      links: {
        linkedin: personalForm.linkedin,
        github: personalForm.github,
        instagram: personalForm.instagram,
        portfolio: personalForm.portfolio,
      },
    });

    Alert.alert("Sucesso", "Informações pessoais atualizadas.");
    setScreenMode("main");
  }

  async function handleSaveAcademicData() {
    await setProfile({
      ...userData,
      university: academicForm.university,
      course: academicForm.course,
      semester: academicForm.semester,
    });

    Alert.alert("Sucesso", "Dados acadêmicos atualizados.");
    setScreenMode("main");
  }

  async function handleSaveSkillsData() {
    await setProfile({
      ...userData,
      field: skillsForm.field,
      tools: skillsForm.tools,
      languages: skillsForm.languages,
      skills: skillsForm.skills,
    });

    Alert.alert("Sucesso", "Habilidades atualizadas.");
    setScreenMode("main");
  }

  if (screenMode === "personal") {
    return (
      <ProfileEditLayout
        title="Editar Perfil"
        onBack={() => setScreenMode("main")}
        bottomPadding={bottomPadding}
      >
        <AvatarEditor
          avatarUrl={userData.avatarUrl}
          icon="person"
          label="Alterar foto de perfil"
          onPress={onPickImage}
        />

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

        <SaveButton onPress={handleSavePersonalData} />
      </ProfileEditLayout>
    );
  }

  if (screenMode === "academic") {
    return (
      <ProfileEditLayout
        title="Editar Dados Acadêmicos"
        onBack={() => setScreenMode("main")}
        bottomPadding={bottomPadding}
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

        <SaveButton onPress={handleSaveAcademicData} />
      </ProfileEditLayout>
    );
  }

  if (screenMode === "skills") {
    return (
      <ProfileEditLayout
        title="Editar Habilidades"
        onBack={() => setScreenMode("main")}
        bottomPadding={bottomPadding}
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

        <SaveButton onPress={handleSaveSkillsData} />
      </ProfileEditLayout>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002b5b]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <AppTopBar title="Meu Perfil" rightIcon="settings-outline" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          <ProfileHero user={userData} onPickImage={onPickImage} />

          <View className="-mt-12 flex-1 rounded-t-[50px] bg-white px-6 pt-10">
            <InfoCard title="Sobre mim" icon="document-text-outline">
              <Text className="text-sm leading-6 text-zinc-700">
                {userData.bio || "Nenhuma bio adicionada ainda."}
              </Text>
            </InfoCard>

            <InfoCard
              title="Informações Pessoais"
              icon="person-outline"
              onEdit={() => setScreenMode("personal")}
            >
              <InfoRow label="Nome Completo" value={userData.name} />
              <InfoRow label="E-mail" value={userData.email} />
              <InfoRow label="Telefone" value={userData.phone} isLast />
            </InfoCard>

            <InfoCard
              title="Dados Acadêmicos"
              icon="school-outline"
              onEdit={() => setScreenMode("academic")}
            >
              <InfoRow label="Matrícula" value={userData.registration} />
              <InfoRow label="Universidade" value={userData.university} />
              <InfoRow label="Curso" value={userData.course} />
              <InfoRow label="Semestre" value={userData.semester} isLast />
            </InfoCard>

            <InfoCard
              title="Habilidades"
              icon="star-outline"
              onEdit={() => setScreenMode("skills")}
            >
              <InfoRow label="Áreas de foco" value={userData.field} />
              <InfoRow label="Ferramentas" value={userData.tools} />
              <InfoRow label="Idiomas" value={userData.languages} />
              <InfoRow label="Habilidades" value={userData.skills} isLast />
            </InfoCard>

            <ProjectSection projects={userData.projects} />

            <SocialLinks
              links={userData.links}
              onEdit={() => setScreenMode("personal")}
            />

            <LogoutButton onPress={onLogout} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type CompanyProfileProps = {
  companyData: CompanyProfileUser;
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
  setProfile: (profile: ProfileUser) => void | Promise<void>;
  bottomPadding: number;
  onLogout: () => void;
  onPickImage: () => void;
  title: string;
};

function CompanyProfile({
  companyData,
  screenMode,
  setScreenMode,
  setProfile,
  bottomPadding,
  onLogout,
  onPickImage,
}: CompanyProfileProps) {
  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    name: companyData.name,
    companyName: companyData.companyName,
    bio: companyData.bio,
    email: companyData.email,
    phone: companyData.phone,
    cnpj: companyData.cnpj,
    segment: companyData.segment,
    city: companyData.city,
    state: companyData.state,
    linkedin: companyData.links.linkedin,
    instagram: companyData.links.instagram,
    portfolio: companyData.links.portfolio,
  });

  async function handleSaveCompanyData() {
    await setProfile({
      ...companyData,
      name: companyForm.name,
      companyName: companyForm.companyName,
      bio: companyForm.bio,
      email: companyForm.email,
      phone: companyForm.phone,
      cnpj: companyForm.cnpj,
      segment: companyForm.segment,
      city: companyForm.city,
      state: companyForm.state,
      links: {
        linkedin: companyForm.linkedin,
        instagram: companyForm.instagram,
        portfolio: companyForm.portfolio,
      },
    });

    Alert.alert("Sucesso", "Perfil da empresa atualizado.");
    setScreenMode("main");
  }

  if (screenMode === "company") {
    return (
      <ProfileEditLayout
        title="Editar Empresa"
        onBack={() => setScreenMode("main")}
        bottomPadding={bottomPadding}
      >
        <AvatarEditor
          avatarUrl={companyData.avatarUrl}
          icon="business"
          label="Alterar imagem da empresa"
          onPress={onPickImage}
        />

        <ProfileInput
          label="Nome fantasia"
          placeholder="Digite o nome fantasia"
          value={companyForm.name}
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, name: value }))
          }
        />

        <ProfileInput
          label="Razão social"
          placeholder="Digite a razão social"
          value={companyForm.companyName}
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, companyName: value }))
          }
        />

        <ProfileInput
          label="Sobre a empresa"
          placeholder="Conte um pouco sobre a empresa"
          value={companyForm.bio}
          multiline
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, bio: value }))
          }
        />

        <ProfileInput
          label="E-mail"
          placeholder="Digite o e-mail"
          value={companyForm.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, email: value }))
          }
        />

        <ProfileInput
          label="Telefone"
          placeholder="Digite o telefone"
          value={companyForm.phone}
          keyboardType="phone-pad"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, phone: value }))
          }
        />

        <ProfileInput
          label="CNPJ"
          placeholder="Digite o CNPJ"
          value={companyForm.cnpj}
          keyboardType="number-pad"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, cnpj: value }))
          }
        />

        <ProfileInput
          label="Segmento"
          placeholder="Ex: Tecnologia"
          value={companyForm.segment}
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, segment: value }))
          }
        />

        <ProfileInput
          label="Cidade"
          placeholder="Digite a cidade"
          value={companyForm.city}
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, city: value }))
          }
        />

        <ProfileInput
          label="Estado"
          placeholder="Ex: SP"
          value={companyForm.state}
          autoCapitalize="characters"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, state: value }))
          }
        />

        <ProfileInput
          label="LinkedIn"
          placeholder="Link do LinkedIn"
          value={companyForm.linkedin}
          autoCapitalize="none"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, linkedin: value }))
          }
        />

        <ProfileInput
          label="Instagram"
          placeholder="Link do Instagram"
          value={companyForm.instagram}
          autoCapitalize="none"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, instagram: value }))
          }
        />

        <ProfileInput
          label="Website"
          placeholder="Link do site"
          value={companyForm.portfolio}
          autoCapitalize="none"
          onChangeText={(value) =>
            setCompanyForm((prev) => ({ ...prev, portfolio: value }))
          }
        />

        <SaveButton onPress={handleSaveCompanyData} />
      </ProfileEditLayout>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002b5b]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <AppTopBar title="Perfil da Empresa" rightIcon="settings-outline" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          <CompanyHero
            user={companyData}
            onPickImage={onPickImage}
          />

          <View className="-mt-12 flex-1 rounded-t-[50px] bg-white px-6 pt-10">
            <InfoCard
              title="Sobre a empresa"
              icon="document-text-outline"
              onEdit={() => setScreenMode("company")}
            >
              <Text className="text-sm leading-6 text-zinc-700">
                {companyData.bio || "Nenhuma descrição adicionada ainda."}
              </Text>
            </InfoCard>

            <InfoCard
              title="Dados da Empresa"
              icon="business-outline"
              onEdit={() => setScreenMode("company")}
            >
              <InfoRow label="Razão Social" value={companyData.companyName} />
              <InfoRow label="Nome Fantasia" value={companyData.name} />
              <InfoRow label="CNPJ" value={companyData.cnpj} />
              <InfoRow label="Segmento" value={companyData.segment} isLast />
            </InfoCard>

            <InfoCard
              title="Contato"
              icon="call-outline"
              onEdit={() => setScreenMode("company")}
            >
              <InfoRow label="E-mail" value={companyData.email} />
              <InfoRow label="Telefone" value={companyData.phone} />
              <InfoRow
                label="Localização"
                value={`${companyData.city} - ${companyData.state}`}
                isLast
              />
            </InfoCard>

            <ProjectSection
              projects={companyData.openPositions}
              emptyMessage="Nenhuma vaga cadastrada ainda."
            />

            <SocialLinks
              links={companyData.links}
              showGithub={false}
              onEdit={() => setScreenMode("company")}
            />

            <LogoutButton onPress={onLogout} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type CompanyHeroProps = {
  user: CompanyProfileUser;
  onPickImage: () => void;
};

function CompanyHero({ user, onPickImage }: CompanyHeroProps) {
  return (
    <View className="items-center bg-[#002b5b] px-5 pb-20 pt-6">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPickImage}
        className="relative"
      >
        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-zinc-300">
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="h-full w-full" />
          ) : (
            <Ionicons name="business" size={50} color="#666" />
          )}
        </View>

        <View className="absolute bottom-0 right-0 rounded-full bg-[#ffd700] p-2 shadow-sm">
          <Ionicons name="camera" size={18} color="#000" />
        </View>
      </TouchableOpacity>

      <Text className="mt-4 text-2xl font-bold text-white font-atkinson-bold">
        {user.name}
      </Text>
      <Text className="text-base text-[#bdc3c7] font-atkinson">
        {user.segment}
      </Text>
    </View>
  );
}

function ProfileEditLayout({
  title,
  children,
  onBack,
  bottomPadding,
}: EditLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center bg-[#002B5B] px-5 py-4">
          <TouchableOpacity activeOpacity={0.7} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text className="ml-4 text-xl font-bold text-white">{title}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 24,
            paddingBottom: bottomPadding,
          }}
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type AvatarEditorProps = {
  avatarUrl: string;
  icon: "person" | "business";
  label: string;
  onPress: () => void;
};

function AvatarEditor({ avatarUrl, icon, label, onPress }: AvatarEditorProps) {
  return (
    <View className="mb-8 items-center">
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="relative">
        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-200">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="h-full w-full" />
          ) : (
            <Ionicons name={icon} size={50} color="#666" />
          )}
        </View>

        <View className="absolute bottom-0 right-0 rounded-full bg-[#ffd700] p-2">
          <Ionicons name="camera" size={18} color="#000" />
        </View>
      </TouchableOpacity>

      <Text className="mt-3 text-sm text-zinc-500">{label}</Text>
    </View>
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
}: ProfileInputProps) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-bold text-zinc-700">{label}</Text>

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

type SaveButtonProps = {
  onPress: () => void | Promise<void>;
};

function SaveButton({ onPress }: SaveButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mt-4 rounded-2xl bg-[#002B5B] py-4"
    >
      <Text className="text-center text-base font-bold text-white">
        Salvar alterações
      </Text>
    </TouchableOpacity>
  );
}

type LogoutButtonProps = {
  onPress: () => void;
};

function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="mb-10 mt-6 flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 p-4"
    >
      <Ionicons name="log-out-outline" size={20} color="#ef4444" />
      <Text className="ml-2 font-bold text-red-500">Sair da Conta</Text>
    </TouchableOpacity>
  );
}
