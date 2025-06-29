"use client";

import { useState } from "react";
import { FiLogOut, FiBell } from "react-icons/fi";
import { logout } from "../../../utilities/operation"; // adjust path if needed
import NotificationBox from "./NotificationBox";
import { useNotificationContext } from "./NotificationContext";

export default function Header({
  logoText = "YourApp",
}: {
  logoText?: string;
}) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationContext();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  return (
    <>
      <header className="w-full px-6 py-4 Z-40 bg-[#0e0e0] flex justify-between items-center relative">
        <div className="text-white text-2xl font-bold tracking-wide">
          {logoText}
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-neutral-800 transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 rounded-md text-white hover:bg-neutral-800 transition-colors"
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
