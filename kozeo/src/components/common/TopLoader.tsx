"use client";

import { useNavigation } from "./NavigationProvider";

const TopLoader = () => {
  const { isLoading } = useNavigation();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-loading"></div>
    </div>
  );
};

export default TopLoader;
