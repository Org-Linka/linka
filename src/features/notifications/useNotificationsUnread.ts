import { useCallback, useEffect, useState } from "react";

import {
  countUnreadNotifications,
  removeNotificationsSubscription,
  subscribeToUserNotifications,
} from "./notifications.service";

export function useNotificationsUnread(recipientId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadUnreadCount = useCallback(
    async (silent = false) => {
      if (!recipientId) {
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      try {
        if (!silent) {
          setIsLoading(true);
        }

        const count = await countUnreadNotifications(recipientId);
        setUnreadCount(count);
      } catch {
        if (!silent) {
          setUnreadCount(0);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [recipientId],
  );

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!recipientId) return;

    const channel = subscribeToUserNotifications(recipientId, () => {
      void loadUnreadCount(true);
    });

    return () => {
      removeNotificationsSubscription(channel);
    };
  }, [loadUnreadCount, recipientId]);

  return {
    unreadCount,
    hasUnreadNotifications: unreadCount > 0,
    isLoading,
    reloadUnreadCount: loadUnreadCount,
  };
}
