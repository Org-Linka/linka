import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useFont, useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import {
  getProjectDetails,
  registerProjectInterest,
  sendProjectContactMessage,
} from "../project.service";
import type { ProjectDetails, ProjectStatus } from "../project.types";

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  pending_review: "Pendente de análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
  archived: "Arquivado",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível concluir a ação.";
}

export default function ProjectDetailsScreen() {
  const params = useLocalSearchParams();
  const { fontScale } = useFont();
  const { isDarkMode } = useTheme();

  const projectId = Array.isArray(params.id)
    ? params.id[0]
    : typeof params.id === "string"
      ? params.id
      : null;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisteringInterest, setIsRegisteringInterest] = useState(false);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canOpenRepository = Boolean(project?.repositoryUrl);
  const canOpenDemo = Boolean(project?.demoUrl);

  const formattedDate = useMemo(() => {
    if (!project?.createdAt) {
      return null;
    }

    return new Intl.DateTimeFormat("pt-BR").format(
      new Date(project.createdAt),
    );
  }, [project?.createdAt]);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!projectId) {
        setErrorMessage(
          "Projeto não encontrado ou sem permissão para visualização.",
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const projectDetails = await getProjectDetails(projectId);

        if (!isMounted) return;

        if (!projectDetails) {
          setErrorMessage(
            "Projeto não encontrado ou sem permissão para visualização.",
          );
          setProject(null);
          return;
        }

        setProject(projectDetails);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  async function handleOpenUrl(url: string | null) {
    if (!url) return;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  async function handleRegisterInterest() {
    if (!projectId || isRegisteringInterest) {
      return;
    }

    try {
      setIsRegisteringInterest(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await registerProjectInterest(projectId);

      setSuccessMessage("Interesse registrado com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSuccessMessage(null);
    } finally {
      setIsRegisteringInterest(false);
    }
  }

  async function handleSendContactMessage() {
    if (!projectId || isSendingContact) {
      return;
    }

    const trimmedMessage = contactMessage.trim();

    if (!trimmedMessage) {
      setErrorMessage("Escreva uma mensagem antes de enviar.");
      setSuccessMessage(null);
      return;
    }

    try {
      setIsSendingContact(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await sendProjectContactMessage(projectId, trimmedMessage);

      setContactMessage("");
      setIsContactModalVisible(false);
      setSuccessMessage("Mensagem enviada ao autor do projeto.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setSuccessMessage(null);
    } finally {
      setIsSendingContact(false);
    }
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-100 dark:bg-zinc-800"
        contentContainerClassName="px-5 pb-10 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="flex-row items-center gap-2"
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#2f3b69" />
          <AccessibleText className="text-base font-atkinson-bold text-[#2f3b69] dark:text-blue-100">
            Voltar
          </AccessibleText>
        </TouchableOpacity>

        {isLoading ? (
          <View className="mt-24 items-center justify-center">
            <ActivityIndicator color="#2f3b69" size="large" />
            <AccessibleText className="mt-4 text-base font-atkinson text-zinc-600 dark:text-zinc-300">
              Carregando projeto...
            </AccessibleText>
          </View>
        ) : null}

        {!isLoading && errorMessage && !project ? (
          <View className="mt-12 rounded-2xl bg-white p-5 dark:bg-zinc-900">
            <AccessibleText className="text-center text-lg font-atkinson-bold text-zinc-900 dark:text-white">
              Não foi possível carregar
            </AccessibleText>
            <AccessibleText className="mt-2 text-center text-base font-atkinson text-zinc-600 dark:text-zinc-300">
              {errorMessage}
            </AccessibleText>
          </View>
        ) : null}

        {!isLoading && project ? (
          <View className="mt-6">
            {project.coverUrl ? (
              <Image
                source={{ uri: project.coverUrl }}
                className="mb-5 h-56 w-full rounded-3xl bg-zinc-200 dark:bg-zinc-700"
                resizeMode="cover"
              />
            ) : null}

            <View className="rounded-3xl bg-white p-5 dark:bg-zinc-900">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <AccessibleText className="text-3xl font-atkinson-bold text-zinc-900 dark:text-white">
                    {project.title}
                  </AccessibleText>

                  {project.summary ? (
                    <AccessibleText className="mt-3 text-base font-atkinson text-zinc-600 dark:text-zinc-300">
                      {project.summary}
                    </AccessibleText>
                  ) : null}
                </View>

                <View className="rounded-full bg-[#2f3b69]/10 px-3 py-2">
                  <AccessibleText className="text-xs font-atkinson-bold text-[#2f3b69] dark:text-blue-100">
                    {statusLabels[project.status]}
                  </AccessibleText>
                </View>
              </View>

              <View className="mt-5 flex-row flex-wrap gap-2">
                {project.category ? (
                  <InfoPill icon="albums-outline" text={project.category.name} />
                ) : null}

                {project.courseName ? (
                  <InfoPill icon="school-outline" text={project.courseName} />
                ) : null}

                {project.university ? (
                  <InfoPill icon="business-outline" text={project.university} />
                ) : null}

                {formattedDate ? (
                  <InfoPill icon="calendar-outline" text={formattedDate} />
                ) : null}
              </View>
            </View>

            {errorMessage ? (
              <AccessibleText className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-center text-sm font-atkinson text-red-700">
                {errorMessage}
              </AccessibleText>
            ) : null}

            {successMessage ? (
              <AccessibleText className="mt-5 rounded-xl bg-emerald-100 px-4 py-3 text-center text-sm font-atkinson text-emerald-700">
                {successMessage}
              </AccessibleText>
            ) : null}

            <Section title="Descrição">
              <AccessibleText className="text-base font-atkinson leading-6 text-zinc-700 dark:text-zinc-200">
                {project.description}
              </AccessibleText>
            </Section>

            <Section title="Tecnologias">
              {project.skills.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <View
                      key={skill.id}
                      className="rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800"
                    >
                      <AccessibleText className="text-sm font-atkinson-bold text-zinc-700 dark:text-zinc-200">
                        {skill.name}
                      </AccessibleText>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyText text="Nenhuma tecnologia vinculada." />
              )}
            </Section>

            <Section title="Autor">
              {project.author ? (
                <View>
                  <AccessibleText className="text-lg font-atkinson-bold text-zinc-900 dark:text-white">
                    {project.author.fullName}
                  </AccessibleText>
                  <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                    {project.author.email}
                  </AccessibleText>
                </View>
              ) : (
                <EmptyText text="Autor não informado." />
              )}
            </Section>

            <Section title="Integrantes">
              {project.members.length ? (
                <View className="gap-3">
                  {project.members.map((member) => (
                    <View
                      key={member.id}
                      className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <AccessibleText className="text-base font-atkinson-bold text-zinc-900 dark:text-white">
                        {member.fullName}
                      </AccessibleText>
                      <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                        {member.email}
                      </AccessibleText>
                      <AccessibleText className="mt-2 text-xs font-atkinson-bold uppercase text-[#2f3b69] dark:text-blue-100">
                        {member.role}
                      </AccessibleText>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyText text="Nenhum integrante vinculado." />
              )}
            </Section>

            <Section title="Links do projeto">
              <View className="gap-3">
                <ActionButton
                  label="Abrir repositório"
                  icon="logo-github"
                  disabled={!canOpenRepository}
                  onPress={() => handleOpenUrl(project.repositoryUrl)}
                />

                <ActionButton
                  label="Abrir demonstração"
                  icon="open-outline"
                  disabled={!canOpenDemo}
                  onPress={() => handleOpenUrl(project.demoUrl)}
                />
              </View>
            </Section>

            <Section title="Ações">
              <View className="gap-3">
                <ActionButton
                  label={
                    isRegisteringInterest
                      ? "Registrando interesse..."
                      : "Tenho interesse"
                  }
                  icon="star-outline"
                  disabled={isRegisteringInterest}
                  onPress={handleRegisterInterest}
                />

                <ActionButton
                  label="Entrar em contato"
                  icon="chatbubble-ellipses-outline"
                  onPress={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setIsContactModalVisible(true);
                  }}
                />
              </View>
            </Section>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isContactModalVisible}
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50 px-5">
          <View className="rounded-3xl bg-white p-5 dark:bg-zinc-900">
            <AccessibleText className="text-xl font-atkinson-bold text-zinc-900 dark:text-white">
              Entrar em contato
            </AccessibleText>

            <AccessibleText className="mt-2 text-sm font-atkinson text-zinc-600 dark:text-zinc-300">
              Escreva uma mensagem para o autor do projeto. Ela ficará
              registrada para acompanhamento dentro da plataforma.
            </AccessibleText>

            <TextInput
              className="mt-5 min-h-[140px] rounded-xl border border-zinc-300 bg-white px-4 py-3 font-atkinson text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              placeholder="Ex: Olá! Tenho interesse em conversar sobre este projeto..."
              placeholderTextColor={isDarkMode ? "#a1a1aa" : "#71717a"}
              style={{ fontSize: 16 * fontScale }}
              multiline
              textAlignVertical="top"
              value={contactMessage}
              onChangeText={setContactMessage}
            />

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-xl bg-zinc-200 py-4"
                activeOpacity={0.85}
                disabled={isSendingContact}
                onPress={() => setIsContactModalVisible(false)}
              >
                <AccessibleText className="text-center text-base font-atkinson-bold text-zinc-700 dark:text-zinc-200">
                  Cancelar
                </AccessibleText>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 ${
                  isSendingContact ? "bg-zinc-400" : "bg-[#2f3b69]"
                }`}
                activeOpacity={0.85}
                disabled={isSendingContact}
                onPress={handleSendContactMessage}
              >
                <AccessibleText className="text-center text-base font-atkinson-bold text-white">
                  {isSendingContact ? "Enviando..." : "Enviar"}
                </AccessibleText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-zinc-900">
      <AccessibleText className="mb-4 text-xl font-atkinson-bold text-zinc-900 dark:text-white">
        {title}
      </AccessibleText>
      {children}
    </View>
  );
}

type InfoPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function InfoPill({ icon, text }: InfoPillProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
      <Ionicons name={icon} size={14} color="#2f3b69" />
      <AccessibleText className="text-xs font-atkinson-bold text-zinc-700 dark:text-zinc-200">
        {text}
      </AccessibleText>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress: () => void;
};

function ActionButton({
  label,
  icon,
  disabled = false,
  onPress,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${
        disabled ? "bg-zinc-300" : "bg-[#2f3b69]"
      }`}
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons name={icon} size={18} color="#ffffff" />
      <AccessibleText className="text-center text-base font-atkinson-bold text-white">
        {label}
      </AccessibleText>
    </TouchableOpacity>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <AccessibleText className="text-base font-atkinson text-zinc-500 dark:text-zinc-400">
      {text}
    </AccessibleText>
  );
}