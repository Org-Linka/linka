import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFont, useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { listCompanyConnectionsHistory } from "../company.service";
import type { CompanyConnectionHistoryItem } from "../company.types";

type PeriodFilter = "all" | "7d" | "30d" | "90d";

const periodOptions: {
  label: string;
  value: PeriodFilter;
}[] = [
  { label: "Todos", value: "all" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível carregar o histórico.";
}

function formatConnectionDate(date: string | null) {
  if (!date) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function normalizeText(value: string | null) {
  return value?.toLowerCase().trim() ?? "";
}

function isInsideSelectedPeriod(date: string | null, period: PeriodFilter) {
  if (period === "all") {
    return true;
  }

  if (!date) {
    return false;
  }

  const dateTime = new Date(date).getTime();

  if (Number.isNaN(dateTime)) {
    return false;
  }

  const daysByPeriod: Record<Exclude<PeriodFilter, "all">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const limitDate = Date.now() - daysByPeriod[period] * 24 * 60 * 60 * 1000;

  return dateTime >= limitDate;
}

export default function CompanyConnectionsHistoryScreen() {
  const [connections, setConnections] = useState<CompanyConnectionHistoryItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const filteredConnections = useMemo(() => {
    const normalizedStudentFilter = studentFilter.toLowerCase().trim();
    const normalizedProjectFilter = projectFilter.toLowerCase().trim();

    return connections.filter((connection) => {
      const matchesStudent =
        !normalizedStudentFilter ||
        normalizeText(connection.studentName).includes(normalizedStudentFilter) ||
        normalizeText(connection.studentEmail).includes(normalizedStudentFilter);

      const matchesProject =
        !normalizedProjectFilter ||
        normalizeText(connection.projectTitle).includes(normalizedProjectFilter) ||
        normalizeText(connection.projectSummary).includes(
          normalizedProjectFilter,
        );

      const matchesPeriod = isInsideSelectedPeriod(
        connection.createdAt,
        periodFilter,
      );

      return matchesStudent && matchesProject && matchesPeriod;
    });
  }, [connections, periodFilter, projectFilter, studentFilter]);

  const hasActiveFilters =
    Boolean(studentFilter.trim()) ||
    Boolean(projectFilter.trim()) ||
    periodFilter !== "all";

  const loadConnections = useCallback(async () => {
    try {
      setErrorMessage(null);

      const history = await listCompanyConnectionsHistory();

      setConnections(history);
    } catch (error) {
      setConnections([]);
      setErrorMessage(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      await loadConnections();
      setIsLoading(false);
    }

    loadInitialData();
  }, [loadConnections]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadConnections();
    setIsRefreshing(false);
  }

  function handleClearFilters() {
    setStudentFilter("");
    setProjectFilter("");
    setPeriodFilter("all");
  }

  function handleOpenProject(projectId: string) {
    router.push(`/projects/${projectId}`);
  }

  function handleOpenStudent(studentId: string | null) {
    if (!studentId) {
      return;
    }

    router.push(`/company/students/${studentId}` as never);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <ScrollView
          className="flex-1 bg-white dark:bg-zinc-900"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              tintColor="#2f3b69"
              onRefresh={handleRefresh}
            />
          }
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
              Histórico de conexões
            </AccessibleText>

            <AccessibleText className="mt-2 text-base font-atkinson text-[#F6F7FB]">
              Veja os projetos em que sua empresa demonstrou interesse ou enviou
              contato.
            </AccessibleText>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white dark:bg-zinc-900 px-5 pt-8">
            <ConnectionFilters
              studentFilter={studentFilter}
              projectFilter={projectFilter}
              periodFilter={periodFilter}
              hasActiveFilters={hasActiveFilters}
              onChangeStudentFilter={setStudentFilter}
              onChangeProjectFilter={setProjectFilter}
              onChangePeriodFilter={setPeriodFilter}
              onClearFilters={handleClearFilters}
            />

            {isLoading ? (
              <StateCard
                icon="sync-outline"
                title="Carregando histórico"
                description="Estamos buscando suas conexões realizadas."
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
                  onPress={loadConnections}
                >
                  <AccessibleText className="font-atkinson-bold text-white">
                    Tentar novamente
                  </AccessibleText>
                </TouchableOpacity>
              </StateCard>
            ) : null}

            {!isLoading && !errorMessage && !connections.length ? (
              <StateCard
                icon="file-tray-outline"
                title="Nenhuma conexão realizada"
                description="Quando sua empresa demonstrar interesse ou enviar contato, o histórico aparecerá aqui."
              />
            ) : null}

            {!isLoading &&
            !errorMessage &&
            connections.length &&
            !filteredConnections.length ? (
              <StateCard
                icon="filter-outline"
                title="Nenhum resultado encontrado"
                description="Tente mudar os filtros de estudante, projeto ou período."
              >
                <TouchableOpacity
                  className="mt-4 rounded-full bg-[#FFDE59] px-5 py-3"
                  activeOpacity={0.85}
                  onPress={handleClearFilters}
                >
                  <AccessibleText className="font-atkinson-bold text-[#2F3B69]">
                    Limpar filtros
                  </AccessibleText>
                </TouchableOpacity>
              </StateCard>
            ) : null}

            {!isLoading && !errorMessage && filteredConnections.length ? (
              <View className="gap-4">
                <AccessibleText className="text-sm font-atkinson-bold text-[#2F3B69] dark:text-white">
                  {filteredConnections.length === 1
                    ? "1 conexão encontrada"
                    : `${filteredConnections.length} conexões encontradas`
                  }
                </AccessibleText>

                {filteredConnections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onOpenProject={() => handleOpenProject(connection.projectId)}
                    onOpenStudent={() => handleOpenStudent(connection.studentId)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type ConnectionFiltersProps = {
  studentFilter: string;
  projectFilter: string;
  periodFilter: PeriodFilter;
  hasActiveFilters: boolean;
  onChangeStudentFilter: (value: string) => void;
  onChangeProjectFilter: (value: string) => void;
  onChangePeriodFilter: (value: PeriodFilter) => void;
  onClearFilters: () => void;
};

function ConnectionFilters({
  studentFilter,
  projectFilter,
  periodFilter,
  hasActiveFilters,
  onChangeStudentFilter,
  onChangeProjectFilter,
  onChangePeriodFilter,
  onClearFilters,
}: ConnectionFiltersProps) {
  const { fontScale } = useFont();
  const { isDarkMode } = useTheme();

  return (
    <View className="mb-5 rounded-[28px] bg-[#F6F7FB] dark:bg-zinc-800 p-4">
      <View className="rounded-[24px] bg-white dark:bg-zinc-900 p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="filter-outline" size={18} color="#2f3b69" />
            <AccessibleText className="font-atkinson-bold text-[#2F3B69] dark:text-white">
              Filtros
            </AccessibleText>
          </View>

          {hasActiveFilters ? (
            <TouchableOpacity activeOpacity={0.8} onPress={onClearFilters}>
              <AccessibleText className="text-sm font-atkinson-bold text-[#2f3b69] dark:text-white">
                Limpar
              </AccessibleText>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="mt-4 gap-3">
          <View>
            <AccessibleText className="mb-2 text-xs font-atkinson-bold text-[#666] dark:text-zinc-300">
              Estudante
            </AccessibleText>
            <TextInput
              className="rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 px-4 py-3 font-atkinson text-[#2F3B69] dark:text-white"
              placeholder="Buscar por nome ou e-mail"
              placeholderTextColor={isDarkMode ? "#a1a1aa" : "#666"}
              value={studentFilter}
              onChangeText={onChangeStudentFilter}
              style={{ fontSize: 16 * fontScale }}
            />
          </View>

          <View>
            <AccessibleText className="mb-2 text-xs font-atkinson-bold text-[#666] dark:text-zinc-300">
              Projeto
            </AccessibleText>
            <TextInput
              className="rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 px-4 py-3 font-atkinson text-[#2F3B69] dark:text-white"
              placeholder="Buscar por título ou resumo"
              placeholderTextColor={isDarkMode ? "#a1a1aa" : "#666"}
              value={projectFilter}
              onChangeText={onChangeProjectFilter}
              style={{ fontSize: 16 * fontScale }}
            />
          </View>

          <View>
            <AccessibleText className="mb-2 text-xs font-atkinson-bold text-[#666] dark:text-zinc-300">
              Período
            </AccessibleText>

            <View className="flex-row flex-wrap gap-2">
              {periodOptions.map((option) => {
                const isSelected = option.value === periodFilter;

                return (
                  <TouchableOpacity
                    key={option.value}
                    className={`rounded-full px-4 py-2 ${
                      isSelected ? "bg-[#2F3B69]" : "bg-[#F6F7FB] dark:bg-zinc-800"
                    }`}
                    activeOpacity={0.85}
                    onPress={() => onChangePeriodFilter(option.value)}
                  >
                    <AccessibleText
                      className={`text-xs font-atkinson-bold ${
                        isSelected ? "text-white" : "text-[#2F3B69] dark:text-white"
                      }`}
                    >
                      {option.label}
                    </AccessibleText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

type ConnectionCardProps = {
  connection: CompanyConnectionHistoryItem;
  onOpenProject: () => void;
  onOpenStudent: () => void;
};

function ConnectionCard({
  connection,
  onOpenProject,
  onOpenStudent,
}: ConnectionCardProps) {
  const isContact = connection.type === "contact";

  return (
    <View className="rounded-[28px] bg-[#F6F7FB] dark:bg-zinc-800 p-4">
      <View className="rounded-[24px] bg-white dark:bg-zinc-900 p-5">
        <View className="flex-row items-center justify-between gap-3">
          <View
            className={`rounded-full px-4 py-2 ${
              isContact ? "bg-[#2F3B69]" : "bg-[#FFDE59]"
            }`}
          >
            <AccessibleText
              className={`text-xs font-atkinson-bold ${
                isContact ? "text-white" : "text-[#2F3B69]"
              }`}
            >
              {isContact ? "Contato enviado" : "Interesse registrado"}
            </AccessibleText>
          </View>

          <AccessibleText className="flex-1 text-right text-xs font-atkinson text-[#666] dark:text-zinc-300">
            {formatConnectionDate(connection.createdAt)}
          </AccessibleText>
        </View>

        <AccessibleText className="mt-5 text-xl font-atkinson-bold text-[#2F3B69] dark:text-white">
          {connection.projectTitle}
        </AccessibleText>

        <AccessibleText className="mt-2 text-sm leading-5 font-atkinson text-[#666] dark:text-zinc-300">
          {connection.projectSummary ?? "Resumo não informado."}
        </AccessibleText>

        <View className="mt-5 rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 p-4">
          <AccessibleText className="text-xs font-atkinson text-[#666] dark:text-zinc-300">
            Estudante
          </AccessibleText>
          <AccessibleText className="mt-1 text-base font-atkinson-bold text-[#2F3B69] dark:text-white">
            {connection.studentName ??
              connection.studentEmail ??
              "Estudante não informado"}
          </AccessibleText>

          {connection.studentEmail ? (
            <AccessibleText className="mt-1 text-sm font-atkinson text-[#666] dark:text-zinc-300">
              {connection.studentEmail}
            </AccessibleText>
          ) : null}
        </View>

        {connection.message ? (
          <View className="mt-4 rounded-2xl bg-[#F6F7FB] dark:bg-zinc-800 p-4">
            <AccessibleText className="text-xs font-atkinson text-[#666] dark:text-zinc-300">
              Mensagem
            </AccessibleText>
            <AccessibleText className="mt-1 text-sm leading-5 font-atkinson text-[#2F3B69] dark:text-white">
              {connection.message}
            </AccessibleText>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#2f3b69] py-4"
            activeOpacity={0.85}
            onPress={onOpenProject}
          >
            <Ionicons name="open-outline" size={18} color="#ffffff" />
            <AccessibleText className="font-atkinson-bold text-white">
              Abrir projeto
            </AccessibleText>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 ${
              connection.studentId ? "bg-[#FFDE59]" : "bg-[#F6F7FB] dark:bg-zinc-800"
            }`}
            activeOpacity={0.85}
            disabled={!connection.studentId}
            onPress={onOpenStudent}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={connection.studentId ? "#2F3B69" : "#666"}
            />
            <AccessibleText
              className={`font-atkinson-bold ${
                connection.studentId ? "text-[#2F3B69]" : "text-[#666] dark:text-zinc-300"
              }`}
            >
              Abrir estudante
            </AccessibleText>
          </TouchableOpacity>
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