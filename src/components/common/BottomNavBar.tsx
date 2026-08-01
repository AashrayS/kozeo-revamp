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
      className={`sm:hidden fixed bottom-3 left-3 right-3 z-[9999] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <nav
        className={`flex items-center justify-around px-3 py-2 border rounded-full backdrop-blur-xl shadow-lg overflow-x-auto scrollbar-hide ${
          theme === "light"
            ? "bg-white/80 text-black border-black/10"
            : "bg-black/80 text-white border-white/10"
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
              className={`relative flex flex-col items-center justify-center px-3 py-1.5 min-w-[55px] whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "text-black dark:text-white font-semibold scale-105"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon
                className={`text-lg mb-0.5 ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              />
              <span
                className={`text-[11px] leading-tight text-center ${
                  isActive ? "font-semibold" : "font-normal"
                }`}
              >
                {name}
              </span>
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-black dark:bg-white"
                ></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
