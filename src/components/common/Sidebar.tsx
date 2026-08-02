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
  FiZap,
  FiLayers,
} from "react-icons/fi";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { useNavigationLoader } from "./useNavigationLoader";
import { useUser } from "../../../store/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import BottomNavBar from "./BottomNavBar";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { navigateWithLoader } = useNavigationLoader();
  const { user, username } = useUser();
  const { theme } = useTheme();
  const pathname = usePathname();

  // Get username from Redux user state or fallback to a default
  const profileUsername = username || "profile";

  const exploreTabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Home", icon: FiHome, path: "/Atrium" },
    { name: "Speedruns", icon: FiZap, path: "/speedruns" },
    { name: "Work Sprints", icon: FiLayers, path: "/sprints" },
    { name: "Projects", icon: FiBriefcase, path: "/gigs" },
  ];

  const accountTabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Profile", icon: FiUser, path: `/profile/${profileUsername}` },
    { name: "Store", icon: FiShoppingBag, path: "/store" },
    { name: "Resume Builder", icon: FiFileText, path: "/resumeBuilder" },
    { name: "Discussion Rooms", icon: FiMessageSquare, path: "/Atrium/discussion" },
  ];

  const adminTabs: { name: string; icon: IconType; path: string }[] = [
    { name: "Admin Settings", icon: FiSettings, path: "/admin/settings" },
  ];

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
      <div className="sticky top-0 h-full z-[9999] hidden sm:block">
        <aside
          className={`sticky top-0 h-full border-r transition-all duration-300 z-[9999] flex flex-col justify-between backdrop-blur-xl bg-header-bg text-text-1 border-container-3 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex flex-col p-4 space-y-6 overflow-y-auto">
            {/* Explore Section */}
            <div>
              {!collapsed && (
                <span className="block px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-4">
                  Explore & Work
                </span>
              )}
              <nav className="space-y-1">
                {exploreTabs.map(({ name, icon: Icon, path }) => {
                  const isActive = isActivePath(path);
                  return (
                    <button
                      key={name}
                      onClick={() => handleNavigation(path)}
                      disabled={isActive}
                      className={`flex items-center w-full px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                        collapsed ? "justify-center" : "gap-3"
                      } ${
                        isActive
                          ? "bg-container-3 text-text-1 font-semibold border border-container-3/80 shadow-xs"
                          : "hover:bg-state-hover cursor-pointer text-text-3 hover:text-text-1"
                      }`}
                    >
                      <Icon className={`text-lg shrink-0 ${isActive ? "opacity-100 text-amber-500 scale-105" : "opacity-75"}`} />
                      {!collapsed && <span className="text-sm tracking-tight">{name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Account Section */}
            <div>
              {!collapsed && (
                <span className="block px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-text-4">
                  Tools & Account
                </span>
              )}
              <nav className="space-y-1">
                {accountTabs.map(({ name, icon: Icon, path }) => {
                  const isActive = isActivePath(path);
                  return (
                    <button
                      key={name}
                      onClick={() => handleNavigation(path)}
                      disabled={isActive}
                      className={`flex items-center w-full px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                        collapsed ? "justify-center" : "gap-3"
                      } ${
                        isActive
                          ? "bg-container-3 text-text-1 font-semibold border border-container-3/80 shadow-xs"
                          : "hover:bg-state-hover cursor-pointer text-text-3 hover:text-text-1"
                      }`}
                    >
                      <Icon className={`text-lg shrink-0 ${isActive ? "opacity-100 text-amber-500 scale-105" : "opacity-75"}`} />
                      {!collapsed && <span className="text-sm tracking-tight">{name}</span>}
                    </button>
                  );
                })}

                {user?.role === "admin" &&
                  adminTabs.map(({ name, icon: Icon, path }) => {
                    const isActive = isActivePath(path);
                    return (
                      <button
                        key={name}
                        onClick={() => handleNavigation(path)}
                        disabled={isActive}
                        className={`flex items-center w-full px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                          collapsed ? "justify-center" : "gap-3"
                        } ${
                          isActive
                            ? "bg-container-3 text-text-1 font-semibold border border-container-3/80 shadow-xs"
                            : "hover:bg-state-hover cursor-pointer text-text-3 hover:text-text-1"
                        }`}
                      >
                        <Icon className={`text-lg shrink-0 ${isActive ? "opacity-100 text-amber-500 scale-105" : "opacity-75"}`} />
                        {!collapsed && <span className="text-sm tracking-tight">{name}</span>}
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* Collapse Button - hidden on mobile devices */}
            <div className="relative group hidden sm:block">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
                  collapsed ? "justify-center" : "gap-3"
                } hover:bg-state-hover cursor-pointer text-text-3 hover:text-text-1`}
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
