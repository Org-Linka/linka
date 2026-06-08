import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useAuth } from "@/features/auth/auth.context";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";

import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotificationsSubscription,
  subscribeToUserNotifications,
} from "../notifications.service";
import type { AppNotification, NotificationType } from "../notifications.types";

type LoadOptions = {
  silent?: boolean;
  refreshing?: boolean;
};

const notificationTypeLabels: Record<string, string> = {
  course: "Curso",
  event: "Evento",
  project: "Projeto",
  system: "Sistema",
  test: "Teste",
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [markingNotificationIds, setMarkingNotificationIds] = useState(
    () => new Set<string>(),
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const loadUserNotifications = useCallback(
    async ({ silent = false, refreshing = false }: LoadOptions = {}) => {
      if (!user?.id) return;

      try {
        if (refreshing) {
          setIsRefreshing(true);
        } else if (!silent) {
          setIsLoading(true);
        }

        setErrorMessage(null);
        const data = await listNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as notificações.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (!user?.id) return;

    void loadUserNotifications();
  }, [loadUserNotifications, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToUserNotifications(user.id, () => {
      void loadUserNotifications({ silent: true });
    });

    return () => {
      removeNotificationsSubscription(channel);
    };
  }, [loadUserNotifications, user?.id]);

  async function handleRefresh() {
    await loadUserNotifications({ refreshing: true });
  }

  async function handleMarkAsRead(notification: AppNotification) {
    if (notification.isRead || markingNotificationIds.has(notification.id)) return;

    setMarkingNotificationIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(notification.id);
      return nextIds;
    });

    try {
      const readAt = new Date().toISOString();
      await markNotificationAsRead(notification.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? {
                ...currentNotification,
                isRead: true,
                readAt,
                updatedAt: readAt,
              }
            : currentNotification,
        ),
      );
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setMarkingNotificationIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(notification.id);
        return nextIds;
      });
    }
  }

  async function handleMarkAllAsRead() {
    if (!user?.id || unreadCount === 0 || isMarkingAll) return;

    try {
      setIsMarkingAll(true);
      const readAt = new Date().toISOString();
      await markAllNotificationsAsRead(user.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.isRead
            ? notification
            : {
                ...notification,
                isRead: true,
                readAt,
                updatedAt: readAt,
              },
        ),
      );
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setIsMarkingAll(false);
    }
  }

  if (isAuthLoading || (isLoading && !errorMessage)) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#002B5B" />
          <AccessibleText className="mt-3 font-atkinson text-zinc-500 dark:text-zinc-400">
            Carregando notificações...
          </AccessibleText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <AppTopBar title="Notificações" showBackButton />

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          extraData={markingNotificationIds}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#002B5B"
            />
          }
          ListHeaderComponent={
            <NotificationsHeader
              totalCount={notifications.length}
              unreadCount={unreadCount}
              isMarkingAll={isMarkingAll}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          }
          ListEmptyComponent={
            <NotificationsEmptyState
              errorMessage={errorMessage}
              onRetry={() => void loadUserNotifications()}
            />
          }
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              isMarking={markingNotificationIds.has(item.id)}
              onMarkAsRead={() => void handleMarkAsRead(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

type NotificationsHeaderProps = {
  totalCount: number;
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllAsRead: () => void | Promise<void>;
};

function NotificationsHeader({
  totalCount,
  unreadCount,
  isMarkingAll,
  onMarkAllAsRead,
}: NotificationsHeaderProps) {
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <>
      <View className="bg-[#002B5B] px-5 pb-8 pt-2">
        <AccessibleText className="text-3xl font-bold text-white font-atkinson-bold">
          Central de notificações
        </AccessibleText>
        <AccessibleText className="mt-2 text-base text-[#DDE6F2] font-atkinson">
          {unreadCount === 0
            ? `${totalCount} notificações`
            : `${unreadCount} não lida${unreadCount === 1 ? "" : "s"}`}
        </AccessibleText>
      </View>

      <View className="-mt-5 px-5 pb-2">
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!hasUnreadNotifications || isMarkingAll}
          onPress={onMarkAllAsRead}
          className={`flex-row items-center justify-center rounded-lg border px-4 py-3 ${
            hasUnreadNotifications
              ? "border-blue-200 bg-blue-50"
              : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          <Ionicons
            name={isMarkingAll ? "sync-outline" : "checkmark-done-outline"}
            size={18}
            color={hasUnreadNotifications ? "#1D4ED8" : "#71717A"}
          />
          <AccessibleText
            className={`ml-2 text-sm font-bold ${
              hasUnreadNotifications ? "text-blue-700" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {isMarkingAll ? "Atualizando..." : "Marcar todas como lidas"}
          </AccessibleText>
        </TouchableOpacity>
      </View>
    </>
  );
}

type NotificationCardProps = {
  notification: AppNotification;
  isMarking: boolean;
  onMarkAsRead: () => void | Promise<void>;
};

function NotificationCard({
  notification,
  isMarking,
  onMarkAsRead,
}: NotificationCardProps) {
  const iconName = getNotificationIcon(notification.type);
  const typeLabel = getNotificationTypeLabel(notification.type);
  const dateLabel = formatNotificationDate(notification.createdAt);
  const isUnread = !notification.isRead;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onMarkAsRead}
      className={`mx-5 mt-2 rounded-2xl border px-3 py-3 ${
        isUnread ? "border-blue-100 bg-[#f7fbff]" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${
            isUnread ? "bg-blue-100" : "bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          <Ionicons
            name={iconName}
            size={18}
            color={isUnread ? "#1D4ED8" : "#52525B"}
          />
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between gap-3">
            <AccessibleText className="flex-1 text-sm font-bold text-[#002B5B] dark:text-blue-100 font-atkinson-bold">
              {notification.title ?? typeLabel}
            </AccessibleText>
            {isUnread ? (
              <View className="h-2.5 w-2.5 rounded-full bg-[#1D4ED8]" />
            ) : null}
          </View>

          {notification.title ? (
            <AccessibleText className="mt-0.5 text-xs font-semibold text-[#1D4ED8]">
              {typeLabel}
            </AccessibleText>
          ) : null}

          <AccessibleText
            className="mt-1 text-sm leading-5 text-zinc-700 dark:text-zinc-200 font-atkinson"
            numberOfLines={2}
          >
            {notification.message}
          </AccessibleText>

          <View className="mt-2 flex-row items-center justify-between gap-3">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={13} color="#71717A" />
              <AccessibleText className="ml-1 text-xs text-zinc-500 dark:text-zinc-400 font-atkinson">
                {dateLabel}
              </AccessibleText>
            </View>

            {isUnread ? (
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={isMarking}
                onPress={onMarkAsRead}
                className="flex-row items-center rounded-full border border-[#002B5B]/20 bg-white dark:bg-zinc-900 px-2.5 py-1.5"
              >
                <Ionicons
                  name={isMarking ? "sync-outline" : "checkmark-outline"}
                  size={12}
                  color="#002B5B"
                />
                <AccessibleText className="ml-1 text-xs font-bold text-[#002B5B] dark:text-blue-100">
                  {isMarking ? "Salvando" : "Marcar lida"}
                </AccessibleText>
              </TouchableOpacity>
            ) : (
              <AccessibleText className="text-xs font-semibold text-zinc-400">Lida</AccessibleText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

type NotificationsEmptyStateProps = {
  errorMessage: string | null;
  onRetry: () => void;
};

function NotificationsEmptyState({
  errorMessage,
  onRetry,
}: NotificationsEmptyStateProps) {
  if (errorMessage) {
    return (
      <View className="mx-5 mt-8 items-center rounded-lg border border-red-100 bg-red-50 p-6">
        <Ionicons name="warning-outline" size={34} color="#B91C1C" />
        <AccessibleText className="mt-3 text-center text-base font-bold text-red-700">
          Não foi possível carregar
        </AccessibleText>
        <AccessibleText className="mt-2 text-center text-sm leading-5 text-red-700">
          {errorMessage}
        </AccessibleText>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2"
        >
          <AccessibleText className="text-sm font-bold text-white">Tentar novamente</AccessibleText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mx-5 mt-8 items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
      <Ionicons name="notifications-off-outline" size={34} color="#71717A" />
      <AccessibleText className="mt-3 text-center text-base font-bold text-[#002B5B] dark:text-blue-100">
        Nenhuma notificação
      </AccessibleText>
      <AccessibleText className="mt-2 text-center text-sm leading-5 text-zinc-500 dark:text-zinc-400">
        Quando houver novidades para você, elas aparecerão aqui.
      </AccessibleText>
    </View>
  );
}

function getNotificationTypeLabel(type: NotificationType) {
  return notificationTypeLabels[type] ?? type;
}

function getNotificationIcon(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "course":
      return "school-outline";
    case "event":
      return "calendar-outline";
    case "project":
      return "briefcase-outline";
    case "test":
      return "notifications-outline";
    default:
      return "information-circle-outline";
  }
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível atualizar a notificação.";
}
