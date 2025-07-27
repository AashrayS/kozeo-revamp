"use client";
import React, { useState, useEffect, useRef } from "react";
import { NotificationProvider } from "./NotificationContext";
import { io, Socket } from "socket.io-client";
import { WEBSOCKET_URL } from "@/config";
import { useUser } from "../../../store/hooks";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../utilities/kozeoApi";
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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const { username, user } = useUser();

  // Add debugging for user context
  console.log("Current user context:", { user: user?.id, username });

  // Loading state for notifications
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch notifications from backend using kozeoApi.js
  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log("No user ID available, skipping notification fetch");
      return;
    }

    // Check if auth token exists
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("kozeo_auth_token")
        : null;
    console.log("Auth token exists:", !!token);

    console.log("Fetching notifications for user:", user.id);
    setNotificationsLoading(true);

    try {
      const notifications = await getUserNotifications(user.id);
      console.log("Successfully fetched notifications:", notifications);

      setNotifications(
        notifications.map((notif: any) => ({
          id: notif.id,
          type: mapNotificationType(notif.type),
          content: notif.content,
          createdAt: notif.createdAt,
          read: notif.read,
          action: notif.action,
          sender: notif.sender,
          title: notif.content?.split(".")[0] || "Notification",
          message: notif.content,
          timestamp: formatTimestamp(notif.createdAt),
          username: notif.sender?.username,
        }))
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
      console.log("Falling back to sample notifications");
      setNotifications(sampleNotifications);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Utility functions
  const mapNotificationType = (apiType: string): Notification["type"] => {
    const typeMapping: Record<string, Notification["type"]> = {
      // Existing API types
      gig_request: "info",
      gig_accepted: "success",
      gig_rejected: "warning",
      gig_completed: "success",
      payment_received: "success",
      payment_sent: "info",
      system_announcement: "info",
      review_received: "success",
      achievement_earned: "success",

      // WebSocket server template types
      // Request Update types
      collaboration_request: "info",
      collaboration_accepted: "success",
      collaboration_declined: "warning",
      profile_view: "info",

      // Gig Update types
      gig_started: "success",
      gig_cancelled: "warning",
      gig_reminder: "info",
      milestone_reached: "success",
      gig_request_accepted: "success",
      gig_request_rejected: "warning",

      // Payment Status types
      payment_pending: "warning",
      payment_failed: "error",
      payment_refunded: "info",
      payout_processed: "success",

      // Direct type mappings
      info: "info",
      success: "success",
      warning: "warning",
      error: "error",
    };
    return typeMapping[apiType] || "info";
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now";

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // Fetch notifications when user is available
  useEffect(() => {
    console.log(
      "useEffect triggered for fetchNotifications, user?.id:",
      user?.id
    );

    if (user?.id) {
      fetchNotifications();
    } else {
      console.log("No user ID available yet, waiting...");
    }
  }, [user?.id]); // Only depend on user.id

  // Add a manual trigger for debugging
  useEffect(() => {
    // Add a small delay to ensure user context is fully loaded
    const timer = setTimeout(() => {
      if (user?.id && notifications.length === 0 && !notificationsLoading) {
        console.log("Backup fetch triggered - no notifications loaded yet");
        fetchNotifications();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user?.id, notifications.length, notificationsLoading]);

  useEffect(() => {
    // Don't connect if no username is available
    if (!username) {
      console.log("No username available, skipping WebSocket connection");
      return;
    }

    console.log("Attempting to connect to WebSocket at:", WEBSOCKET_URL);
    console.log("Using username:", username);
    const socket = io(WEBSOCKET_URL, {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 10000,
      forceNew: true,
      withCredentials: false,
      query: {
        roomId: "notifications",
        userId: username,
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected!", socket.id);
      socket.emit("join-notification-room", username);
      // Don't auto-request notifications via WebSocket since we fetch via API
      // socket.emit("get-notifications", username);
    });
    socket.on("new-notification", (notification) => {
      console.log("Received new-notification event:", notification);
      // Format the new notification to match our interface
      const formattedNotification = {
        id: notification.id,
        type: mapNotificationType(notification.type || "info"),
        content: notification.message || notification.content,
        createdAt: notification.timestamp,
        read: false,
        action: notification.action,
        actionLabel: notification.actionLabel,
        sender: notification.sender,
        title:
          notification.title ||
          notification.content?.split(".")[0] ||
          "New Notification",
        message: notification.message || notification.content,
        timestamp: "Just now",
        username: notification.username || notification.sender?.username,
      };
      setNotifications((prev) => [formattedNotification, ...prev]);
    });
    socket.on("notification-update", (updatedNotification) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === updatedNotification.id
            ? {
                ...notif,
                read: updatedNotification.read,
                // Update other fields as needed
              }
            : notif
        )
      );
    });
    socket.on("notifications-response", (serverNotifications) => {
      console.log(
        "Received notifications-response, but using API fetch instead"
      );
      // Don't overwrite API-fetched notifications with WebSocket response
      // The API fetch is the primary source of truth for initial load
    });
    socket.on("notifications-bulk-update", (updatedNotifications) => {
      const formattedNotifications = updatedNotifications.map((notif: any) => ({
        id: notif.id,
        type: mapNotificationType(notif.type),
        content: notif.message || notif.content,
        createdAt: notif.timestamp || notif.createdAt,
        read: notif.read,
        action: notif.action,
        actionLabel: notif.actionLabel,
        sender: notif.sender,
        title:
          notif.title ||
          (notif.message || notif.content)?.split(".")[0] ||
          "Notification",
        message: notif.message || notif.content,
        timestamp: formatTimestamp(notif.timestamp || notif.createdAt),
        username: notif.username || notif.sender?.username,
      }));
      setNotifications(formattedNotifications);
    });

    // Handle specific WebSocket events from the server

    // Handle gig request notifications (when someone requests to join a gig)
    socket.on("gig-request", (data) => {
      console.log("Received gig-request:", data);
      const notification: Notification = {
        id: `gig-request-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "info",
        title: "New Gig Request",
        message: data.message || `${data.requesterName} wants to join your gig`,
        timestamp: "Just now",
        read: false,
        username: data.requesterName,
        action: "view_request",
        actionLabel: "View Request",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle gig request responses (accept/reject notifications)
    socket.on("gig-request-response", (data) => {
      console.log("Received gig-request-response:", data);
      const isAccepted = data.response === "accepted";
      const notification: Notification = {
        id: `gig-response-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: isAccepted ? "success" : "warning",
        title: isAccepted ? "Gig Request Accepted! 🎉" : "Gig Request Declined",
        message: isAccepted
          ? `Great news! ${data.hostUsername} has accepted your request to join their gig. You can now access the gig workspace.`
          : `${data.hostUsername} has declined your request to join their gig. Don't worry, there are plenty of other opportunities in the Atrium!`,
        timestamp: "Just now",
        read: false,
        username: data.hostUsername,
        action: isAccepted ? "view_gig" : "view_atrium",
        actionLabel: isAccepted ? "Go to Gig" : "Browse More Gigs",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle gig request cancellations
    socket.on("gig-request-cancel", (data) => {
      console.log("Received gig-request-cancel:", data);
      const notification: Notification = {
        id: `gig-cancel-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "warning",
        title: "Gig Request Cancelled",
        message: `${data.requesterName} has cancelled their request to join your gig`,
        timestamp: "Just now",
        read: false,
        username: data.requesterName,
        action: "view_gig",
        actionLabel: "View Gig",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle payment requests
    socket.on("payment-request", (data) => {
      console.log("Received payment-request:", data);
      const notification: Notification = {
        id: `payment-request-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "info",
        title: "Payment Request",
        message: `You have received a payment request for your gig`,
        timestamp: "Just now",
        read: false,
        action: "view_payment",
        actionLabel: "View Payment",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle payment responses
    socket.on("payment-response", (data) => {
      console.log("Received payment-response:", data);
      const isAccepted = data.status === "accepted";
      const notification: Notification = {
        id: `payment-response-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: isAccepted ? "success" : "warning",
        title: isAccepted ? "Payment Accepted" : "Payment Declined",
        message: isAccepted
          ? "Your payment request has been accepted"
          : "Your payment request has been declined",
        timestamp: "Just now",
        read: false,
        action: "view_transaction",
        actionLabel: "View Transaction",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle gig ended notifications
    socket.on("gig-ended", (data) => {
      console.log("Received gig-ended:", data);
      const notification: Notification = {
        id: `gig-ended-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "info",
        title: "Gig Ended",
        message: "The gig has been ended by the host",
        timestamp: "Just now",
        read: false,
        action: "view_results",
        actionLabel: "View Results",
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle user joining/leaving discussion rooms (optional notifications)
    socket.on("user-joined-discussion", (data) => {
      console.log("User joined discussion:", data);
      // You can add notification logic here if needed
    });

    socket.on("user-left-discussion", (data) => {
      console.log("User left discussion:", data);
      // You can add notification logic here if needed
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [username]);

  // Mark as read helpers for NotificationBox
  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    try {
      await markNotificationAsRead(user.id, id);
      // Also emit via WebSocket if connected
      if (socketRef.current && socketRef.current.connected && username) {
        socketRef.current.emit("mark-notification-read", {
          notificationId: id,
          userId: username,
        });
      }
    } catch (err) {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: false } : notif
        )
      );
    }
  };
  // Mark all notifications as read for the current user (individually)
  const markAllAsRead = async () => {
    if (!user?.id) return;
    // Optimistically update UI
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    try {
      // Mark each notification as read individually
      for (const notif of notifications) {
        if (!notif.read) {
          await markNotificationAsRead(user.id, notif.id);
        }
      }
      // Notify via WebSocket
      if (socketRef.current && socketRef.current.connected && username) {
        socketRef.current.emit("mark-all-notifications-read", {
          userId: username,
        });
      }
    } catch (err) {
      // On error, refetch notifications to restore correct state
      fetchNotifications();
    }
  };

  // Manual refresh function for debugging
  const refreshNotifications = async () => {
    console.log("Manual refresh triggered");
    await fetchNotifications();
  };

  // Expose refresh function on window for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refreshNotifications = refreshNotifications;
    }
  }, []);

  return (
    <NotificationProvider
      value={{
        unreadCount,
        setUnreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
        loading: notificationsLoading,
        refreshNotifications, // Add this for manual testing
      }}
    >
      {children}
    </NotificationProvider>
  );
}
