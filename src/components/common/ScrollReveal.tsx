"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: string;
  className?: string;
  stagger?: number;
  baseDelay?: number;
}

/**
 * WordReveal: Splits text into words and reveals them one-by-one
 * once the component enters the viewport.
 */
export const WordReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = "", 
  stagger = 0.04, // Snappy speed per user request
  baseDelay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const words = children.split(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`flex flex-wrap gap-x-[0.3em] gap-y-0 ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transitionDelay: `${baseDelay + i * stagger}s`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

interface HeaderRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * HeaderReveal: A more immediate, solid reveal for headlines.
 */
export const HeaderReveal: React.FC<HeaderRevealProps> = ({ 
  children, 
  className = "", 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};
