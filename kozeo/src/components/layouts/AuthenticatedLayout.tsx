"use client";

import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { theme } = useTheme();

  return (
    <div 
      suppressHydrationWarning
      className={`min-h-screen flex flex-col theme-transition bg-white text-black dark:bg-black dark:text-white transition-colors duration-500`}
    >
      {/* Global Header */}
      <Header logoText="Kozeo" />

      {/* Main Container with Sidebar and Content */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Persistent Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar z-10">
          {/* Global Atmospheric Glows */}
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-60 bg-blue-500 shadow-[0_0_250px_120px_rgba(59,130,246,0.2)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-60 bg-cyan-400 shadow-[0_0_250px_120px_rgba(34,211,238,0.2)] pointer-events-none z-0" />
          
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile background glows (optional refinements can be added here) */}
    </div>
  );
}
