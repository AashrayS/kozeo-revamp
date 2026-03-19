"use client";

import { useState } from "react";
import { FiLogOut, FiBell } from "react-icons/fi";
import { useLogout } from "../../../store/useLogout";
import NotificationBox from "./NotificationBox";
import { useNotificationContext } from "./NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";

import Image from "next/image";
import Link from "next/link";
import kozeoLogo from "/src/assets/kozeoLogo.png";

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
      <header className="premium-header">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image
              src="/kozeoLogo.png"
              alt="Kozeo"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="font-bold text-[15px] tracking-tight text-black dark:text-white">
              Kozeo
            </span>
          </Link>

        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button
            onClick={toggleNotifications}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <FiBell className="text-xl" />
            <span className="hidden sm:inline font-medium text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-black dark:bg-white rounded-full" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            <FiLogOut className="text-xl" />
            <span className="hidden sm:inline font-medium text-sm">Logout</span>
          </button>
        </div>
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
