"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

const DockContext = createContext<{ mouseX: any }>({ mouseX: null });

export function Dock({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`flex h-16 items-end gap-3 rounded-full bg-white/70 dark:bg-neutral-900/80 backdrop-blur-2xl border border-black/10 dark:border-white/15 px-4 py-2 shadow-2xl z-[99999] ${className}`}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export function DockItem({
  className = "",
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX } = useContext(DockContext);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [44, 66, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 border border-black/5 dark:border-white/10 shadow-md hover:shadow-xl transition-colors ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isHovered });
        }
        return child;
      })}
    </motion.div>
  );
}

export function DockLabel({ children, isHovered }: { children: React.ReactNode; isHovered?: boolean }) {
  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 dark:bg-neutral-100 px-3 py-1 text-xs font-bold text-white dark:text-neutral-900 shadow-xl border border-white/10 pointer-events-none"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center w-6 h-6">{children}</div>;
}
