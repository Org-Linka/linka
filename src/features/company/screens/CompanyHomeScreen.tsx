import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/auth.context";
import {
  registerProjectInterest,
  sendProjectContactMessage,
} from "@/features/projects/project.service";
import {
  showAppToast,
  type AppToastVariant,
} from "@/shared/components/ui/molecules/Toast/showAppToast";

import { listApprovedCompanyFeedProjects } from "../company.service";
import type { CompanyFeedProject } from "../company.types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível concluir a ação.";
}

function showCompanyToast(
  title: string,
  description: string,
  variant: AppToastVariant = "info",
) {
  showAppToast({
    title,
    description,
    variant,
  });
}

export default function CompanyHomeScreen() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<CompanyFeedProject[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisteringInterest, setIsRegisteringInterest] = useState(false);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactErrorMessage, setContactErrorMessage] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentProject = projects[currentProjectIndex] ?? null;

  const progressLabel = useMemo(() => {
    if (!projects.length) {
      return "0 de 0";
    }

    return `${currentProjectIndex + 1} de ${projects.length}`;
  }, [currentProjectIndex, projects.length]);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const approvedProjects = await listApprovedCompanyFeedProjects();

      setProjects(approvedProjects);
      setCurrentProjectIndex(0);
    } catch (error) {
      setProjects([]);
      setCurrentProjectIndex(0);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleNextProject() {
    setErrorMessage(null);

    setCurrentProjectIndex((currentIndex) => {
      if (!projects.length || currentIndex === projects.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  async function handleRegisterInterest() {
    if (!currentProject || isRegisteringInterest) {
      return;
    }

    try {
      setIsRegisteringInterest(true);
      setErrorMessage(null);

      await registerProjectInterest(currentProject.id);

      showCompanyToast(
        "Interesse registrado",
        "O projeto foi marcado como interessante para sua empresa.",
        "success",
      );

      handleNextProject();
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showCompanyToast("Erro ao registrar interesse", message, "error");
    } finally {
      setIsRegisteringInterest(false);
    }
  }

  function openContactModal() {
    if (!currentProject) {
      return;
    }

    setContactMessage("");
    setContactErrorMessage(null);
    setErrorMessage(null);
    setIsContactModalVisible(true);
  }

  async function handleSendContactMessage() {
    if (!currentProject || isSendingContact) {
      return;
    }

    const trimmedMessage = contactMessage.trim();

    if (!trimmedMessage) {
      setContactErrorMessage("Escreva uma mensagem antes de enviar.");
      return;
    }

    try {
      setIsSendingContact(true);
      setContactErrorMessage(null);
      setErrorMessage(null);

      await sendProjectContactMessage(currentProject.id, trimmedMessage);

      setContactMessage("");
      setIsContactModalVisible(false);

      showCompanyToast(
        "Mensagem enviada",
        "O autor do projeto recebeu sua mensagem de contato.",
        "success",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      setContactErrorMessage(message);
      showCompanyToast("Erro ao enviar contato", message, "error");
    } finally {
      setIsSendingContact(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
        <View className="flex-1 bg-white">
          <ScrollView
            className="flex-1 bg-white"
            contentContainerClassName="pb-8"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-[#002B5B] px-5 pb-20 pt-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-atkinson text-[#F6F7FB]">
                    Área da empresa
                  </Text>

                  <Text className="mt-1 text-3xl font-atkinson-bold text-white">
                    Descobrir projetos
                  </Text>

                  <Text className="mt-2 text-base font-atkinson text-[#F6F7FB]">
                    Veja projetos acadêmicos e encontre oportunidades de
                    parceria.
                  </Text>

                  <View className="mt-4 flex-row items-center gap-2">
                    <Ionicons
                      name="business-outline"
                      size={16}
                      color="#FFD700"
                    />
                    <Text className="flex-1 text-sm font-atkinson text-[#F6F7FB]">
                      {user?.name ?? "Empresa"} - {user?.email}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-[#FFD700] px-4 py-3"
                    activeOpacity={0.85}
                    onPress={() => router.push("/company/connections" as never)}
                  >
                    <Ionicons name="time-outline" size={18} color="#002B5B" />
                    <Text className="font-atkinson-bold text-[#002B5B]">
                      Ver histórico de conexões
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="rounded-full bg-white/10 px-4 py-2"
                  activeOpacity={0.8}
                  onPress={handleSignOut}
                >
                  <Text className="text-sm font-atkinson-bold text-white">
                    Sair
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="-mt-14 rounded-t-[50px] bg-white px-5 pt-8">
              {errorMessage ? (
                <View className="mb-5 rounded-2xl bg-[#F6F7FB] px-4 py-3">
                  <Text className="text-center text-sm font-atkinson-bold text-[#002B5B]">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {isLoading ? (
                <StateCard
                  icon="sync-outline"
                  title="Carregando projetos"
                  description="Estamos buscando os projetos aprovados para empresas."
                >
                  <ActivityIndicator color="#2f3b69" size="large" />
                </StateCard>
              ) : null}

              {!isLoading && !errorMessage && !projects.length ? (
                <StateCard
                  icon="file-tray-outline"
                  title="Nenhum projeto aprovado"
                  description="Assim que novos projetos forem aprovados, eles aparecerão neste feed."
                />
              ) : null}

              {!isLoading && currentProject ? (
                <>
                  <ProjectDiscoveryCard
                    project={currentProject}
                    progressLabel={progressLabel}
                  />

                  <View className="mt-5 flex-row gap-3">
                    <ActionButton
                      icon="close-outline"
                      label="Pular"
                      variant="secondary"
                      disabled={isRegisteringInterest || isSendingContact}
                      onPress={handleNextProject}
                    />

                    <ActionButton
                      icon="star-outline"
                      label={
                        isRegisteringInterest
                          ? "Registrando"
                          : "Tenho interesse"
                      }
                      variant="primary"
                      disabled={isRegisteringInterest || isSendingContact}
                      onPress={handleRegisterInterest}
                    />

                    <ActionButton
                      icon="chatbubble-ellipses-outline"
                      label="Contato"
                      variant="dark"
                      disabled={isRegisteringInterest || isSendingContact}
                      onPress={openContactModal}
                    />
                  </View>
                </>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={isContactModalVisible}
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-5">
          <View className="rounded-3xl bg-white p-5">
            <Text className="text-xl font-atkinson-bold text-[#002B5B]">
              Entrar em contato
            </Text>

            <Text className="mt-2 text-sm font-atkinson text-[#666]">
              Escreva uma mensagem para iniciar a conversa com o autor do
              projeto.
            </Text>

            <TextInput
              className="mt-5 min-h-[140px] rounded-xl border border-[#F6F7FB] bg-[#F6F7FB] px-4 py-3 text-base font-atkinson text-[#002B5B]"
              placeholder="Ex: Olá! Gostaria de conversar sobre uma possível parceria..."
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
              value={contactMessage}
              onChangeText={setContactMessage}
            />

            {contactErrorMessage ? (
              <Text className="mt-3 rounded-xl bg-[#F6F7FB] px-4 py-3 text-center text-sm font-atkinson-bold text-[#002B5B]">
                {contactErrorMessage}
              </Text>
            ) : null}

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#F6F7FB] py-4"
                activeOpacity={0.85}
                disabled={isSendingContact}
                onPress={() => setIsContactModalVisible(false)}
              >
                <Text className="text-center text-base font-atkinson-bold text-[#002B5B]">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 ${
                  isSendingContact ? "bg-[#666]" : "bg-[#2f3b69]"
                }`}
                activeOpacity={0.85}
                disabled={isSendingContact}
                onPress={handleSendContactMessage}
              >
                <Text className="text-center text-base font-atkinson-bold text-white">
                  {isSendingContact ? "Enviando..." : "Enviar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type ProjectDiscoveryCardProps = {
  project: CompanyFeedProject;
  progressLabel: string;
};

function ProjectDiscoveryCard({
  project,
  progressLabel,
}: ProjectDiscoveryCardProps) {
  return (
    <View className="rounded-[32px] bg-[#F6F7FB] p-4">
      <View className="rounded-[28px] bg-white p-5">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-[#002B5B] px-4 py-2">
            <Text className="text-xs font-atkinson-bold text-white">
              {progressLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="sparkles-outline" size={18} color="#2f3b69" />
            <Text className="text-xs font-atkinson-bold text-[#2f3b69]">
              Aprovado
            </Text>
          </View>
        </View>

        {project.coverUrl ? (
          <Image
            source={{ uri: project.coverUrl }}
            className="mt-6 h-44 w-full rounded-3xl bg-[#F6F7FB]"
            resizeMode="cover"
          />
        ) : (
          <View className="mt-6 h-44 items-center justify-center rounded-3xl bg-[#F6F7FB]">
            <Ionicons name="rocket-outline" size={54} color="#2f3b69" />
            <Text className="mt-3 text-sm font-atkinson-bold text-[#2f3b69]">
              Projeto pronto para descoberta
            </Text>
          </View>
        )}

        <Text className="mt-6 text-3xl font-atkinson-bold text-[#002B5B]">
          {project.title}
        </Text>

        <Text className="mt-3 text-base font-atkinson leading-6 text-[#666]">
          {project.summary ?? "Resumo não informado."}
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {project.categoryName ? (
            <InfoPill icon="albums-outline" text={project.categoryName} />
          ) : null}

          {project.courseName ? (
            <InfoPill icon="school-outline" text={project.courseName} />
          ) : null}

          {project.university ? (
            <InfoPill icon="business-outline" text={project.university} />
          ) : null}

          {project.stage ? (
            <InfoPill icon="construct-outline" text={project.stage} />
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="text-sm font-atkinson-bold text-[#002B5B]">
            Tecnologias
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {project.technologies.length ? (
              project.technologies.map((technology) => (
                <View
                  key={technology}
                  className="rounded-full bg-[#F6F7FB] px-3 py-2"
                >
                  <Text className="text-xs font-atkinson-bold text-[#666]">
                    {technology}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-sm font-atkinson text-[#666]">
                Nenhuma tecnologia vinculada.
              </Text>
            )}
          </View>
        </View>

        <View className="mt-5 rounded-2xl bg-[#F6F7FB] p-4">
          <Text className="text-sm font-atkinson text-[#666]">Autor</Text>
          <Text className="mt-1 text-base font-atkinson-bold text-[#002B5B]">
            {project.authorName ?? "Autor não informado"}
          </Text>
        </View>
      </View>
    </View>
  );
}

type StateCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  children?: ReactNode;
};

function StateCard({ icon, title, description, children }: StateCardProps) {
  return (
    <View className="rounded-[32px] bg-[#F6F7FB] p-6">
      <View className="items-center rounded-[28px] bg-white p-6">
        <Ionicons name={icon} size={42} color="#2f3b69" />
        <Text className="mt-4 text-center text-xl font-atkinson-bold text-[#002B5B]">
          {title}
        </Text>
        <Text className="mt-2 text-center text-base font-atkinson leading-6 text-[#666]">
          {description}
        </Text>
        {children ? <View className="mt-5">{children}</View> : null}
      </View>
    </View>
  );
}

type InfoPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function InfoPill({ icon, text }: InfoPillProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-[#F6F7FB] px-3 py-2">
      <Ionicons name={icon} size={14} color="#2f3b69" />
      <Text className="text-xs font-atkinson-bold text-[#666]">{text}</Text>
    </View>
  );
}

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  variant: "primary" | "secondary" | "dark";
  disabled?: boolean;
  onPress: () => void;
};

function ActionButton({
  icon,
  label,
  variant,
  disabled = false,
  onPress,
}: ActionButtonProps) {
  const backgroundClass =
    variant === "primary"
      ? "bg-[#FFD700]"
      : variant === "dark"
        ? "bg-[#002B5B]"
        : "bg-[#F6F7FB]";

  const textClass =
    variant === "primary" || variant === "secondary"
      ? "text-[#002B5B]"
      : "text-white";

  const iconColor =
    variant === "primary" || variant === "secondary" ? "#002B5B" : "#ffffff";

  return (
    <TouchableOpacity
      className={`flex-1 items-center justify-center rounded-3xl py-4 ${
        disabled ? "opacity-60" : ""
      } ${backgroundClass}`}
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text className={`mt-2 text-xs font-atkinson-bold ${textClass}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}