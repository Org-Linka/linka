import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { 
  getEventDetail, 
  registerInEvent,
  unregisterFromEvent, 
} from "../event-detail.service";
import type { EventDetail } from "../event-detail.types";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível concluir a ação.";
}

function getEventIdFromParams(id: string | string[] | undefined) {
  if (Array.isArray(id)) {
    return id[0] ?? null;
  }

  return id ?? null;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { isDarkMode } = useTheme();
  const eventId = getEventIdFromParams(id);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      setErrorMessage("Evento não encontrado.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const detail = await getEventDetail(eventId);

      if (!detail) {
        setEvent(null);
        setErrorMessage("Evento não encontrado ou indisponível.");
        return;
      }

      setEvent(detail);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function handleRegister() {
    if (!eventId || isRegistering || event?.participant.isRegistered) {
      return;
    }

    if (event && !event.isFree) {
      setErrorMessage(
        "Este evento é pago. O fluxo de pagamento será implementado em uma issue separada.",
      );
      setSuccessMessage(null);
      return;
    }

    try {
      setIsRegistering(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const participant = await registerInEvent(eventId);

      setEvent((currentEvent) =>
        currentEvent
          ? {
              ...currentEvent,
              participant,
            }
          : currentEvent,
      );
      setSuccessMessage("Inscrição realizada com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleUnregister() {
    if (!eventId || isRegistering || !event?.participant.isRegistered) {
      return;
    }

    try {
      setIsRegistering(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await unregisterFromEvent(eventId);

      setEvent((currentEvent) =>
        currentEvent
          ? {
              ...currentEvent,
              participant: {
                ...currentEvent.participant,
                isRegistered: false,
              },
            }
          : currentEvent,
      );

      setSuccessMessage("Inscrição cancelada com sucesso.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsRegistering(false);
    }
  }

  function confirmUnregister() {
    Alert.alert(
      "Cancelar inscrição",
      "Tem certeza que deseja cancelar sua inscrição neste evento?",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar inscrição",
          style: "destructive",
          onPress: () => {
            void handleUnregister();
          },
        },
      ],
    );
  }

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
              Carregando evento...
            </AccessibleText>
          </View>
        ) : null}

        {!isLoading && errorMessage && !event ? (
          <StateCard
            title="Não foi possível carregar"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={() => void loadEvent()}
          />
        ) : null}

        {!isLoading && event ? (
          <View>
            <View className="overflow-hidden rounded-3xl bg-white dark:bg-zinc-900">
              <View className="h-52 bg-[#E8EEF6] dark:bg-zinc-800">
                {event.coverUrl ? (
                  <Image
                    source={{ uri: event.coverUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center">
                    <Ionicons name="calendar-outline" size={52} color={isDarkMode ? "#BFDBFE" : "#2F3B69"} />
                  </View>
                )}
              </View>

              <View className="p-5">
                <View className="flex-row flex-wrap gap-2">
                  <Badge label="Evento" />
                  <Badge label={event.priceLabel} variant={event.isFree ? "success" : "warning"} />
                  {event.participant.isRegistered ? <Badge label="Já inscrito" variant="info" /> : null}
                </View>

                <AccessibleText className="mt-4 text-3xl font-atkinson-bold text-zinc-900 dark:text-white">
                  {event.title}
                </AccessibleText>

                {event.company ? (
                  <AccessibleText className="mt-2 text-base font-atkinson text-zinc-500 dark:text-zinc-400">
                    Publicado por {event.company.name}
                  </AccessibleText>
                ) : null}

                <View className="mt-5 flex-row flex-wrap gap-2">
                  <InfoPill icon="laptop-outline" text={event.modality} />
                  <InfoPill icon="calendar-outline" text={event.startsAtLabel} />
                  {event.endsAtLabel ? <InfoPill icon="flag-outline" text={event.endsAtLabel} /> : null}
                  {event.location ? <InfoPill icon="location-outline" text={event.location} /> : null}
                </View>
              </View>
            </View>

            {errorMessage ? <FeedbackMessage type="error" message={errorMessage} /> : null}
            {successMessage ? <FeedbackMessage type="success" message={successMessage} /> : null}

            <Section title="Descrição">
              <AccessibleText className="text-base leading-6 font-atkinson text-zinc-700 dark:text-zinc-200">
                {event.description}
              </AccessibleText>
            </Section>

            <Section title="Categoria">
              {event.category ? (
                <View>
                  <AccessibleText className="text-base font-atkinson-bold text-zinc-900 dark:text-white">
                    {event.category.name}
                  </AccessibleText>
                  {event.category.description ? (
                    <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                      {event.category.description}
                    </AccessibleText>
                  ) : null}
                </View>
              ) : (
                <EmptyText text="Categoria não informada." />
              )}
            </Section>

            <Section title="Trilhas relacionadas">
              {event.careerTracks.length ? (
                <TagList items={event.careerTracks.map((track) => track.name)} />
              ) : (
                <EmptyText text="Nenhuma trilha vinculada a este evento." />
              )}
            </Section>

            {!event.isFree ? (
              <AccessibleText className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-center text-sm font-atkinson-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Este evento é pago. O checkout será tratado em uma issue separada.
              </AccessibleText>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isRegistering || (!event.isFree && !event.participant.isRegistered)}
              className={`mt-6 rounded-2xl py-4 ${
                event.participant.isRegistered
                  ? "border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40"
                  : isRegistering || !event.isFree
                    ? "bg-zinc-400"
                    : "bg-[#2F3B69]"
              }`}
              onPress={event.participant.isRegistered ? confirmUnregister : handleRegister}
            >
              <AccessibleText
                className={`text-center text-base font-atkinson-bold ${
                  event.participant.isRegistered
                    ? "text-red-700 dark:text-red-300"
                    : "text-white"
                }`}
              >
                {event.participant.isRegistered
                  ? isRegistering
                    ? "Cancelando..."
                    : "Cancelar inscrição"
                  : !event.isFree
                    ? "Checkout em breve"
                    : isRegistering
                      ? "Inscrevendo..."
                      : "Inscrever-se gratuitamente"}
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
