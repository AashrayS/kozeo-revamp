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
} from "react-icons/fi";
import { useState } from "react";
import { IconType } from "react-icons";
import { useNavigationLoader } from "./useNavigationLoader";
import { useUser } from "../../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const { navigateWithLoader, startLoading } = useNavigationLoader();
  const { user, username, isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();

  // Debug logging
  console.log("Sidebar - User state:", { user, username, isAuthenticated });

  // Get username from Redux user state or fallback to a default
  const profileUsername = username || "profile";

  const tabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Home", icon: FiHome, path: "/Atrium" },
    { name: "Profile", icon: FiUser, path: `/profile/${profileUsername}` },
    { name: "Store", icon: FiShoppingBag, path: "/store" },
    { name: "My Gigs", icon: FiBriefcase, path: "/gigs" }, // Update to go to gig list
    {
      name: "Discussion Rooms",
      icon: FiMessageSquare,
      path: "/Atrium/discussion",
    },
  ];

  const handleNavigation = (path: string) => {
    // Always trigger loader immediately for any navigation
    // debugger;
    navigateWithLoader(path);
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
            {tabs.map(({ name, icon: Icon, path }) => (
              <div key={name} className="relative group">
                <button
                  onClick={() => handleNavigation(path)}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-md transition-colors ${
                    theme === "light"
                      ? "hover:bg-gray-100"
                      : "hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="text-2xl shrink-0" />
                  {!collapsed && <span className="text-base">{name}</span>}
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
                    {name}
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
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-md transition-colors ${
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
            {collapsed && (
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
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-md transition-colors ${
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
