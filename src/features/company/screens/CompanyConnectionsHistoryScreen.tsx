import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listCompanyConnectionsHistory } from "../company.service";
import type { CompanyConnectionHistoryItem } from "../company.types";

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

export default function CompanyConnectionsHistoryScreen() {
  const [connections, setConnections] = useState<CompanyConnectionHistoryItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  function handleOpenProject(projectId: string) {
    router.push(`/projects/${projectId}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-white"
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
          <View className="bg-[#002B5B] px-5 pb-20 pt-4">
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
              Histórico de conexões
            </Text>

            <Text className="mt-2 text-base font-atkinson text-[#F6F7FB]">
              Veja os projetos em que sua empresa demonstrou interesse ou enviou
              contato.
            </Text>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white px-5 pt-8">
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
                  <Text className="font-atkinson-bold text-white">
                    Tentar novamente
                  </Text>
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

            {!isLoading && !errorMessage && connections.length ? (
              <View className="gap-4">
                {connections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onOpenProject={() => handleOpenProject(connection.projectId)}
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

type ConnectionCardProps = {
  connection: CompanyConnectionHistoryItem;
  onOpenProject: () => void;
};

function ConnectionCard({ connection, onOpenProject }: ConnectionCardProps) {
  const isContact = connection.type === "contact";

  return (
    <View className="rounded-[28px] bg-[#F6F7FB] p-4">
      <View className="rounded-[24px] bg-white p-5">
        <View className="flex-row items-center justify-between gap-3">
          <View
            className={`rounded-full px-4 py-2 ${
              isContact ? "bg-[#002B5B]" : "bg-[#FFD700]"
            }`}
          >
            <Text
              className={`text-xs font-atkinson-bold ${
                isContact ? "text-white" : "text-[#002B5B]"
              }`}
            >
              {isContact ? "Contato enviado" : "Interesse registrado"}
            </Text>
          </View>

          <Text className="flex-1 text-right text-xs font-atkinson text-[#666]">
            {formatConnectionDate(connection.createdAt)}
          </Text>
        </View>

        <Text className="mt-5 text-xl font-atkinson-bold text-[#002B5B]">
          {connection.projectTitle}
        </Text>

        <Text className="mt-2 text-sm leading-5 font-atkinson text-[#666]">
          {connection.projectSummary ?? "Resumo não informado."}
        </Text>

        <View className="mt-5 rounded-2xl bg-[#F6F7FB] p-4">
          <Text className="text-xs font-atkinson text-[#666]">Estudante</Text>
          <Text className="mt-1 text-base font-atkinson-bold text-[#002B5B]">
            {connection.studentName ??
              connection.studentEmail ??
              "Estudante não informado"}
          </Text>

          {connection.studentEmail ? (
            <Text className="mt-1 text-sm font-atkinson text-[#666]">
              {connection.studentEmail}
            </Text>
          ) : null}
        </View>

        {connection.message ? (
          <View className="mt-4 rounded-2xl bg-[#F6F7FB] p-4">
            <Text className="text-xs font-atkinson text-[#666]">Mensagem</Text>
            <Text className="mt-1 text-sm leading-5 font-atkinson text-[#002B5B]">
              {connection.message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-[#2f3b69] py-4"
          activeOpacity={0.85}
          onPress={onOpenProject}
        >
          <Ionicons name="open-outline" size={18} color="#ffffff" />
          <Text className="font-atkinson-bold text-white">Abrir projeto</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text className="mt-4 text-center text-xl font-atkinson-bold text-[#002B5B]">
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