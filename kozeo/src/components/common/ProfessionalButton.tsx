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
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400 shadow-neutral-900/20"
            : "bg-emerald-950/30 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-700/60 hover:text-emerald-200 hover:shadow-emerald-900/30 focus:ring-emerald-500/30 hover:shadow-lg hover:-translate-y-0.5",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500 shadow-gray-200/30"
            : "bg-emerald-50/80 border-emerald-200/60 text-emerald-700 hover:bg-emerald-100/90 hover:border-emerald-300/70 hover:text-emerald-800 hover:shadow-emerald-200/40 focus:ring-emerald-400/30 hover:shadow-lg hover:-translate-y-0.5",
      },
      danger: {
        dark:
          disabled || loading
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400 shadow-neutral-900/20"
            : "bg-red-950/30 border-red-800/40 text-red-300 hover:bg-red-900/40 hover:border-red-700/60 hover:text-red-200 hover:shadow-red-900/30 focus:ring-red-500/30 hover:shadow-lg",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500 shadow-gray-200/30"
            : "bg-red-50/80 border-red-200/60 text-red-700 hover:bg-red-100/90 hover:border-red-300/70 hover:text-red-800 hover:shadow-red-200/40 focus:ring-red-400/30 hover:shadow-lg",
      },
      warning: {
        dark:
          disabled || loading
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400 shadow-neutral-900/20"
            : "bg-amber-950/30 border-amber-800/40 text-amber-300 hover:bg-amber-900/40 hover:border-amber-700/60 hover:text-amber-200 hover:shadow-amber-900/30 focus:ring-amber-500/30 hover:shadow-lg",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500 shadow-gray-200/30"
            : "bg-amber-50/80 border-amber-200/60 text-amber-700 hover:bg-amber-100/90 hover:border-amber-300/70 hover:text-amber-800 hover:shadow-amber-200/40 focus:ring-amber-400/30 hover:shadow-lg",
      },
      neutral: {
        dark:
          disabled || loading
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400 shadow-neutral-900/20"
            : "bg-neutral-800/60 border-neutral-600/50 text-neutral-300 hover:bg-neutral-700/70 hover:border-neutral-500/60 hover:text-neutral-200 hover:shadow-neutral-900/30 focus:ring-neutral-500/30 hover:shadow-lg",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500 shadow-gray-200/30"
            : "bg-gray-100/80 border-gray-200 text-gray-700 hover:bg-gray-200/90 hover:border-gray-300/70 hover:text-gray-800 hover:shadow-gray-200/40 focus:ring-gray-400/30 hover:shadow-lg",
      },
    };

    return variants[variant][theme === "dark" ? "dark" : "light"];
  };

  // Gradient effect colors based on variant
  const getGradientClasses = () => {
    const gradients = {
      primary: {
        dark: "bg-gradient-to-r from-emerald-800/10 via-emerald-700/20 to-emerald-800/10",
        light:
          "bg-gradient-to-r from-emerald-200/20 via-emerald-100/30 to-emerald-200/20",
      },
      danger: {
        dark: "bg-gradient-to-r from-red-800/10 via-red-700/20 to-red-800/10",
        light: "bg-gradient-to-r from-red-200/20 via-red-100/30 to-red-200/20",
      },
      warning: {
        dark: "bg-gradient-to-r from-amber-800/10 via-amber-700/20 to-amber-800/10",
        light:
          "bg-gradient-to-r from-amber-200/20 via-amber-100/30 to-amber-200/20",
      },
      neutral: {
        dark: "bg-gradient-to-r from-neutral-600/10 via-neutral-500/20 to-neutral-600/10",
        light:
          "bg-gradient-to-r from-gray-300/20 via-gray-200/30 to-gray-300/20",
      },
    };

    return gradients[variant][theme === "dark" ? "dark" : "light"];
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
        relative ${sizeClasses[size]} rounded-lg font-medium
        transition-all duration-300 ease-out overflow-hidden
        border backdrop-blur-sm shadow-sm
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
            absolute inset-0 rounded-lg animate-pulse
            ${
              theme === "dark"
                ? "bg-gradient-to-r from-transparent via-neutral-600/20 to-transparent"
                : "bg-gradient-to-r from-transparent via-gray-300/20 to-transparent"
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
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          transform -skew-x-12 translate-x-full group-hover:-translate-x-full
          transition-transform duration-700
        `}
      />
    </button>
  );
};

export default ProfessionalButton;
