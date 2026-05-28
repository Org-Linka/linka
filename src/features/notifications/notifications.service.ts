import type { RealtimeChannel } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/shared/lib/supabase";

import type { AppNotification } from "./notifications.types";

type DbNotification = {
  id: string;
  recipient_id: string;
  type: string;
  title: string | null;
  message: string;
  data: unknown;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mapNotification(row: DbNotification): AppNotification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    type: row.type,
    title: row.title,
    message: row.message,
    data: isRecord(row.data) ? row.data : {},
    readAt: row.read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isRead: Boolean(row.read_at),
  };
}

export async function listNotifications(
  recipientId: string,
): Promise<AppNotification[]> {
  const { data, error } = await getSupabaseClient()
    .from("notifications")
    .select(
      "id, recipient_id, type, title, message, data, read_at, created_at, updated_at",
    )
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DbNotification[]).map(mapNotification);
}

export async function countUnreadNotifications(recipientId: string): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await getSupabaseClient()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead(recipientId: string) {
  const { error } = await getSupabaseClient()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", recipientId)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToUserNotifications(
  recipientId: string,
  onChange: () => void,
): RealtimeChannel {
  const channelId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return getSupabaseClient()
    .channel(`notifications:${recipientId}:${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        filter: `recipient_id=eq.${recipientId}`,
        schema: "public",
        table: "notifications",
      },
      () => onChange(),
    )
    .subscribe();
}

export function removeNotificationsSubscription(channel: RealtimeChannel) {
  void getSupabaseClient().removeChannel(channel);
}
