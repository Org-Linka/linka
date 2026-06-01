import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Platform,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useAuth } from "@/features/auth/auth.context";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";
import { scheduleTestLocalNotification } from "@/shared/lib/local-notifications";
import { loadOneSignal } from "@/shared/lib/onesignal";
import { getSupabaseClient } from "@/shared/lib/supabase";
import { Toast } from "@/shared/components/ui/molecules/Toast";

import {
  AvatarCropPicker,
  type AvatarCropPreset,
} from "../components/AvatarCropPicker";
import { InfoCard } from "../components/InfoCard";
import { InfoRow } from "../components/InfoRow";
import { ProfileHero } from "../components/ProfileHero";
import { ProjectSection } from "../components/ProjectSection";
import { SocialLinks } from "../components/SocialLinks";
import { ProfileSelect } from "../components/ProfileSelect";
import {
  getAcademicAreaOptions,
  getAcademicCourseOptions,
  getCurrentProfile,
  saveProfile,
  uploadProfileAvatar,
} from "../profile.service";
import type {
  AcademicAreaOption,
  AcademicCourseOption,
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
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);
  const [isAvatarCropPickerVisible, setIsAvatarCropPickerVisible] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [academicAreas, setAcademicAreas] = useState<AcademicAreaOption[]>([]);
  const [academicCourses, setAcademicCourses] = useState<AcademicCourseOption[]>([]);
  const [isLoadingAcademicOptions, setIsLoadingAcademicOptions] = useState(false);

  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 20;

  useEffect(() => {
    async function loadAcademicOptions() {
      try {
        setIsLoadingAcademicOptions(true);

        const [areas, courses] = await Promise.all([
          getAcademicAreaOptions(),
          getAcademicCourseOptions(),
        ]);

        setAcademicAreas(areas);
        setAcademicCourses(courses);
      } catch (error) {
        console.error("Erro ao carregar opções acadêmicas:", error);
      } finally {
        setIsLoadingAcademicOptions(false);
      }
    }

    void loadAcademicOptions();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const currentProfile = await getCurrentProfile(user.id);
        setProfile(currentProfile);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o perfil.";

        Alert.alert("Erro", message);
        setProfile(null);
      } finally {
        setIsProfileLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isProfileLoading && (!user || !userType || !profile)) {
      router.replace("/login");
    }
  }, [isLoading, isProfileLoading, profile, user, userType]);

  if (isLoading || isProfileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-atkinson text-zinc-500">Carregando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!user || !userType || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="font-atkinson text-zinc-500">
          Redirecionando para o login...
        </Text>
      </SafeAreaView>
    );
  }

  const currentProfile = profile;
  const isCompany = currentProfile.userType === "company";

  async function persistProfile(nextProfile: ProfileUser) {
    try {
      setProfile(nextProfile);
      await saveProfile(nextProfile);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o perfil.";

      Alert.alert("Erro", message);
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  function handleOpenAvatarCropPicker() {
    if (isUploadingAvatar) return;
    setIsAvatarCropPickerVisible(true);
  }

  async function handlePickProfileImage(preset: AvatarCropPreset) {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para alterar sua foto de perfil.",
      );
      return;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    };

    if (preset.aspect) {
      pickerOptions.aspect = preset.aspect;
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (result.canceled) return;

    try {
      setIsUploadingAvatar(true);
      const selectedAsset = result.assets[0];

      if (!selectedAsset?.uri) {
        throw new Error("Não foi possível ler a imagem selecionada.");
      }

      const avatarUrl = await uploadProfileAvatar(
        currentProfile.id,
        {
          uri: selectedAsset.uri,
          base64: selectedAsset.base64,
          mimeType: selectedAsset.mimeType,
          fileName: selectedAsset.fileName,
        },
      );

      const nextProfile: ProfileUser = {
        ...currentProfile,
        avatarUrl,
      };

      await persistProfile(nextProfile);
      Alert.alert("Sucesso", "Foto de perfil atualizada.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a foto de perfil.";

      Alert.alert("Erro", message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSelectAvatarCropPreset(preset: AvatarCropPreset) {
    setIsAvatarCropPickerVisible(false);
    await handlePickProfileImage(preset);
  }

  async function handleTestNotifications() {
    if (Platform.OS === "web") {
      Alert.alert(
        "Não disponível no web",
        "O teste de push deve ser feito no app mobile (Android/iOS).",
      );
      return;
    }

    if (!user) {
      Alert.alert(
        "Sessão não encontrada",
        "Entre novamente para testar notificações.",
      );
      return;
    }

    const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

    if (!oneSignalAppId) {
      Alert.alert(
        "OneSignal não configurado",
        "Adicione EXPO_PUBLIC_ONESIGNAL_APP_ID no .env e gere uma nova build de desenvolvimento.",
      );
      return;
    }

    try {
      setIsTestingNotifications(true);

      const oneSignalModule = await loadOneSignal();
      if (!oneSignalModule) {
        Alert.alert(
          "OneSignal indisponível",
          "Não foi possível carregar o SDK de notificações neste ambiente.",
        );
        return;
      }

      const { OneSignal } = oneSignalModule;

      let hasPermission = await OneSignal.Notifications.getPermissionAsync();

      if (!hasPermission) {
        hasPermission = await OneSignal.Notifications.requestPermission(true);
      }

      if (!hasPermission) {
        Alert.alert(
          "Permissão negada",
          "Sem permissão de notificações o dispositivo não vai receber push.",
        );
        return;
      }

      OneSignal.User.pushSubscription.optIn();

      let localNotificationId: string | null = null;

      try {
        localNotificationId = await scheduleTestLocalNotification();
      } catch (localNotificationError) {
        console.warn("Falha ao agendar notificacao local", localNotificationError);
      }

      const [subscriptionId, token, optedIn, onesignalId, externalId] =
        await Promise.all([
          OneSignal.User.pushSubscription.getIdAsync(),
          OneSignal.User.pushSubscription.getTokenAsync(),
          OneSignal.User.pushSubscription.getOptedInAsync(),
          OneSignal.User.getOnesignalId(),
          OneSignal.User.getExternalId(),
        ]);

      const maskedToken = token ? `${token.slice(0, 12)}...` : "pendente";
      const externalUserLabel = externalId ?? "não vinculado";

      if (!subscriptionId) {
        Alert.alert(
          "Registro pendente no OneSignal",
          `Permissão concedida, mas o Subscription ID ainda não foi criado.\n\nOneSignal ID: ${
            onesignalId ?? "pendente"
          }\nToken: ${maskedToken}\nExternal ID: ${externalUserLabel}\nNotificação local: ${
            localNotificationId ? "agendada" : "não agendada"
          }\n\nFeche e abra o app novamente e toque em "Testar notificações".`,
        );
        return;
      }

      const supabase = getSupabaseClient();
      const { data: notificationData, error: notificationError } =
        await supabase.functions.invoke("send-test-notification", {
          body: {
            userId: externalId ?? user.id,
            subscriptionId,
          },
        });

      if (notificationError) {
        throw new Error(notificationError.message);
      }

      console.log("Push enviado pelo OneSignal", notificationData);

      Toast.show("Dispositivo registrado e push de teste enviado.", {
        type: "success",
        position: "top",
        backgroundColor: "#166534",
        duration: 2400,
      });

      Alert.alert(
        "Push pronto para teste",
        `Subscription ID: ${subscriptionId}\nToken: ${maskedToken}\nOneSignal ID: ${
          onesignalId ?? "pendente"
        }\nExternal ID: ${externalUserLabel}\nOpt-in: ${
          optedIn ? "sim" : "não"
        }\nNotificação local: ${
          localNotificationId ? "agendada" : "não agendada"
        }\n\nO push de teste foi enviado automaticamente pelo OneSignal.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar o dispositivo para notificações.";

      Toast.show(`Erro ao testar notificações: ${message}`, {
        type: "error",
        position: "top",
        backgroundColor: "#b91c1c",
        duration: 2800,
      });
    } finally {
      setIsTestingNotifications(false);
    }
  }

  const content =
    currentProfile.userType === "student" ? (
      <StudentProfile
        userData={currentProfile}
        screenMode={screenMode}
        setScreenMode={setScreenMode}
        setProfile={persistProfile}
        bottomPadding={bottomPadding}
        onLogout={handleLogout}
        onPickImage={handleOpenAvatarCropPicker}
        onTestNotification={handleTestNotifications}
        isTestingNotifications={isTestingNotifications}
        academicAreas={academicAreas}
        academicCourses={academicCourses}
        isLoadingAcademicOptions={isLoadingAcademicOptions}
      />
    ) : (
      <CompanyProfile
        companyData={currentProfile}
        screenMode={screenMode}
        setScreenMode={setScreenMode}
        setProfile={persistProfile}
        bottomPadding={bottomPadding}
        onLogout={handleLogout}
        onPickImage={handleOpenAvatarCropPicker}
        onTestNotification={handleTestNotifications}
        isTestingNotifications={isTestingNotifications}
        title={isCompany ? "Perfil da Empresa" : "Meu Perfil"}
      />
    );

  return (
    <>
      {content}
      <AvatarCropPicker
        visible={isAvatarCropPickerVisible}
        onClose={() => setIsAvatarCropPickerVisible(false)}
        onSelect={handleSelectAvatarCropPreset}
      />
    </>
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
  onTestNotification: () => void | Promise<void>;
  isTestingNotifications: boolean;
  academicAreas: AcademicAreaOption[];
  academicCourses: AcademicCourseOption[];
  isLoadingAcademicOptions: boolean;
};

function StudentProfile({
  userData,
  screenMode,
  setScreenMode,
  setProfile,
  bottomPadding,
  onLogout,
  onPickImage,
  onTestNotification,
  isTestingNotifications,
  academicAreas,
  academicCourses,
  isLoadingAcademicOptions,
}: StudentProfileProps) {
  const [personalForm, setPersonalForm] = useState<StudentPersonalForm>({
    name: userData.name,
    bio: userData.bio,
    email: userData.email,
    phone: userData.phone,
    linkedin: userData.links.linkedin,
    github: userData.links.github,
    portfolio: userData.links.portfolio,
  });

  const [academicForm, setAcademicForm] = useState<StudentAcademicForm>({
    university: userData.university,
    academicAreaId: userData.academicAreaId,
    academicCourseId: userData.academicCourseId,
    course: userData.course,
    semester: userData.semester,
  });

  const [skillsForm, setSkillsForm] = useState<StudentSkillsForm>({
    field: userData.field,
    tools: userData.tools,
    languages: userData.languages,
    skills: userData.skills,
  });

  const academicAreaOptions = academicAreas.map((area) => ({
    label: area.name,
    value: area.id,
  }));

  const filteredAcademicCourses = academicForm.academicAreaId
    ? academicCourses.filter(
        (course) => course.areaId === academicForm.academicAreaId,
      )
    : academicCourses;

  const academicCourseOptions = filteredAcademicCourses.map((course) => ({
    label: course.name,
    value: course.id,
  }));

  function handleSelectAcademicArea(areaId: string) {
    setAcademicForm((currentForm) => ({
      ...currentForm,
      academicAreaId: areaId,
      academicCourseId: "",
      course: "",
    }));
  }

  function handleSelectAcademicCourse(courseId: string) {
    const selectedCourse = academicCourses.find((course) => course.id === courseId);

    setAcademicForm((currentForm) => ({
      ...currentForm,
      academicCourseId: courseId,
      course: selectedCourse?.name ?? "",
    }));
  }

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
      academicAreaId: academicForm.academicAreaId,
      academicCourseId: academicForm.academicCourseId,
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

        <ProfileSelect
          label="Área acadêmica"
          placeholder={
            isLoadingAcademicOptions
              ? "Carregando áreas..."
              : "Selecione sua área acadêmica"
          }
          value={academicForm.academicAreaId}
          options={academicAreaOptions}
          disabled={isLoadingAcademicOptions}
          onChange={handleSelectAcademicArea}
        />

        <ProfileSelect
          label="Curso"
          placeholder={
            academicForm.academicAreaId
              ? "Selecione seu curso"
              : "Selecione uma área primeiro"
          }
          value={academicForm.academicCourseId}
          options={academicCourseOptions}
          disabled={isLoadingAcademicOptions || !academicForm.academicAreaId}
          helperText={
            academicForm.academicAreaId
              ? undefined
              : "Escolha uma área acadêmica para filtrar os cursos."
          }
          onChange={handleSelectAcademicCourse}
        />

        <ProfileInput 
          label="Semestre"
          placeholder="Ex.: 4° Semestre"
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

        <AnimatedScreenScrollView
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

            <NotificationTestButton
              onPress={onTestNotification}
              isLoading={isTestingNotifications}
            />

            <LogoutButton onPress={onLogout} />
          </View>
        </AnimatedScreenScrollView>
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
  onTestNotification: () => void | Promise<void>;
  isTestingNotifications: boolean;
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
  onTestNotification,
  isTestingNotifications,
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

        <AnimatedScreenScrollView
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

            <NotificationTestButton
              onPress={onTestNotification}
              isLoading={isTestingNotifications}
            />

            <LogoutButton onPress={onLogout} />
          </View>
        </AnimatedScreenScrollView>
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
            <Image
              source={{ uri: user.avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
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

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <AnimatedScreenScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: bottomPadding + 40,
            }}
          >
            {children}
          </AnimatedScreenScrollView>
        </KeyboardAvoidingView>
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
            <Image
              source={{ uri: avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
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

type NotificationTestButtonProps = {
  onPress: () => void | Promise<void>;
  isLoading: boolean;
};

function NotificationTestButton({ onPress, isLoading }: NotificationTestButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLoading}
      className="mt-6 flex-row items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 p-4"
    >
      <Ionicons
        name={isLoading ? "sync-outline" : "notifications-outline"}
        size={20}
        color="#1d4ed8"
      />
      <Text className="ml-2 font-bold text-blue-700">
        {isLoading ? "Validando dispositivo..." : "Testar notificações"}
      </Text>
    </TouchableOpacity>
  );
}

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
