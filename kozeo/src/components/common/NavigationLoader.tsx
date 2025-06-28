"use client";

import { useNavigationLoader } from "./useNavigationLoader";

const NavigationLoader = () => {
  const { isLoading } = useNavigationLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#111,_#000)] flex items-center justify-center z-50">
      {/* Glow effects matching login page */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div className="bg-transparent bg-opacity-10  rounded-2xl p-8 flex flex-col items-center border-opacity-20 z-10">
        <div className="relative mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-opacity-20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="text-white text-lg font-medium">Loading...</p>
        <p className="text-gray-300 text-sm mt-1">Please wait</p>
      </div>
    </div>
  );
};

export default NavigationLoader;
