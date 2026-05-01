"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NavigationInterceptor from "./NavigationInterceptor";
import { PageLoader } from "./PageLoader";
import { useTheme } from "@/contexts/ThemeContext";

interface NavigationContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const startLoading = () => {
    setManualLoading(true);
  };

  const stopLoading = () => {
    setManualLoading(false);
  };

  // Immediately show loader on any route change attempt
  useEffect(() => {
    // Show loader immediately when navigation starts
    setIsLoading(true);
    setManualLoading(false); // Reset manual loading

    // Keep loader visible for minimum duration to ensure smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Increased duration for better UX

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  // Handle manual loading trigger
  useEffect(() => {
    if (manualLoading) {
      setIsLoading(true);
    }
  }, [manualLoading]);

  const contextValue = {
    isLoading: isLoading || manualLoading,
    startLoading,
    stopLoading,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {/* Navigation Interceptor for immediate loader trigger */}
      <NavigationInterceptor />

      {/* Top loading bar */}
      {(isLoading || manualLoading) && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
          <div className="h-full bg-gradient-to-r from-white/20 via-white/80 to-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-loading"></div>
        </div>
      )}

      {children}
    </NavigationContext.Provider>
  );
};
