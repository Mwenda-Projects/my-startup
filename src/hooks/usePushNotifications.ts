import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: null,
    isSubscribed: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : null,
      isSubscribed: isSupported && Notification.permission === "granted",
    }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn("Push notifications are not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        permission,
        isSubscribed: permission === "granted",
      }));
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported]);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (!state.isSubscribed) {
        console.warn("Notifications not enabled");
        return;
      }

      try {
        // Check if service worker is available
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            icon: "/android-chrome-192x192.png",
            badge: "/favicon.png",
            ...options,
          });
        } else {
          // Fallback to regular notification
          new Notification(title, {
            icon: "/android-chrome-192x192.png",
            ...options,
          });
        }
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [state.isSubscribed]
  );

  return {
    ...state,
    requestPermission,
    showNotification,
  };
};

// Hook to subscribe to real-time notifications
export const useNotificationSubscription = (userId: string | undefined) => {
  const { showNotification, isSubscribed } = usePushNotifications();

  useEffect(() => {
    if (!userId || !isSubscribed) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          showNotification("New Message", {
            body: payload.new.content?.slice(0, 100) || "You have a new message",
            tag: `message_${payload.new.id}`,
            data: { url: "/messages" },
          });
        }
      )
      .subscribe();

    // Subscribe to transaction updates (orders)
    const transactionsChannel = supabase
      .channel(`transactions_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `seller_id=eq.${userId}`,
        },
        (payload) => {
          showNotification("New Order!", {
            body: `New order for ${payload.new.listing_title}`,
            tag: `order_${payload.new.id}`,
            data: { url: "/dashboard" },
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `buyer_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.status !== payload.old?.status) {
            showNotification("Order Update", {
              body: `Your order status changed to: ${payload.new.status}`,
              tag: `order_update_${payload.new.id}`,
              data: { url: "/dashboard" },
            });
          }
        }
      )
      .subscribe();

    // Subscribe to notifications table
    const notificationsChannel = supabase
      .channel(`notifications_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          showNotification(payload.new.title, {
            body: payload.new.message,
            tag: `notification_${payload.new.id}`,
            data: { url: payload.new.link || "/" },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [userId, isSubscribed, showNotification]);
};

export default usePushNotifications;
