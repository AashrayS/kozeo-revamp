"use client";

import { useEffect } from "react";
import Image from "next/image";

interface PageLoaderProps {
  duration?: number;
  onComplete?: () => void;
  useSlideAnimation?: boolean; 
}

export const PageLoader = ({ onComplete }: PageLoaderProps) => {
  // Call onComplete once on mount — caller controls when to unmount
  useEffect(() => {
    onComplete?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}>
      {/* Logo + wordmark */}
      <div className="flex flex-col items-center select-none">
        <Image
          src="/kozeoLogo.png"
          alt="Kozeo Logo"
          width={64}
          height={64}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-5 opacity-90"
          priority
        />
        <h1 className="text-3xl sm:text-5xl font-normal tracking-tight text-forge-ink font-serif mb-8">
          Kozeo
        </h1>

        {/* Indeterminate loading bar */}
        <div className="w-16 h-[1px] bg-forge-line overflow-hidden rounded-sm">
          <div className="h-full bg-forge-ember animate-loading" />
        </div>
      </div>
    </div>
  );
};
