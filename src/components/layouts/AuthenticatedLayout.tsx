"use client";

import Header from "../common/Header";
import { AppleStyleDock } from "../common/AppleStyleDock";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { theme } = useTheme();

  return (
    <div 
      suppressHydrationWarning
      className="h-screen overflow-hidden flex flex-col theme-transition transition-colors duration-500"
    >
      {/* Global Header */}
      <Header logoText="Kozeo" />

      {/* Full Width Main Content Container */}
      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 relative overflow-y-auto custom-scrollbar z-10 pb-32">
          {/* Global Atmospheric Glows */}
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-60 bg-white shadow-[0_0_250px_120px_rgba(255,255,255,0.15)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-60 bg-white shadow-[0_0_250px_120px_rgba(255,255,255,0.15)] pointer-events-none z-0" />
          
          <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1700px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Universal Floating Apple Dock Navigation */}
      <AppleStyleDock />
    </div>
  );
}
