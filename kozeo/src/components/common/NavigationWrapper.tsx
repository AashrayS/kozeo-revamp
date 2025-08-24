"use client";

import { Suspense } from "react";
import { NavigationProvider } from "./NavigationProvider";
import { PageLoader } from "./PageLoader";

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
  return (
    <Suspense fallback={<NavigationFallback />}>
      <NavigationProvider>{children}</NavigationProvider>
    </Suspense>
  );
};
