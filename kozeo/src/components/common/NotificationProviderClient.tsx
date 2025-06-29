"use client";
import React, { useState, useEffect, useRef } from "react";
import { NotificationProvider } from "./NotificationContext";
import { io, Socket } from "socket.io-client";
import { WEBSOCKET_URL } from "@/config";

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

const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Gig Completed",
    message: "Your gig with john_doe has been completed successfully.",
    timestamp: "2 hours ago",
    read: false,
    username: "john_doe",
    action: "view_results",
    actionLabel: "View Results",
  },
  {
    id: "2",
    type: "info",
    title: "New Collaboration Request",
    message: "jane_smith wants to collaborate on your project.",
    timestamp: "5 hours ago",
    read: false,
    username: "jane_smith",
    action: "view_request",
    actionLabel: "View Request",
  },
  {
    id: "3",
    type: "warning",
    title: "Payment Pending",
    message: "Payment from alex_wilson is pending verification.",
    timestamp: "1 day ago",
    read: true,
    username: "alex_wilson",
    action: "check_status",
    actionLabel: "Check Status",
  },
];

export default function NotificationProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("NotificationProviderClient mounted");
  console.log("WEBSOCKET_URL", WEBSOCKET_URL);
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    console.log("Attempting to connect to WebSocket at:", WEBSOCKET_URL);
    const socket = io(WEBSOCKET_URL, {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 10000,
      forceNew: true,
      withCredentials: false,
      query: {
        roomId: "notifications",
        userId: "default",
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected!", socket.id);
      socket.emit("join-notification-room", "default");
      socket.emit("get-notifications", "default");
    });
    socket.on("new-notification", (notification) => {
      console.log("Received new-notification event:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });
    socket.on("notification-update", (updatedNotification) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === updatedNotification.id ? updatedNotification : notif
        )
      );
    });
    socket.on("notifications-response", (serverNotifications) => {
      if (serverNotifications && serverNotifications.length > 0) {
        setNotifications(serverNotifications);
      }
    });
    socket.on("notifications-bulk-update", (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Mark as read helpers for NotificationBox
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("mark-notification-read", {
        notificationId: id,
        userId: "default",
      });
    }
  };
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("mark-all-notifications-read", {
        userId: "default",
      });
    }
  };

  return (
    <NotificationProvider
      value={{
        unreadCount,
        setUnreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationProvider>
  );
}
