"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Transition, Variants } from "framer-motion";

interface TextLoopProps {
  children: React.ReactNode[];
  interval?: number;
  className?: string;
  transition?: Transition;
  variants?: Variants;
}

export function TextLoop({
  children,
  interval = 2500,
  className = "",
  transition = {
    type: "spring",
    stiffness: 700,
    damping: 60,
    mass: 8,
  },
  variants = {
    initial: {
      y: 20,
      rotateX: 90,
      opacity: 0,
      filter: "blur(4px)",
    },
    animate: {
      y: 0,
      rotateX: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: {
      y: -20,
      rotateX: -90,
      opacity: 0,
      filter: "blur(4px)",
    },
  },
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = React.Children.toArray(children);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={transition}
          className="inline-block font-bold text-amber-500"
        >
          {items[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
