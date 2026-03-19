"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface PageLoaderProps {
  duration?: number;
  onComplete?: () => void;
  useSlideAnimation?: boolean;
  forceShow?: boolean;
}

export const PageLoader = ({
  duration = 2400,
  onComplete,
  useSlideAnimation = false,
  forceShow = false,
}: PageLoaderProps) => {
  const [shouldSlideUp, setShouldSlideUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || initialized.current) return;
    initialized.current = true;

    const hasShown = sessionStorage.getItem("kozeo_loader_shown");

    if (forceShow || !hasShown) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Progress bar animation
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const nextProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(nextProgress);
        
        if (elapsed >= duration) {
          clearInterval(progressInterval);
        }
      }, 16);

      if (useSlideAnimation) {
        const slideTimer = setTimeout(() => {
          setShouldSlideUp(true);
          sessionStorage.setItem("kozeo_loader_shown", "true");
        }, duration);

        const removeTimer = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
          onComplete?.();
        }, duration + 1000);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(slideTimer);
          clearTimeout(removeTimer);
        };
      } else {
        const removeTimer = setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
          sessionStorage.setItem("kozeo_loader_shown", "true");
          onComplete?.();
        }, duration);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(removeTimer);
        };
      }
    } else {
      // Loader already shown in this session, skip it
      onComplete?.();
      setIsVisible(false);
    }
  }, [duration, onComplete, useSlideAnimation, forceShow]);

  if (!isVisible) return null;

  return (
    <div
      suppressHydrationWarning
      className={`fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden ${
        useSlideAnimation
          ? `transition-transform duration-1000 cubic-bezier(0.85, 0, 0.15, 1) ${
              shouldSlideUp ? "transform -translate-y-full" : ""
            }`
          : `transition-opacity duration-700 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`
      }`}
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-600/10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-purple-600/5 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with scaling entrance */}
        <div
          className="mb-8 relative animate-premiumLogoIn"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse z-0" />
          <Image
            src="/kozeoLogo.png"
            alt="Kozeo Logo"
            width={96}
            height={96}
            className="w-20 h-20 sm:w-24 sm:h-24 relative z-10"
            style={{ borderRadius: "100%" }}
            priority
          />
        </div>

        {/* Brand Name with letter spacing animation */}
        <div className="overflow-hidden flex flex-col items-center">
          <h1
            className="text-white text-4xl sm:text-6xl font-bold tracking-[0.2em] uppercase mb-1 opacity-0 animate-premiumTextIn-14"
            style={{
              animationDelay: "0.2s",
            }}
          >
            Kozeo
          </h1>
          <p 
            className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium opacity-0 animate-premiumTextIn-16"
            style={{
              animationDelay: "0.4s",
            }}
          >
            A Proof-First Era
          </p>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="mt-16 w-32 sm:w-48 h-[1px] bg-white/10 rounded-full relative overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};
