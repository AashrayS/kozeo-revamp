"use client";

import {
  FiUser,
  FiShoppingBag,
  FiBriefcase,
  FiMessageSquare,
  FiHome,
  FiSettings,
  FiFileText,
} from "react-icons/fi";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { useNavigationLoader } from "./useNavigationLoader";
import { useUser } from "../../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function BottomNavBar() {
  const { navigateWithLoader } = useNavigationLoader();
  const { user, username, isAuthenticated } = useUser();
  const { theme } = useTheme();
  const pathname = usePathname();

  // Scroll state for hide/show functionality
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get username from Redux user state or fallback to a default
  const profileUsername = username || "profile";

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only update if scroll difference is significant (reduce sensitivity)
      if (scrollDifference > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past 100px - hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up or at top - show navbar
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const tabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Home", icon: FiHome, path: "/Atrium" },
    { name: "Profile", icon: FiUser, path: `/profile/${profileUsername}` },
    { name: "Projects", icon: FiBriefcase, path: "/gigs" },
    { name: "Resume", icon: FiFileText, path: "/resumeBuilder" },
    { name: "Store", icon: FiShoppingBag, path: "/store" },
    {
      name: "Discussion",
      icon: FiMessageSquare,
      path: "/Atrium/discussion",
    },
  ];

  // Admin-specific tabs
  const adminTabs: { name: string; icon: IconType; path: string }[] = [
    {
      name: "Admin",
      icon: FiSettings,
      path: "/admin/settings",
    },
  ];

  // Combine tabs based on user role - show all tabs
  const allTabs =
    user?.role === "admin"
      ? [...tabs, ...adminTabs] // Show all regular tabs + admin tab
      : tabs;

  const handleNavigation = (path: string) => {
    // Check if user is already on the target page
    if (pathname === path) {
      return; // Don't navigate if already on the same page
    }

    // Always trigger loader immediately for any navigation
    navigateWithLoader(path);
  };

  // Helper function to check if a path is currently active
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <div
      className={`sm:hidden fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <nav
        className={`flex items-center px-2 py-2 border-t backdrop-blur-md overflow-x-auto scrollbar-hide ${
          theme === "light"
            ? "bg-white/95 text-gray-900 border-gray-200"
            : "bg-neutral-900/95 text-white border-neutral-700"
        }`}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {allTabs.map(({ name, icon: Icon, path }) => {
          const isActive = isActivePath(path);

          return (
            <button
              key={name}
              onClick={() => handleNavigation(path)}
              disabled={isActive}
              className={`flex flex-col items-center justify-center px-3 py-2 min-w-[60px] whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? theme === "light"
                    ? "text-blue-600 cursor-default"
                    : "text-blue-400 cursor-default"
                  : theme === "light"
                  ? "text-gray-600 hover:text-gray-900 cursor-pointer"
                  : "text-gray-400 hover:text-white cursor-pointer"
              }`}
            >
              <Icon
                className={`text-xl mb-1 ${
                  isActive ? "opacity-100" : "opacity-80"
                }`}
              />
              <span
                className={`text-xs leading-tight text-center ${
                  isActive ? "font-medium" : "font-normal"
                }`}
              >
                {name}
              </span>
              {isActive && (
                <div
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    theme === "light" ? "bg-blue-600" : "bg-blue-400"
                  }`}
                ></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
