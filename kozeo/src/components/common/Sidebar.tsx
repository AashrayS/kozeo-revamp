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
} from "react-icons/fi";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { useNavigationLoader } from "./useNavigationLoader";
import { useUser } from "../../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";

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
    <div className="relative z-[9999]">
      <aside
        className={`sticky top-0 h-screen border-r transition-all duration-300 z-[9999] flex flex-col justify-between ${
          collapsed ? "w-20" : "w-64"
        } ${
          theme === "light"
            ? "bg-transaprent text-gray-900 border-gray-200"
            : "bg-transparent text-white border-neutral-700"
        }`}
      >
        <div className="flex flex-col p-4 space-y-6">
          <nav className="space-y-8">
            {allTabs.map(({ name, icon: Icon, path }) => {
              const isActive = isActivePath(path);

              return (
                <div key={name} className="relative group">
                  <button
                    onClick={() => handleNavigation(path)}
                    disabled={isActive}
                    className={`flex items-center w-full px-4 py-2 rounded-md transition-colors ${
                      collapsed ? "justify-center" : "gap-3"
                    } ${
                      isActive
                        ? theme === "light"
                          ? "bg-blue-100 text-blue-600 cursor-default"
                          : "bg-blue-900/50 text-blue-400 cursor-default"
                        : theme === "light"
                        ? "hover:bg-gray-100 cursor-pointer"
                        : "hover:bg-neutral-800 cursor-pointer"
                    }`}
                  >
                    <Icon
                      className={`text-2xl shrink-0 ${
                        isActive ? "opacity-100" : "opacity-80"
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`text-base ${isActive ? "font-medium" : ""}`}
                      >
                        {name}
                      </span>
                    )}
                    {isActive && !collapsed && (
                      <div
                        className={`ml-auto w-2 h-2 rounded-full ${
                          theme === "light" ? "bg-blue-600" : "bg-blue-400"
                        }`}
                      ></div>
                    )}
                  </button>
                  {/* Tooltip for collapsed view */}
                  {collapsed && (
                    <div
                      className={`absolute left-full ml-2 px-2 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2 shadow-lg border ${
                        isActive
                          ? theme === "light"
                            ? "bg-blue-100 text-blue-600 border-blue-200"
                            : "bg-blue-900/50 text-blue-400 border-blue-800"
                          : theme === "light"
                          ? "bg-white text-gray-900 border-gray-200"
                          : "bg-neutral-800 text-white border-neutral-700"
                      }`}
                    >
                      {name}
                      {isActive && " (Current)"}
                      <div
                        className={`absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${
                          isActive
                            ? theme === "light"
                              ? "border-r-blue-100"
                              : "border-r-blue-900/50"
                            : theme === "light"
                            ? "border-r-white"
                            : "border-r-neutral-800"
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          {/* <div className="relative group">
            <button
              onClick={toggleTheme}
              className={`flex items-center w-full px-4 py-2 rounded-md transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-neutral-800"
              }`}
            >
              {theme === "light" ? (
                <FiMoon className="text-2xl shrink-0" />
              ) : (
                <FiSun className="text-2xl shrink-0" />
              )}
              {!collapsed && (
                <span className="text-base">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
              )}
            </button>
            {/* Tooltip for collapsed view */}
            {/* {collapsed && (
              <div
                className={`absolute left-full ml-2 px-2 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2 shadow-lg border ${
                  theme === "light"
                    ? "bg-white text-gray-900 border-gray-200"
                    : "bg-neutral-800 text-white border-neutral-700"
                }`}
              >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
                <div
                  className={`absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${
                    theme === "light"
                      ? "border-r-white"
                      : "border-r-neutral-800"
                  }`}
                ></div>
              </div>
            )} */}
          {/* </div> */} 

          {/* Collapse Button - hidden on mobile devices */}
          <div className="relative group hidden sm:block">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center w-full px-4 py-2 rounded-md transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-neutral-800"
              }`}
            >
              {collapsed ? (
                <FiChevronRight className="text-2xl shrink-0" />
              ) : (
                <>
                  <FiChevronLeft className="text-2xl shrink-0" />
                  <span className="text-base">Collapse</span>
                </>
              )}
            </button>
            {/* Tooltip for collapsed view */}
            {collapsed && (
              <div
                className={`absolute left-full ml-2 px-2 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[99999] top-1/2 transform -translate-y-1/2 shadow-lg border ${
                  theme === "light"
                    ? "bg-white text-gray-900 border-gray-200"
                    : "bg-neutral-800 text-white border-neutral-700"
                }`}
              >
                Expand
                <div
                  className={`absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent ${
                    theme === "light"
                      ? "border-r-white"
                      : "border-r-neutral-800"
                  }`}
                ></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
