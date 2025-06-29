import React, { createContext, useContext } from "react";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  username?: string;
  action?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = NotificationContext.Provider;
