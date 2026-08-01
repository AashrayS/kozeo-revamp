"use client";

import {
  FiUser,
  FiShoppingBag,
  FiBriefcase,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiSun,
  FiMoon,
  FiDollarSign,
  FiSettings,
  FiFileText,
} from "react-icons/fi";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { useNavigationLoader } from "./useNavigationLoader";
import { useUser } from "../../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import BottomNavBar from "./BottomNavBar";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const { navigateWithLoader, startLoading } = useNavigationLoader();
  const { user, username, isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Debug logging
  console.log("Sidebar - User state:", { user, username, isAuthenticated });

  // Get username from Redux user state or fallback to a default
  const profileUsername = username || "profile";

  const tabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Home", icon: FiHome, path: "/Atrium" },
    { name: "Profile", icon: FiUser, path: `/profile/${profileUsername}` },
    { name: "Store", icon: FiShoppingBag, path: "/store" },
    { name: "My Projects", icon: FiBriefcase, path: "/gigs" }, // Update to go to gig list
    { name: "Resume Builder", icon: FiFileText, path: "/resumeBuilder" },
    {
      name: "Discussion Rooms",
      icon: FiMessageSquare,
      path: "/Atrium/discussion",
    },
  ];

  // Admin-specific tabs
  const adminTabs: { name: string; icon: IconType; path: string }[] = [
    {
      name: "Admin Settings",
      icon: FiSettings,
      path: "/admin/settings",
    },
  ];

  // Combine tabs based on user role
  const allTabs = user?.role === "admin" ? [...tabs, ...adminTabs] : tabs;

  const handleNavigation = (path: string) => {
    // Check if user is already on the target page
    if (pathname === path) {
      return; // Don't navigate if already on the same page
    }

    // Always trigger loader immediately for any navigation
    // debugger;
    navigateWithLoader(path);
  };

  // Helper function to check if a path is currently active
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <div className="sticky top-0 h-screen z-[9999] hidden sm:block">
        <aside
          className={`sticky top-0 h-screen border-r transition-all duration-300 z-[9999] flex flex-col justify-between backdrop-blur-xl ${
            collapsed ? "w-20" : "w-64"
          } ${
            theme === "light"
              ? "bg-white/70 text-black border-black/5"
              : "bg-black/70 text-white border-white/10"
          }`}
        >
          <div className="flex flex-col p-4 space-y-6">
            <nav className="space-y-3">
              {allTabs.map(({ name, icon: Icon, path }) => {
                const isActive = isActivePath(path);

                return (
                  <div key={name} className="relative group">
                    <button
                      onClick={() => handleNavigation(path)}
                      disabled={isActive}
                      className={`flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
                        collapsed ? "justify-center" : "gap-3"
                      } ${
                        isActive
                          ? "bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold cursor-default shadow-xs"
                          : "hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`text-xl shrink-0 ${
                          isActive ? "opacity-100 scale-110" : "opacity-75"
                        } transition-transform duration-300`}
                      />
                      {!collapsed && (
                        <span
                          className={`text-sm tracking-tight ${
                            isActive ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {name}
                        </span>
                      )}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black dark:bg-white shadow-xs" />
                      )}
                    </button>
                    {/* Tooltip for collapsed view */}
                    {collapsed && (
                      <div
                        className="absolute left-full ml-3 px-3 py-1 text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2 kozeo-glass shadow-md text-black dark:text-white"
                      >
                        {name}
                        {isActive && " (Current)"}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Collapse Button - hidden on mobile devices */}
            <div className="relative group hidden sm:block">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
                  collapsed ? "justify-center" : "gap-3"
                } hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white`}
              >
                {collapsed ? (
                  <FiChevronRight className="text-xl shrink-0" />
                ) : (
                  <>
                    <FiChevronLeft className="text-xl shrink-0" />
                    <span className="text-sm font-medium">Collapse</span>
                  </>
                )}
              </button>
              {/* Tooltip for collapsed view */}
              {collapsed && (
                <div
                  className="absolute left-full ml-3 px-3 py-1 text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2 kozeo-glass shadow-md text-black dark:text-white"
                >
                  Expand Sidebar
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />
    </>
  );
}
