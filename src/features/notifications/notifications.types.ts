export type NotificationType =
  | "system"
  | "project"
  | "course"
  | "event"
  | "test"
  | (string & {});

export type AppNotification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string | null;
  message: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
};
