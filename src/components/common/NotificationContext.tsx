import React, { createContext, useContext } from "react";

export interface Notification {
  id: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "gig_request"
    | "gig_accepted"
    | "gig_rejected"
    | "gig_completed"
    | "payment_received"
    | "payment_sent"
    | "system_announcement"
    | "review_received"
    | "achievement_earned";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  username?: string;
  action?: string;
  actionLabel?: string;
  content?: string; // For API compatibility
  createdAt?: string; // For API compatibility
  sender?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_Picture?: string;
  };
}

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading?: boolean;
  refreshNotifications?: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  notifications: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  loading: false,
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = NotificationContext.Provider;
