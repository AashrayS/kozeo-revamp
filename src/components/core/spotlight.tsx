"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionTemplate, SpringOptions } from "framer-motion";

interface SpotlightProps {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
}

export function Spotlight({
  className = "bg-zinc-500/20 dark:bg-zinc-300/15 blur-2xl",
  size = 140,
  springOptions = { bounce: 0.3, duration: 0.1 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  useEffect(() => {
    if (containerRef.current?.parentElement) {
      setParentElement(containerRef.current.parentElement);
    }
  }, []);

  useEffect(() => {
    if (!parentElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parentElement.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - size / 2);
      mouseY.set(e.clientY - rect.top - size / 2);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", handleMouseEnter);
    parentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", handleMouseEnter);
      parentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [parentElement, mouseX, mouseY, size]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {isHovered && (
        <motion.div
          style={{
            x: mouseX,
            y: mouseY,
            width: size,
            height: size,
          }}
          className={`absolute rounded-full transition-opacity duration-300 ${className}`}
        />
      )}
    </div>
  );
}
