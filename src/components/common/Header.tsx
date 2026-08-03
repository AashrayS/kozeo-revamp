"use client";

import { useState } from "react";
import { FiLogOut, FiBell, FiSun, FiMoon } from "react-icons/fi";
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
  const { theme, toggleTheme } = useTheme();
  const logout = useLogout();

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 sm:h-20 backdrop-blur-2xl bg-container-1/90 border-b border-container-3 shadow-xs transition-all duration-300">
        <div className="w-full h-full px-6 md:px-10 lg:px-16 flex justify-between items-center">
          <Link href="/Atrium" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/kozeoLogo.png"
              alt="Kozeo"
              width={32}
              height={32}
              className="rounded-full shadow-xs"
            />
            <span className="font-extrabold text-base tracking-tight text-text-1">
              Kozeo
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-container-2 border border-container-3 hover:bg-state-hover transition-colors text-text-3 hover:text-text-1 shadow-xs"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FiMoon className="text-lg" /> : <FiSun className="text-lg" />}
            </button>

            {/* Notification Button */}
            <button
              onClick={toggleNotifications}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-container-2 border border-container-3 hover:bg-state-hover transition-colors text-text-3 hover:text-text-1 shadow-xs"
            >
              <FiBell className="text-lg text-text-1" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-3.5 w-2 h-2 bg-emerald-500 rounded-full shadow-xs" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-container-2 border border-container-3 hover:bg-state-hover transition-colors text-text-3 hover:text-text-1 shadow-xs"
            >
              <FiLogOut className="text-lg text-text-1" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-wider">Logout</span>
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
