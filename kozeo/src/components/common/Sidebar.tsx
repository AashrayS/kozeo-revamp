"use client";

import {
  FiUser,
  FiShoppingBag,
  FiBriefcase,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";

const tabs: { name: string; icon: IconType; path: string }[] = [
  { name: "Home", icon: FiHome, path: "/Atrium" },
  { name: "Profile", icon: FiUser, path: "/profile" },
  { name: "Store", icon: FiShoppingBag, path: "/store" },
  { name: "Your Gigs", icon: FiBriefcase, path: "/Gig/1" },
  { name: "Discussion Rooms", icon: FiMessageSquare, path: "/Atrium/discussion" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();

  return (
    <div className="relative">
      <aside
        className={`sticky top-0 h-screen border-r text-white border-neutral-700 flex flex-col justify-between transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col p-4 space-y-6">
          <nav className="space-y-8">
            {tabs.map(({ name, icon: Icon, path }) => (
              <button
                key={name}
                onClick={() => router.push(path)}
                className="flex items-center gap-3 w-full px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                <Icon className="text-2xl shrink-0" />
                {!collapsed && <span className="text-base">{name}</span>}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
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
        </div>
      </aside>
    </div>
  );
}
