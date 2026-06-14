import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { getCompanyStudentDetails } from "../company.service";
import type { CompanyStudentDetails } from "../company.types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível carregar os dados do estudante.";
}

export default function CompanyStudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [student, setStudent] = useState<CompanyStudentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStudent = useCallback(async () => {
    if (!id) {
      setStudent(null);
      setErrorMessage("Estudante não informado.");
      return;
    }

    try {
      setErrorMessage(null);

      const studentDetails = await getCompanyStudentDetails(id);

      setStudent(studentDetails);

      if (!studentDetails) {
        setErrorMessage("Estudante não encontrado.");
      }
    } catch (error) {
      setStudent(null);
      setErrorMessage(getErrorMessage(error));
    }
  }, [id]);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      await loadStudent();
      setIsLoading(false);
    }

    loadInitialData();
  }, [loadStudent]);

  function handleOpenProject(projectId: string) {
    router.push(`/projects/${projectId}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <ScrollView
          className="flex-1 bg-white dark:bg-zinc-900"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-[#2F3B69] px-5 pb-20 pt-4">
            <TouchableOpacity
              className="mb-5 h-10 w-10 items-center justify-center rounded-full bg-white/10"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <AccessibleText className="text-sm font-atkinson text-[#F6F7FB]">
              Área da empresa
            </AccessibleText>

            <AccessibleText className="mt-1 text-3xl font-atkinson-bold text-white">
              Detalhes do estudante
            </AccessibleText>

            <AccessibleText className="mt-2 text-base font-atkinson text-[#F6F7FB]">
              Veja informações acadêmicas, habilidades e projetos aprovados.
            </AccessibleText>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white dark:bg-zinc-900 px-5 pt-8">
            {isLoading ? (
              <StateCard
                icon="sync-outline"
                title="Carregando estudante"
                description="Estamos buscando as informações do perfil."
              >
                <ActivityIndicator color="#2f3b69" size="large" />
              </StateCard>
            ) : null}

            {!isLoading && errorMessage ? (
              <StateCard
                icon="alert-circle-outline"
                title="Não foi possível carregar"
                description={errorMessage}
              >
                <TouchableOpacity
                  className="mt-4 rounded-full bg-[#2f3b69] px-5 py-3"
                  activeOpacity={0.85}
                  onPress={loadStudent}
                >
                  <AccessibleText className="font-atkinson-bold text-white">
                    Tentar novamente
                  </AccessibleText>
                </TouchableOpacity>
              </StateCard>
            ) : null}

            {!isLoading && student ? (
              <View className="gap-4">
                <View className="rounded-[28px] bg-[#F6F7FB] dark:bg-zinc-800 p-4">
                  <View className="rounded-[24px] bg-white dark:bg-zinc-900 p-5">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-[#2F3B69]">
                      <Ionicons name="person-outline" size={30} color="#fff" />
                    </View>

                    <AccessibleText className="mt-5 text-2xl font-atkinson-bold text-[#2F3B69] dark:text-white">
                      {student.fullName ?? "Estudante sem nome"}
                    </AccessibleText>

                    {student.headline ? (
                      <AccessibleText className="mt-2 text-base font-atkinson-bold text-[#2f3b69] dark:text-white">
                        {student.headline}
                      </AccessibleText>
                    ) : null}

                    {student.email ? (
                      <AccessibleText className="mt-2 text-sm font-atkinson text-[#666] dark:text-zinc-300">
                        {student.email}
                      </AccessibleText>
                    ) : null}

                    {student.bio ? (
                      <AccessibleText className="mt-4 text-sm leading-6 font-atkinson text-[#666] dark:text-zinc-300">
                        {student.bio}
                      </AccessibleText>
                    ) : null}
                  </View>
                </View>

                <InfoSection title="Dados acadêmicos" icon="school-outline">
                  <InfoLine label="Universidade" value={student.university} />
                  <InfoLine label="Curso" value={student.courseName} />
                  <InfoLine label="Semestre" value={student.semester} />
                  <InfoLine label="Disponibilidade" value={student.availability} />
                  <InfoLine label="Área de foco" value={student.focusArea} />
                </InfoSection>

                <InfoSection title="Competências" icon="sparkles-outline">
                  <InfoLine label="Resumo" value={student.skillsSummary} />
                  <InfoLine label="Ferramentas" value={student.tools} />
                  <InfoLine label="Idiomas" value={student.languages} />

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    {student.skills.length ? (
                      student.skills.map((skill) => (
                        <View
                          key={skill}
                          className="rounded-full bg-[#F6F7FB] dark:bg-zinc-800 px-3 py-2"
                        >
                          <AccessibleText className="text-xs font-atkinson-bold text-[#666] dark:text-zinc-300">
                            {skill}
                          </AccessibleText>
                        </View>
                      ))
                    ) : (
                      <AccessibleText className="text-sm font-atkinson text-[#666] dark:text-zinc-300">
                        Nenhuma habilidade vinculada.
                      </AccessibleText>
                    )}
                  </View>
                </InfoSection>

                <InfoSection title="Projetos aprovados" icon="rocket-outline">
                  <View className="gap-3">
                    {student.projects.length ? (
                      student.projects.map((project) => (
                        <TouchableOpacity
                          key={project.id}
                          className="rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 p-4"
                          activeOpacity={0.85}
                          onPress={() => handleOpenProject(project.id)}
                        >
                          <AccessibleText className="font-atkinson-bold text-[#2F3B69] dark:text-white">
                            {project.title}
                          </AccessibleText>
                          <AccessibleText className="mt-1 text-sm font-atkinson text-[#666] dark:text-zinc-300">
                            {project.summary ?? "Resumo não informado."}
                          </AccessibleText>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <AccessibleText className="text-sm font-atkinson text-[#666] dark:text-zinc-300">
                        Nenhum projeto aprovado encontrado.
                      </AccessibleText>
                    )}
                  </View>
                </InfoSection>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    <View className="rounded-[32px] bg-[#F6F7FB] dark:bg-zinc-800 p-6">
      <View className="items-center rounded-[28px] bg-white dark:bg-zinc-900 p-6">
        <Ionicons name={icon} size={42} color="#2f3b69" />
        <AccessibleText className="mt-4 text-center text-xl font-atkinson-bold text-[#2F3B69] dark:text-white">
          {title}
        </AccessibleText>
        <AccessibleText className="mt-2 text-center text-base leading-6 font-atkinson text-[#666] dark:text-zinc-300">
          {description}
        </AccessibleText>
        {children ? <View className="mt-5">{children}</View> : null}
      </View>
    </View>
  );
}

type InfoSectionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
};

function InfoSection({ title, icon, children }: InfoSectionProps) {
  return (
    <View className="rounded-[28px] bg-[#F6F7FB] dark:bg-zinc-800 p-4">
      <View className="rounded-[24px] bg-white dark:bg-zinc-900 p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Ionicons name={icon} size={20} color="#2f3b69" />
          <AccessibleText className="text-lg font-atkinson-bold text-[#2F3B69] dark:text-white">
            {title}
          </AccessibleText>
        </View>

        {children}
      </View>
    </View>
  );
}

type InfoLineProps = {
  label: string;
  value: string | null;
};

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <View className="border-b border-[#F6F7FB] dark:border-zinc-700 py-3">
      <AccessibleText className="text-xs font-atkinson text-[#666] dark:text-zinc-300">
        {label}
      </AccessibleText>
      <AccessibleText className="mt-1 text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
        {value ?? "Não informado"}
      </AccessibleText>
    </View>
  );
}