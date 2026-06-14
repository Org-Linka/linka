import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useAuth } from "@/features/auth/auth.context";
import { useNotificationsUnread } from "@/features/notifications/useNotificationsUnread";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";

import { CategoryPill } from "../components/CategoryPill";
import { HomeHeader } from "../components/HomeHeader";
import { getStudentHomeData, listHomeCategories } from "../home.service";
import type { HomeCategory, HomeCourse, HomeEvent, StudentHomeData } from "../home.types";

const { width } = Dimensions.get("window");

const EMPTY_HOME_DATA: StudentHomeData = {
  courses: [],
  events: [],
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível carregar os destaques.";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const categories = listHomeCategories();
  const { unreadCount } = useNotificationsUnread(user?.id);

  const [homeData, setHomeData] = useState<StudentHomeData>(EMPTY_HOME_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getStudentHomeData();
      setHomeData(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  function openCourse(courseId: string) {
    router.push({ pathname: "/courses/[id]", params: { id: courseId } });
  }

  function openEvent(eventId: string) {
    router.push({ pathname: "/events/[id]", params: { id: eventId } });
  }

  function handlePressCategory(category: HomeCategory) {
    if (category.target === "payments") {
      router.push("/payments" as Href);
      return;
    }

    if (category.target === "projects") {
      router.push("/projects/create" as Href);
      return;
    }

    router.push("/opportunities" as Href);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2F3B69]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <HomeHeader
          onNotificationsPress={() => router.push("/notifications" as Href)}
          notificationUnreadCount={unreadCount}
        />

        <AnimatedScreenScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white dark:bg-zinc-900"
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 20 }}
        >
          <View className="bg-[#2F3B69] px-5 pb-20 pt-2">
            <AccessibleText className="text-3xl font-bold text-white font-atkinson-bold">
              Olá, Aluno!
            </AccessibleText>
            <AccessibleText className="mt-1 text-base text-[#BDC3C7] font-atkinson">
              O que vamos descobrir hoje?
            </AccessibleText>
          </View>

          <View className="-mt-14 rounded-t-[50px] bg-white px-5 pt-8 dark:bg-zinc-900">
            <AccessibleText className="mb-4 text-lg font-bold text-[#002B5B] dark:text-blue-100">
              Categorias
            </AccessibleText>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <CategoryPill category={item} onPress={handlePressCategory} />}
              contentContainerClassName="pb-2"
            />

            {isLoading ? (
              <LoadingState />
            ) : errorMessage ? (
              <StateCard
                title="Não foi possível carregar"
                description={errorMessage}
                actionLabel="Tentar novamente"
                onAction={() => void loadHomeData()}
              />
            ) : (
              <View>
                <SectionHeader
                  title="Cursos em destaque"
                  actionLabel="Ver todos"
                  onAction={() => router.push("/opportunities" as Href)}
                />

                {homeData.courses.length ? (
                  <FlatList
                    horizontal
                    data={homeData.courses}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <CourseCard
                        course={item}
                        width={Math.min(width * 0.78, 330)}
                        onPress={() => openCourse(item.id)}
                      />
                    )}
                    contentContainerClassName="pb-2"
                  />
                ) : (
                  <EmptyState text="Nenhum curso publicado no momento." />
                )}

                <SectionHeader
                  title="Últimos eventos publicados"
                  actionLabel="Ver todos"
                  onAction={() => router.push("/opportunities" as Href)}
                />

                {homeData.events.length ? (
                  <View className="gap-4">
                    {homeData.events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => openEvent(event.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState text="Nenhum evento publicado no momento." />
                )}
              </View>
            )}
          </View>
        </AnimatedScreenScrollView>

        <TouchableOpacity
          className="absolute bottom-[12%] right-6 h-[65px] w-[65px] items-center justify-center rounded-full bg-[#FFDE59]"
          style={styles.fabShadow}
          onPress={() => router.push("/projects/create")}
        >
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type SectionHeaderProps = {
  title: string;
  actionLabel: string;
  onAction: () => void;
};

function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="mb-4 mt-7 flex-row items-center justify-between gap-3">
      <AccessibleText className="flex-1 text-lg font-bold text-[#002B5B] dark:text-blue-100">
        {title}
      </AccessibleText>
      <TouchableOpacity activeOpacity={0.75} onPress={onAction}>
        <AccessibleText className="text-xs font-atkinson-bold text-[#666] dark:text-zinc-300">
          {actionLabel}
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}

type CourseCardProps = {
  course: HomeCourse;
  width: number;
  onPress: () => void;
};

function CourseCard({ course, width, onPress }: CourseCardProps) {
  const metadata = [
    course.modality,
    course.level,
    course.workloadLabel,
    course.hasCertificate ? "Certificado" : null,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="mr-4 overflow-hidden rounded-3xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      style={{ width, ...styles.cardShadow }}
      onPress={onPress}
    >
      <View className="h-36 bg-[#E8EEF6] dark:bg-zinc-800">
        {course.imageUrl ? (
          <Image
            source={{ uri: course.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="school-outline" size={42} color="#002B5B" />
          </View>
        )}

        <View className="absolute left-3 top-3 rounded-full bg-[#002B5B] px-3 py-1">
          <AccessibleText className="text-xs font-bold text-white">
            Curso
          </AccessibleText>
        </View>
      </View>

      <View className="p-4">
        <AccessibleText className="text-lg font-atkinson-bold text-[#002B5B] dark:text-blue-100" numberOfLines={2}>
          {course.title}
        </AccessibleText>
        <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
          {course.companyName}
        </AccessibleText>

        {course.description ? (
          <AccessibleText className="mt-3 text-sm leading-5 font-atkinson text-zinc-600 dark:text-zinc-300" numberOfLines={2}>
            {course.description}
          </AccessibleText>
        ) : null}

        <View className="mt-4 flex-row flex-wrap gap-2">
          {metadata.map((label, index) => (
            <View key={`${label}-${index}`} className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
              <AccessibleText className="text-xs font-atkinson-bold text-zinc-700 dark:text-zinc-200">
                {label}
              </AccessibleText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

type EventCardProps = {
  event: HomeEvent;
  onPress: () => void;
};

function EventCard({ event, onPress }: EventCardProps) {
  const metadata = [event.modality, event.startsAtLabel, event.location].filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="overflow-hidden rounded-3xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      style={styles.cardShadow}
      onPress={onPress}
    >
      <View className="h-40 bg-[#E8EEF6] dark:bg-zinc-800">
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons name="calendar-outline" size={42} color="#002B5B" />
          </View>
        )}

        <View className="absolute left-3 top-3 rounded-full bg-[#002B5B] px-3 py-1">
          <AccessibleText className="text-xs font-bold text-white">
            Evento
          </AccessibleText>
        </View>

        <View className="absolute right-3 top-3 rounded-full bg-[#FFF7CC] px-3 py-1">
          <AccessibleText className="text-xs font-bold text-[#6B5800]">
            {event.priceLabel}
          </AccessibleText>
        </View>
      </View>

      <View className="p-4">
        <AccessibleText className="text-lg font-atkinson-bold text-[#002B5B] dark:text-blue-100" numberOfLines={2}>
          {event.title}
        </AccessibleText>
        <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
          {event.companyName}
        </AccessibleText>

        {event.description ? (
          <AccessibleText className="mt-3 text-sm leading-5 font-atkinson text-zinc-600 dark:text-zinc-300" numberOfLines={2}>
            {event.description}
          </AccessibleText>
        ) : null}

        <View className="mt-4 flex-row flex-wrap gap-2">
          {metadata.map((label, index) => (
            <View key={`${label}-${index}`} className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
              <AccessibleText className="text-xs font-atkinson-bold text-zinc-700 dark:text-zinc-200">
                {label}
              </AccessibleText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LoadingState() {
  return (
    <View className="mt-7 items-center justify-center rounded-3xl bg-zinc-50 py-10 dark:bg-zinc-950">
      <ActivityIndicator color="#002B5B" size="large" />
      <AccessibleText className="mt-3 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
        Carregando cursos e eventos...
      </AccessibleText>
    </View>
  );
}

type StateCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

function StateCard({ title, description, actionLabel, onAction }: StateCardProps) {
  return (
    <View className="mt-7 rounded-3xl bg-red-50 p-5 dark:bg-red-950/30">
      <AccessibleText className="text-lg font-atkinson-bold text-red-800 dark:text-red-200">
        {title}
      </AccessibleText>
      <AccessibleText className="mt-2 text-sm font-atkinson text-red-700 dark:text-red-200">
        {description}
      </AccessibleText>
      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-4 rounded-2xl bg-red-700 py-3"
        onPress={onAction}
      >
        <AccessibleText className="text-center text-sm font-atkinson-bold text-white">
          {actionLabel}
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <AccessibleText className="rounded-3xl bg-zinc-50 p-5 text-center text-sm font-atkinson text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
      {text}
    </AccessibleText>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  fabShadow: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
