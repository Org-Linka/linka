import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-white"
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

            <Text className="text-sm font-atkinson text-[#F6F7FB]">
              Área da empresa
            </Text>

            <Text className="mt-1 text-3xl font-atkinson-bold text-white">
              Detalhes do estudante
            </Text>

            <Text className="mt-2 text-base font-atkinson text-[#F6F7FB]">
              Veja informações acadêmicas, habilidades e projetos aprovados.
            </Text>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white px-5 pt-8">
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
                  <Text className="font-atkinson-bold text-white">
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </StateCard>
            ) : null}

            {!isLoading && student ? (
              <View className="gap-4">
                <View className="rounded-[28px] bg-[#F6F7FB] p-4">
                  <View className="rounded-[24px] bg-white p-5">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-[#2F3B69]">
                      <Ionicons name="person-outline" size={30} color="#fff" />
                    </View>

                    <Text className="mt-5 text-2xl font-atkinson-bold text-[#2F3B69]">
                      {student.fullName ?? "Estudante sem nome"}
                    </Text>

                    {student.headline ? (
                      <Text className="mt-2 text-base font-atkinson-bold text-[#2f3b69]">
                        {student.headline}
                      </Text>
                    ) : null}

                    {student.email ? (
                      <Text className="mt-2 text-sm font-atkinson text-[#666]">
                        {student.email}
                      </Text>
                    ) : null}

                    {student.bio ? (
                      <Text className="mt-4 text-sm leading-6 font-atkinson text-[#666]">
                        {student.bio}
                      </Text>
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
                          className="rounded-full bg-[#F6F7FB] px-3 py-2"
                        >
                          <Text className="text-xs font-atkinson-bold text-[#666]">
                            {skill}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm font-atkinson text-[#666]">
                        Nenhuma habilidade vinculada.
                      </Text>
                    )}
                  </View>
                </InfoSection>

                <InfoSection title="Projetos aprovados" icon="rocket-outline">
                  <View className="gap-3">
                    {student.projects.length ? (
                      student.projects.map((project) => (
                        <TouchableOpacity
                          key={project.id}
                          className="rounded-2xl bg-[#F6F7FB] p-4"
                          activeOpacity={0.85}
                          onPress={() => handleOpenProject(project.id)}
                        >
                          <Text className="font-atkinson-bold text-[#2F3B69]">
                            {project.title}
                          </Text>
                          <Text className="mt-1 text-sm font-atkinson text-[#666]">
                            {project.summary ?? "Resumo não informado."}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text className="text-sm font-atkinson text-[#666]">
                        Nenhum projeto aprovado encontrado.
                      </Text>
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
  children?: React.ReactNode;
};

function StateCard({ icon, title, description, children }: StateCardProps) {
  return (
    <View className="rounded-[32px] bg-[#F6F7FB] p-6">
      <View className="items-center rounded-[28px] bg-white p-6">
        <Ionicons name={icon} size={42} color="#2f3b69" />
        <Text className="mt-4 text-center text-xl font-atkinson-bold text-[#2F3B69]">
          {title}
        </Text>
        <Text className="mt-2 text-center text-base leading-6 font-atkinson text-[#666]">
          {description}
        </Text>
        {children ? <View className="mt-5">{children}</View> : null}
      </View>
    </View>
  );
}

type InfoSectionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
};

function InfoSection({ title, icon, children }: InfoSectionProps) {
  return (
    <View className="rounded-[28px] bg-[#F6F7FB] p-4">
      <View className="rounded-[24px] bg-white p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Ionicons name={icon} size={20} color="#2f3b69" />
          <Text className="text-lg font-atkinson-bold text-[#2F3B69]">
            {title}
          </Text>
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
    <View className="border-b border-[#F6F7FB] py-3">
      <Text className="text-xs font-atkinson text-[#666]">{label}</Text>
      <Text className="mt-1 text-sm font-atkinson-bold text-[#2F3B69]">
        {value ?? "Não informado"}
      </Text>
    </View>
  );
}