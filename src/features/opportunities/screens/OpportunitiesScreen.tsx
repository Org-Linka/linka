import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useAuth } from "@/features/auth/auth.context";
import { useNotificationsUnread } from "@/features/notifications/useNotificationsUnread";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";
import { SearchBar } from "@/shared/components/ui/molecules/search-bar/SearchBar";

import { CatalogCard } from "../components/CatalogCard";
import { listStudentCatalog } from "../opportunities.service";
import type {
  CareerTrackOption,
  CatalogData,
  CatalogFilters,
  CatalogItem,
} from "../opportunities.types";
import { DEFAULT_CATALOG_FILTERS } from "../opportunities.types";

const typeFilters: {
  label: string;
  value: CatalogFilters["type"];
}[]= [
  { label: "Todos", value: "all" },
  { label: "Cursos", value: "course" },
  { label: "Eventos", value: "event" },
];

const modalityFilters: {
  label: string;
  value: CatalogFilters["modality"];
}[] = [
  { label: "Todas", value: "all" },
  { label: "Online", value: "online" },
  { label: "Presencial", value: "onsite" },
  { label: "Híbrido", value: "hybrid" },
];

const priceFilters: {
  label: string;
  value: CatalogFilters["price"];
}[] = [
  { label: "Todos", value: "all" },
  { label: "Gratuitos", value: "free" },
  { label: "Pagos", value: "paid" },
];

export default function OpportunitiesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [catalogData, setCatalogData] = useState<CatalogData>({
    careerTracks: [],
    items: [],
  });
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);
  const [searchBarResetKey, setSearchBarResetKey] = useState(0);
  const { unreadCount } = useNotificationsUnread(user?.id);

  const careerTrackFilters = useMemo(
    () => buildCareerTrackFilters(catalogData.careerTracks),
    [catalogData.careerTracks],
  );

  const loadCatalog = useCallback(async (nextFilters: CatalogFilters) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await listStudentCatalog(nextFilters);
      setCatalogData(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o catálogo.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog(filters);
  }, [filters, loadCatalog]);

  function updateFilters(nextFilters: Partial<CatalogFilters>) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
    }));
  }

  function resetFilters() {
    setFilters(DEFAULT_CATALOG_FILTERS);
    setSearchBarResetKey((currentKey) => currentKey + 1);
  }

  function handlePressItem(item: CatalogItem) {
    if (item.type === "course") {
      router.push({ pathname: "/courses/[id]", params: { id: item.id } });
      return;
    }

    router.push({ pathname: "/events/[id]", params: { id: item.id } });
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white">
        <AppTopBar
          title="Catálogo"
          rightIcon="notifications-outline"
          onRightPress={() => router.push("/notifications" as Href)}
          notificationUnreadCount={unreadCount}
        />

        <AnimatedScreenScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white"
          contentContainerStyle={{
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24,
          }}
        >
          <View className="bg-[#002B5B] px-5 pb-12 pt-2">
            <Text className="text-3xl font-bold text-white">
              Oportunidades para você
            </Text>
            <Text className="mt-2 text-base text-[#DDE6F2]">
              Descubra cursos e eventos publicados por empresas parceiras.
            </Text>
          </View>

          <View className="-mt-8 rounded-t-[34px] bg-white px-5 pt-6">
            <View className="mb-5 flex-row items-center gap-3">
              <View className="h-12 flex-1">
                <SearchBar
                  key={searchBarResetKey}
                  placeholder="Buscar por curso, evento ou empresa"
                  onSearch={(search) => updateFilters({ search })}
                  onClear={() => updateFilters({ search: "" })}
                  enableWidthAnimation={false}
                  centerWhenUnfocused={false}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                className="h-12 flex-row items-center justify-center rounded-2xl bg-[#002B5B] px-4"
                onPress={() => setIsFiltersModalVisible(true)}
              >
                <Ionicons name="filter" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-sm font-bold text-white">
                  Filtros
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4 mt-2">
              <Text className="text-lg font-bold text-[#002B5B]">
                {catalogData.items.length} resultado
                {catalogData.items.length === 1 ? "" : "s"}
              </Text>
            </View>

            {renderContent({
              errorMessage,
              isLoading,
              items: catalogData.items,
              onPressItem: handlePressItem,
              onRetry: () => void loadCatalog(filters),
            })}
          </View>
        </AnimatedScreenScrollView>

        <Modal
          visible={isFiltersModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFiltersModalVisible(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setIsFiltersModalVisible(false)}
          >
            <Pressable className="rounded-t-[32px] bg-white px-5 pb-8 pt-5">
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-[#002B5B]">
                  Filtros
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsFiltersModalVisible(false)}
                >
                  <Text className="text-sm font-bold text-[#002B5B]">
                    Fechar
                  </Text>
                </TouchableOpacity>
              </View>

              <FilterSection title="Tipo">
                {typeFilters.map((filter) => (
                  <FilterChip
                    key={filter.value}
                    label={filter.label}
                    isSelected={filters.type === filter.value}
                    onPress={() => updateFilters({ type: filter.value })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Modalidade">
                {modalityFilters.map((filter) => (
                  <FilterChip
                    key={filter.value}
                    label={filter.label}
                    isSelected={filters.modality === filter.value}
                    onPress={() => updateFilters({ modality: filter.value })}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Preço">
                {priceFilters.map((filter) => (
                  <FilterChip
                    key={filter.value}
                    label={filter.label}
                    isSelected={filters.price === filter.value}
                    onPress={() => updateFilters({ price: filter.value })}
                  />
                ))}
              </FilterSection>

              {careerTrackFilters.length > 1 ? (
                <FilterSection title="Trilha de carreira">
                  {careerTrackFilters.map((filter) => (
                    <FilterChip
                      key={filter.value}
                      label={filter.label}
                      isSelected={filters.careerTrackId === filter.value}
                      onPress={() =>
                        updateFilters({ careerTrackId: filter.value })
                      }
                    />
                  ))}
                </FilterSection>
              ) : null}

              <View className="mt-2 flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.85}
                  className="h-12 flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-white"
                  onPress={resetFilters}
                >
                  <Text className="font-bold text-[#002B5B]">Limpar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#002B5B]"
                  onPress={() => setIsFiltersModalVisible(false)}
                >
                  <Text className="font-bold text-white">Aplicar</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-bold text-zinc-700">{title}</Text>
      <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pr-5">{children}</View>
      </RNScrollView>
    </View>
  );
}

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function FilterChip({ isSelected, label, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`rounded-full px-4 py-2 ${
        isSelected ? "bg-[#002B5B]" : "bg-zinc-100"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected ? "text-white" : "text-zinc-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type RenderContentParams = {
  isLoading: boolean;
  errorMessage: string | null;
  items: CatalogItem[];
  onPressItem: (item: CatalogItem) => void;
  onRetry: () => void;
};

function renderContent({
  errorMessage,
  isLoading,
  items,
  onPressItem,
  onRetry,
}: RenderContentParams) {
  if (isLoading) {
    return (
      <View className="items-center justify-center rounded-3xl bg-zinc-50 p-8">
        <ActivityIndicator color="#002B5B" size="large" />
        <Text className="mt-4 text-center text-zinc-600">
          Carregando cursos e eventos...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="items-center justify-center rounded-3xl bg-red-50 p-8">
        <Ionicons name="warning-outline" size={36} color="#B91C1C" />
        <Text className="mt-3 text-center text-base font-bold text-red-700">
          Erro ao carregar catálogo
        </Text>
        <Text className="mt-2 text-center text-sm text-red-700">
          {errorMessage}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-4 rounded-full bg-red-700 px-5 py-2"
          onPress={onRetry}
        >
          <Text className="font-bold text-white">Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="items-center justify-center rounded-3xl bg-zinc-50 p-8">
        <Ionicons name="file-tray-outline" size={38} color="#71717A" />
        <Text className="mt-3 text-center text-base font-bold text-zinc-800">
          Nenhum curso ou evento encontrado
        </Text>
        <Text className="mt-2 text-center text-sm text-zinc-500">
          Tente ajustar os filtros ou buscar outro termo.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {items.map((item) => (
        <CatalogCard key={`${item.type}-${item.id}`} item={item} onPress={onPressItem} />
      ))}
    </View>
  );
}

function buildCareerTrackFilters(careerTracks: CareerTrackOption[]) {
  return [
    { label: "Todas", value: "all" },
    ...careerTracks.map((track) => ({
      label: track.name,
      value: track.id,
    })),
  ];
}
