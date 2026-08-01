"use client";

import { useNavigationLoader } from "./useNavigationLoader";
import { PageLoader } from "./PageLoader";

const NavigationLoader = () => {
  const { isLoading } = useNavigationLoader();

  if (!isLoading) return null;

  return (
    <PageLoader
      duration={1500}
      onComplete={() => {}}
      useSlideAnimation={false}
    />
  );
};

export default NavigationLoader;
