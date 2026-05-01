"use client";

import { Suspense } from "react";
import { NavigationProvider } from "./NavigationProvider";
import { PageLoader } from "./PageLoader";

import { usePathname } from "next/navigation";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

// Loading fallback component
const NavigationFallback = () => (
  <PageLoader
    duration={1000}
    onComplete={() => {}}
    useSlideAnimation={false}
  />
);

export const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const pathname = usePathname();
  
  // Public routes that should not have the sidebar/header
  const isPublicRoute = pathname === "/" || pathname === "/login";

  return (
    <Suspense fallback={<NavigationFallback />}>
      <NavigationProvider>
        {isPublicRoute ? (
          children
        ) : (
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        )}
      </NavigationProvider>
    </Suspense>
  );
};
