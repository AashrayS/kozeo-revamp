"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface PageLoaderProps {
  duration?: number;
  onComplete?: () => void;
  useSlideAnimation?: boolean;
}

export const PageLoader = ({
  duration = 2500,
  onComplete,
  useSlideAnimation = false,
}: PageLoaderProps) => {
  const [shouldSlideUp, setShouldSlideUp] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (useSlideAnimation) {
      // Start slide up animation after specified duration
      const slideTimer = setTimeout(() => {
        setShouldSlideUp(true);
      }, duration);

      // Remove loader completely after slide animation
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration + 1000);

      return () => {
        clearTimeout(slideTimer);
        clearTimeout(removeTimer);
      };
    } else {
      // Simple fade out without slide animation
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(removeTimer);
      };
    }
  }, [duration, onComplete, useSlideAnimation]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden ${
        useSlideAnimation 
          ? `transition-transform duration-1000 ease-in-out ${shouldSlideUp ? "transform -translate-y-full" : ""}`
          : `transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`
      }`}
    >
      {/* Loading Screen Glow Effects */}
      <div className="fixed top-1/4 right-1/4 w-2 h-0 rounded-full opacity-60 bg-purple-400 shadow-[0_0_200px_80px_rgba(168,85,247,0.2)] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 left-1/4 w-2 h-0 rounded-full opacity-60 bg-cyan-300 shadow-[0_0_200px_80px_rgba(34,211,238,0.2)] pointer-events-none z-0" />

      {/* Background Stars for Loading Screen */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="mb-6"
          style={{ animation: "logoGlow 2s ease-in-out infinite" }}
        >
          <Image
            src="/kozeoLogo.png"
            alt="Kozeo Logo"
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          />
        </div>
        <h1
          className="text-white text-4xl sm:text-6xl font-bold tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          style={{
            animation: "logoGlow 2s ease-in-out infinite",
            animationDelay: "0.3s",
          }}
        >
          Kozeo
        </h1>
        <div
          className="mt-8 w-16 h-1 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          style={{
            animation: "logoGlow 2s ease-in-out infinite",
            animationDelay: "0.6s",
          }}
        ></div>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-6">
          <div
            className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.4)]"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
