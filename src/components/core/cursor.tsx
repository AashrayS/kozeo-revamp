"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Transition, Variants } from "framer-motion";

interface CursorProps {
  children: React.ReactNode;
  attachToParent?: boolean;
  className?: string;
  variants?: Variants;
  transition?: Transition;
}

export function Cursor({
  children,
  attachToParent = false,
  className = "",
  variants = {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.3, opacity: 0 },
  },
  transition = {
    ease: "easeInOut",
    duration: 0.15,
  },
}: CursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (attachToParent && containerRef.current?.parentElement) {
        const parentRect = containerRef.current.parentElement.getBoundingClientRect();
        setPosition({
          x: e.clientX - parentRect.left,
          y: e.clientY - parentRect.top,
        });
      } else {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const parent = attachToParent ? containerRef.current?.parentElement : window;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove as EventListener);
      parent.addEventListener("mouseenter", handleMouseEnter);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove as EventListener);
        parent.removeEventListener("mouseenter", handleMouseEnter);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [attachToParent]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={transition}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
            className={`pointer-events-none absolute top-0 left-0 ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
