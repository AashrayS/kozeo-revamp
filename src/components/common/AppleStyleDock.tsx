"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  Zap,
  Layers,
  Briefcase,
  User,
  ShoppingBag,
  Shield,
  SunMoon,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/core/dock";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../store/hooks";
import { getUserRole } from "../../../utilities/api";

export function AppleStyleDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, username } = useUser();
  const profileUsername = username || "profile";
  const role = getUserRole(user);

  const rawData = [
    {
      title: "Home",
      icon: <HomeIcon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/Atrium",
    },
    {
      title: "Speedruns",
      icon: <Zap className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/speedruns",
    },
    {
      title: "Work Sprints",
      icon: <Layers className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/sprints",
    },
    ...(role === "business"
      ? [
          {
            title: "Business Portal",
            icon: <Briefcase className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
            path: "/business",
          },
        ]
      : []),
    {
      title: "Projects",
      icon: <Briefcase className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/gigs",
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: `/profile/${profileUsername}`,
    },
    ...(role === "admin"
      ? [
          {
            title: "Admin",
            icon: <Shield className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
            path: "/admin",
          },
        ]
      : []),
    {
      title: "Store",
      icon: <ShoppingBag className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/store",
    },
    {
      title: "Resume",
      icon: <FileText className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/resumeBuilder",
    },
    {
      title: "Discussions",
      icon: <MessageSquare className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      path: "/Atrium/discussion",
    },
    {
      title: theme === "light" ? "Dark Mode" : "Light Mode",
      icon: <SunMoon className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />,
      action: toggleTheme,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] pointer-events-auto">
      <Dock className="items-end pb-3">
        {rawData.map((item, idx) => {
          const isActive = item.path && pathname === item.path;

          return (
            <DockItem
              key={idx}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path && pathname !== item.path) {
                  router.push(item.path);
                }
              }}
              className={isActive ? "ring-2 ring-neutral-400 dark:ring-neutral-400 shadow-xl scale-110" : ""}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          );
        })}
      </Dock>
    </div>
  );
}
