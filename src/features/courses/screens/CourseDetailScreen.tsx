import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { 
  enrollInCourse, 
  getCourseDetail,
  unenrollFromCourse,
} from "../course-detail.service";
import type { CourseDetail } from "../course-detail.types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível concluir a ação.";
}

function getCourseIdFromParams(id: string | string[] | undefined) {
  if (Array.isArray(id)) {
    return id[0] ?? null;
  }

  return id ?? null;
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { isDarkMode } = useTheme();
  const courseId = getCourseIdFromParams(id);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    if (!courseId) {
      setErrorMessage("Curso não encontrado.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const detail = await getCourseDetail(courseId);

      if (!detail) {
        setCourse(null);
        setErrorMessage("Curso não encontrado ou indisponível.");
        return;
      }

      setCourse(detail);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  async function handleEnroll() {
    if (!courseId || isEnrolling || course?.enrollment.isEnrolled) {
      return;
    }

    if (course && !course.isFree) {
      setErrorMessage(
        "Este curso é pago. O fluxo de pagamento será implementado em uma issue separada.",
      );
      setSuccessMessage(null);
      return;
    }

    try {
      setIsEnrolling(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const enrollment = await enrollInCourse(courseId);

      setCourse((currentCourse) =>
        currentCourse
          ? {
              ...currentCourse,
              enrollment,
            }
          : currentCourse,
      );
      setSuccessMessage("Matrícula realizada com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsEnrolling(false);
    }
  }

  async function handleUnenroll() {
    if (!courseId || isEnrolling || !course?.enrollment.isEnrolled) {
      return;
    }

    try {
      setIsEnrolling(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await unenrollFromCourse(courseId);

      setCourse((currentCourse) =>
        currentCourse
          ? {
              ...currentCourse,
              enrollment: {
                ...currentCourse.enrollment,
                isEnrolled: false,
              },
            }
          : currentCourse,
      );

      setSuccessMessage("Matrícula cancelada com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsEnrolling(false);
    }
  }

  function confirmUnenroll() {
    Alert.alert(
      "Cancelar matrícula",
      "Tem certeza que deseja cancelar sua matrícula neste curso?",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar matrícula",
          style: "destructive",
          onPress: () => {
            void handleUnenroll();
          },
        },
      ],
    );
  }

  const mutedIconColor = isDarkMode ? "#A1A1AA" : "#71717A";

  return (
    <SafeAreaView className="flex-1 bg-zinc-100 dark:bg-zinc-950" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          className="mb-4 flex-row items-center gap-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? "#BFDBFE" : "#2F3B69"} />
          <AccessibleText className="text-base font-atkinson-bold text-[#2F3B69] dark:text-blue-100">
            Voltar
          </AccessibleText>
        </TouchableOpacity>

        {isLoading ? (
          <View className="mt-24 items-center justify-center">
            <ActivityIndicator color={isDarkMode ? "#BFDBFE" : "#2F3B69"} size="large" />
            <AccessibleText className="mt-4 text-base font-atkinson text-zinc-600 dark:text-zinc-300">
              Carregando curso...
            </AccessibleText>
          </View>
        ) : null}

        {!isLoading && errorMessage && !course ? (
          <StateCard
            title="Não foi possível carregar"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={() => void loadCourse()}
          />
        ) : null}

        {!isLoading && course ? (
          <View>
            <View className="overflow-hidden rounded-3xl bg-white dark:bg-zinc-900">
              <View className="h-52 bg-[#E8EEF6] dark:bg-zinc-800">
                {course.thumbnailUrl ? (
                  <Image
                    source={{ uri: course.thumbnailUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Ionicons name="school-outline" size={52} color={isDarkMode ? "#BFDBFE" : "#2F3B69"} />
                  </View>
                )}
              </View>

              <View className="p-5">
                <View className="flex-row flex-wrap gap-2">
                  <Badge label="Curso" />
                  <Badge label={course.priceLabel} variant={course.isFree ? "success" : "warning"} />
                  {course.enrollment.isEnrolled ? <Badge label="Já matriculado" variant="info" /> : null}
                </View>

                <AccessibleText className="mt-4 text-3xl font-atkinson-bold text-zinc-900 dark:text-white">
                  {course.title}
                </AccessibleText>

                {course.company ? (
                  <AccessibleText className="mt-2 text-base font-atkinson text-zinc-500 dark:text-zinc-400">
                    Publicado por {course.company.name}
                  </AccessibleText>
                ) : null}

                <View className="mt-5 flex-row flex-wrap gap-2">
                  <InfoPill icon="laptop-outline" text={course.modality} />
                  <InfoPill icon="bar-chart-outline" text={course.level} />
                  <InfoPill icon="time-outline" text={course.workloadLabel} />
                  <InfoPill
                    icon="ribbon-outline"
                    text={course.hasCertificate ? "Com certificado" : "Sem certificado"}
                  />
                </View>
              </View>
            </View>

            {errorMessage ? <FeedbackMessage type="error" message={errorMessage} /> : null}
            {successMessage ? <FeedbackMessage type="success" message={successMessage} /> : null}

            <Section title="Descrição">
              <AccessibleText className="text-base leading-6 font-atkinson text-zinc-700 dark:text-zinc-200">
                {course.description}
              </AccessibleText>
            </Section>

            <Section title="Skills relacionadas">
              {course.skills.length ? (
                <TagList items={course.skills.map((skill) => skill.name)} />
              ) : (
                <EmptyText text="Nenhuma skill vinculada a este curso." />
              )}
            </Section>

            <Section title="Trilhas relacionadas">
              {course.careerTracks.length ? (
                <TagList items={course.careerTracks.map((track) => track.name)} />
              ) : (
                <EmptyText text="Nenhuma trilha vinculada a este curso." />
              )}
            </Section>

            <Section title="Estrutura do curso">
              {course.modules.length ? (
                <View className="gap-3">
                  {course.modules.map((module) => (
                    <View
                      key={module.id}
                      className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
                    >
                      <AccessibleText className="text-base font-atkinson-bold text-zinc-900 dark:text-white">
                        {module.position}. {module.title}
                      </AccessibleText>

                      {module.description ? (
                        <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                          {module.description}
                        </AccessibleText>
                      ) : null}

                      {module.lessons.length ? (
                        <View className="mt-4 gap-2">
                          {module.lessons.map((lesson) => (
                            <View key={lesson.id} className="flex-row items-start gap-2">
                              <Ionicons name="play-circle-outline" size={18} color={mutedIconColor} />
                              <View className="flex-1">
                                <AccessibleText className="text-sm font-atkinson-bold text-zinc-800 dark:text-zinc-100">
                                  {lesson.title}
                                </AccessibleText>
                                <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                                  {lesson.durationMinutes > 0
                                    ? `${lesson.durationMinutes} min`
                                    : "Duração não informada"}
                                </AccessibleText>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <EmptyText text="Nenhuma aula cadastrada neste módulo." />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyText text="A estrutura do curso ainda não foi cadastrada." />
              )}
            </Section>

            {!course.isFree ? (
              <AccessibleText className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-center text-sm font-atkinson-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Este curso é pago. O checkout será tratado em uma issue separada.
              </AccessibleText>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isEnrolling || (!course.isFree && !course.enrollment.isEnrolled)}
              className={`mt-6 rounded-2xl py-4 ${
                course.enrollment.isEnrolled
                  ? "border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40"
                  : isEnrolling
                    ? "bg-zinc-400"
                    : "bg-[#2F3B69]"
              }`}
              onPress={course.enrollment.isEnrolled ? confirmUnenroll : handleEnroll}
            >
              <AccessibleText
                className={`text-center text-base font-atkinson-bold ${
                  course.enrollment.isEnrolled
                    ? "text-red-700 dark:text-red-300"
                    : "text-white"
                }`}
              >
                {course.enrollment.isEnrolled
                  ? isEnrolling
                    ? "Cancelando..."
                    : "Cancelar matrícula"
                  : !course.isFree
                    ? "Checkout em breve"
                    : isEnrolling
                      ? "Matriculando..."
                      : "Matricular-se gratuitamente"}
              </AccessibleText>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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

type BadgeProps = {
  label: string;
  variant?: "default" | "success" | "info" | "warning";
};

function Badge({ label, variant = "default" }: BadgeProps) {
  const classNameByVariant = {
    default: "bg-[#2F3B69]",
    success: "bg-emerald-600",
    info: "bg-blue-600",
    warning: "bg-amber-600",
  };

  return (
    <View className={`rounded-full px-3 py-1 ${classNameByVariant[variant]}`}>
      <AccessibleText className="text-xs font-atkinson-bold text-white">
        {label}
      </AccessibleText>
    </View>
  );
}

type InfoPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function InfoPill({ icon, text }: InfoPillProps) {
  const { isDarkMode } = useTheme();

  return (
    <View className="flex-row items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
      <Ionicons name={icon} size={14} color={isDarkMode ? "#BFDBFE" : "#2F3B69"} />
      <AccessibleText className="text-xs font-atkinson-bold text-zinc-700 dark:text-zinc-200">
        {text}
      </AccessibleText>
    </View>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <View key={item} className="rounded-full bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <AccessibleText className="text-sm font-atkinson-bold text-zinc-700 dark:text-zinc-200">
            {item}
          </AccessibleText>
        </View>
      ))}
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <AccessibleText className="text-base font-atkinson text-zinc-500 dark:text-zinc-400">
      {text}
    </AccessibleText>
  );
}

type FeedbackMessageProps = {
  type: "error" | "success";
  message: string;
};

function FeedbackMessage({ type, message }: FeedbackMessageProps) {
  const styles =
    type === "error"
      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";

  return (
    <AccessibleText className={`mt-5 rounded-xl px-4 py-3 text-center text-sm font-atkinson ${styles}`}>
      {message}
    </AccessibleText>
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
    <View className="mt-12 rounded-3xl bg-white p-5 dark:bg-zinc-900">
      <AccessibleText className="text-center text-lg font-atkinson-bold text-zinc-900 dark:text-white">
        {title}
      </AccessibleText>
      <AccessibleText className="mt-2 text-center text-base font-atkinson text-zinc-600 dark:text-zinc-300">
        {description}
      </AccessibleText>
      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-5 rounded-xl bg-[#2F3B69] py-3"
        onPress={onAction}
      >
        <AccessibleText className="text-center text-base font-atkinson-bold text-white">
          {actionLabel}
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}
