"use client";
import { useTheme } from "@/contexts/ThemeContext";
import { ReactNode } from "react";

interface ProfessionalButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "warning" | "neutral";
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
}

const ProfessionalButton = ({
  onClick,
  disabled = false,
  variant = "primary",
  loading = false,
  loadingText,
  children,
  icon,
  className = "",
  size = "md",
  type = "button",
}: ProfessionalButtonProps) => {
  // Access the current theme from context
  const { theme } = useTheme();

  // Size variants
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  // Color variants for different themes
  const getVariantClasses = () => {
    const variants = {
      primary: {
        dark:
          disabled || loading
            ? "bg-forge-bg-raised/60 border-forge-line/50 text-forge-ink-muted"
            : "bg-forge-ember-low/40 border-forge-ember/40 text-forge-ember hover:bg-forge-ember-low/60 hover:border-forge-ember/60 hover:shadow-[0_4px_16px_rgba(90,47,24,0.3)] hover:-translate-y-0.5",
        light:
          disabled || loading
            ? "bg-forge-paper border-forge-line text-forge-ink-muted"
            : "bg-forge-ember-low/60 border-forge-ember/60 text-forge-ember hover:bg-forge-ember-low hover:border-forge-ember hover:shadow-[0_4px_16px_rgba(90,47,24,0.25)] hover:-translate-y-0.5",
      },
      danger: {
        dark:
          disabled || loading
            ? "bg-forge-bg-raised/60 border-forge-line/50 text-forge-ink-muted shadow-neutral-900/20"
            : "bg-[forge-error-bg/30 border-[forge-error/40 text-[forge-error hover:bg-[forge-error-bg/40 hover:border-[forge-error/60 hover:text-[forge-error hover:shadow-red-900/30 focus:ring-red-500/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
        light:
          disabled || loading
            ? "bg-forge-bg/80 border-forge-line text-forge-ink-muted shadow-gray-200/30"
            : "bg-[forge-error-bg/80 border-[forge-error/60 text-[forge-error hover:bg-[forge-error-bg/90 hover:border-[forge-error/70 hover:text-[forge-error hover:shadow-red-200/40 focus:ring-red-400/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
      },
      warning: {
        dark:
          disabled || loading
            ? "bg-forge-bg-raised/60 border-forge-line/50 text-forge-ink-muted shadow-neutral-900/20"
            : "bg-amber-950/30 border-amber-800/40 text-amber-300 hover:bg-amber-900/40 hover:border-amber-700/60 hover:text-amber-200 hover:shadow-amber-900/30 focus:ring-amber-500/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
        light:
          disabled || loading
            ? "bg-forge-bg/80 border-forge-line text-forge-ink-muted shadow-gray-200/30"
            : "bg-amber-50/80 border-amber-200/60 text-amber-700 hover:bg-amber-100/90 hover:border-amber-300/70 hover:text-amber-800 hover:shadow-amber-200/40 focus:ring-amber-400/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
      },
      neutral: {
        dark:
          disabled || loading
            ? "bg-forge-bg-raised/60 border-forge-line/50 text-forge-ink-muted shadow-neutral-900/20"
            : "bg-forge-bg-raised/60 border-forge-line/50 text-forge-ink hover:bg-forge-bg-raised/70 hover:border-forge-line/60 hover:text-forge-ink hover:shadow-neutral-900/30 focus:ring-neutral-500/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
        light:
          disabled || loading
            ? "bg-forge-bg/80 border-forge-line text-forge-ink-muted shadow-gray-200/30"
            : "bg-forge-bg/80 border-forge-line text-forge-ink hover:bg-forge-bg/90 hover:border-forge-line/70 hover:text-forge-ink hover:shadow-gray-200/40 focus:ring-gray-400/30 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]",
      },
    };

    return variants[variant][theme === "dark" ? "dark" : "light"];
  };

  // Shimmer overlay for hover — single warm tone, no gradient
  const getGradientClasses = () => {
    return "bg-forge-ember-low/10";
  };

  // Loading spinner icon
  const LoadingIcon = () => (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative ${sizeClasses[size]} rounded-sm font-medium
        transition-all duration-300 ease-out overflow-hidden
        border  shadow-[0_4px_20px_rgba(21,18,13,0.5)]
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        disabled:cursor-not-allowed disabled:opacity-75
        group
        ${getVariantClasses()}
        ${className}
      `}
    >
      {/* Background gradient effect */}
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${!loading && !disabled ? "group-hover:opacity-100" : ""}
          ${getGradientClasses()}
        `}
      />

      {/* Loading pulse effect */}
      {loading && (
        <div
          className={`
            absolute inset-0 rounded-sm animate-pulse-slow
            ${
              theme === "dark"
                ? "bg-forge-bg from-transparent /20 to-transparent"
                : "bg-forge-bg from-transparent /20 to-transparent"
            }
          `}
        />
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* Icon or loading spinner */}
        {loading ? <LoadingIcon /> : icon}

        {/* Button text */}
        <span className="font-medium">
          {loading && loadingText ? loadingText : children}
        </span>
      </span>

      {/* Subtle shine effect on hover */}
      <div
        className={`
          absolute inset-0 opacity-0 transition-all duration-500
          ${!loading && !disabled ? "group-hover:opacity-100" : ""}
          bg-forge-bg from-transparent via-white/10 to-transparent
          transform -skew-x-12 translate-x-full group-hover:-translate-x-full
          transition-transform duration-700
        `}
      />
    </button>
  );
};

export default ProfessionalButton;
