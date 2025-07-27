"use client";

import { useState } from "react";
import { FiLogOut, FiBell } from "react-icons/fi";
import { useLogout } from "../../../store/useLogout";
import NotificationBox from "./NotificationBox";
import { useNotificationContext } from "./NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function Header({
  logoText = "YourApp",
}: {
  logoText?: string;
}) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationContext();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { theme } = useTheme();
  const logout = useLogout();

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  return (
    <>
      <header
        className={`w-full px-6 py-4 Z-40 flex justify-between items-center relative theme-transition ${
          theme === "light" ? "bg-white text-gray-900" : "bg-gradient-to-r from-black to-neutral-900 text-white"
        }`}
      >
        <div className="text-2xl font-bold tracking-wide">{logoText}</div>

        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button
            onClick={toggleNotifications}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              theme === "light"
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-neutral-800"
            }`}
          >
            <FiBell className="text-xl" />
            <span className="hidden sm:inline">Notifications</span>
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              theme === "light"
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-neutral-800"
            }`}
          >
            <FiLogOut className="text-xl" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Notification Box */}
      <NotificationBox
        isOpen={isNotificationOpen}
        onClose={closeNotifications}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
      />
    </>
  );
}
