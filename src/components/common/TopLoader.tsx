"use client";

import { useNavigation } from "./NavigationProvider";
import { PageLoader } from "./PageLoader";

const TopLoader = () => {
  const { isLoading } = useNavigation();

  if (!isLoading) return null;

  return (
    <PageLoader
      duration={800}
      onComplete={() => {}}
      useSlideAnimation={false}
    />
  );
};

export default TopLoader;
