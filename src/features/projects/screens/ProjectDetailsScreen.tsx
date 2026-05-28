import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getProjectDetails } from "../project.service";
import type { ProjectDetails, ProjectStatus } from "../project.types";

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  pending_review: "Pendente de análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
  archived: "Arquivado",
};

export default function ProjectDetailsScreen() {
  const params = useLocalSearchParams();

  const projectId = Array.isArray(params.id)
    ? params.id[0]
    : typeof params.id === "string"
      ? params.id
      : null;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o projeto.";

        setErrorMessage(message);
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

  return (
    <ScrollView
      className="flex-1 bg-zinc-100"
      contentContainerClassName="px-5 pb-10 pt-8"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        className="flex-row items-center gap-2"
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#2f3b69" />
        <Text className="text-base font-atkinson-bold text-[#2f3b69]">
          Voltar
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View className="mt-24 items-center justify-center">
          <ActivityIndicator color="#2f3b69" size="large" />
          <Text className="mt-4 text-base font-atkinson text-zinc-600">
            Carregando projeto...
          </Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View className="mt-12 rounded-2xl bg-white p-5">
          <Text className="text-center text-lg font-atkinson-bold text-zinc-900">
            Não foi possível carregar
          </Text>
          <Text className="mt-2 text-center text-base font-atkinson text-zinc-600">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {!isLoading && project ? (
        <View className="mt-6">
          <View className="rounded-3xl bg-white p-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-3xl font-atkinson-bold text-zinc-900">
                  {project.title}
                </Text>

                {project.summary ? (
                  <Text className="mt-3 text-base font-atkinson text-zinc-600">
                    {project.summary}
                  </Text>
                ) : null}
              </View>

              <View className="rounded-full bg-[#2f3b69]/10 px-3 py-2">
                <Text className="text-xs font-atkinson-bold text-[#2f3b69]">
                  {statusLabels[project.status]}
                </Text>
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

          <Section title="Descrição">
            <Text className="text-base leading-6 font-atkinson text-zinc-700">
              {project.description}
            </Text>
          </Section>

          <Section title="Tecnologias">
            {project.skills.length ? (
              <View className="flex-row flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <View
                    key={skill.id}
                    className="rounded-full bg-zinc-100 px-3 py-2"
                  >
                    <Text className="text-sm font-atkinson-bold text-zinc-700">
                      {skill.name}
                    </Text>
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
                <Text className="text-lg font-atkinson-bold text-zinc-900">
                  {project.author.fullName}
                </Text>
                <Text className="mt-1 text-sm font-atkinson text-zinc-500">
                  {project.author.email}
                </Text>
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
                    className="rounded-2xl border border-zinc-200 p-4"
                  >
                    <Text className="text-base font-atkinson-bold text-zinc-900">
                      {member.fullName}
                    </Text>
                    <Text className="mt-1 text-sm font-atkinson text-zinc-500">
                      {member.email}
                    </Text>
                    <Text className="mt-2 text-xs font-atkinson-bold uppercase text-[#2f3b69]">
                      {member.role}
                    </Text>
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
        </View>
      ) : null}
    </ScrollView>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="mt-5 rounded-3xl bg-white p-5">
      <Text className="mb-4 text-xl font-atkinson-bold text-zinc-900">
        {title}
      </Text>
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
    <View className="flex-row items-center gap-2 rounded-full bg-zinc-100 px-3 py-2">
      <Ionicons name={icon} size={14} color="#2f3b69" />
      <Text className="text-xs font-atkinson-bold text-zinc-700">{text}</Text>
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
      <Text className="text-center text-base font-atkinson-bold text-white">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text className="text-base font-atkinson text-zinc-500">{text}</Text>;
}