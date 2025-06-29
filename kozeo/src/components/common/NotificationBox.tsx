"use client";

import {
  FiX,
  FiBell,
  FiCheck,
  FiInfo,
  FiAlertTriangle,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";
import { useNotificationContext } from "./NotificationContext";

interface Notification {
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

interface NotificationBoxProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// Sample notifications with new structure
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

const NotificationBox = ({
  isOpen,
  onClose,
  notifications,
  markAsRead,
  markAllAsRead,
}: NotificationBoxProps) => {
  const { setUnreadCount } = useNotificationContext();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <FiCheck className="text-emerald-400" />;
      case "warning":
        return <FiAlertTriangle className="text-yellow-400" />;
      case "error":
        return <FiX className="text-red-400" />;
      default:
        return <FiInfo className="text-cyan-400" />;
    }
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    // Here you would handle the actual action (navigate, open modal, etc.)
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with lighter blur */}
      <div
        className="fixed inset-0 bg-black opacity-70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Notification Box - Top Left Corner */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm md:max-w-md lg:max-w-lg">
        <div className="bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-xl border border-neutral-700 max-h-[80vh] flex flex-col animate-slideDown">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <FiBell className="text-cyan-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">
                Notifications
              </h2>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="bg-cyan-700 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.filter((n) => !n.read).length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-cyan-600 hover:text-cyan-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiBell className="text-gray-500 text-4xl mb-4" />
                <p className="text-gray-400 text-lg">No notifications</p>
                <p className="text-gray-500 text-sm mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-colors hover:bg-cyan-900 hover:bg-opacity-30 ${
                      notification.read
                        ? "border-gray-600 bg-opacity-20"
                        : "border-cyan-400 bg-cyan-800 bg-opacity-10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`text-sm font-medium ${
                              notification.read ? "text-gray-300" : "text-white"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p
                          className={`text-sm leading-relaxed mb-2 ${
                            notification.read
                              ? "text-gray-400"
                              : "text-gray-200"
                          }`}
                        >
                          {notification.message}
                        </p>

                        {/* Action Button */}
                        {notification.action && notification.actionLabel && (
                          <button
                            onClick={() => handleAction(notification)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                          >
                            {notification.actionLabel}
                            <FiExternalLink className="text-xs" />
                          </button>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FiClock className="text-xs" />
                            <span>{notification.timestamp}</span>
                          </div>
                          {notification.username && (
                            <span className="text-xs text-cyan-400">
                              @{notification.username}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-700 p-4">
            <button className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationBox;
