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
            ? "bg-white/10 border-white/5 text-white/40 shadow-none"
            : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:ring-white/20",
        light:
          disabled || loading
            ? "bg-black/10 border-black/5 text-black/40 shadow-none"
            : "bg-black text-white hover:bg-black/90 hover:scale-[1.02] border-black shadow-[0_0_20px_rgba(0,0,0,0.1)] focus:ring-black/20",
      },
      danger: {
        dark:
          disabled || loading
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400"
            : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 focus:ring-red-500/30",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500"
            : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100/90 hover:border-red-300 focus:ring-red-400/30",
      },
      warning: {
        dark:
          disabled || loading
            ? "bg-neutral-800/60 border-neutral-600/50 text-neutral-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 focus:ring-amber-500/30",
        light:
          disabled || loading
            ? "bg-gray-100/80 border-gray-200 text-gray-500"
            : "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/90 hover:border-amber-300 focus:ring-amber-400/30",
      },
      neutral: {
        dark:
          disabled || loading
            ? "bg-white/5 border-white/5 text-white/20"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 focus:ring-white/10",
        light:
          disabled || loading
            ? "bg-black/5 border-black/5 text-black/20"
            : "bg-black/5 border-black/10 text-black hover:bg-black/10 hover:border-black/20 focus:ring-black/10",
      },
    };

    return variants[variant][theme === "dark" ? "dark" : "light"];
  };

  // Gradient effect colors based on variant - now much more subtle
  const getGradientClasses = () => {
    return ""; // Removed aggressive gradients for premium look
  };

  // Loading spinner icon
  const LoadingIcon = () => (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative ${sizeClasses[size]} rounded-full font-medium
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden
        border shadow-sm
        focus:outline-none focus:ring-2 focus:ring-opacity-50
        disabled:cursor-not-allowed disabled:opacity-50
        group
        ${getVariantClasses()}
        ${className}
      `}
    >
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* Icon or loading spinner */}
        {loading ? <LoadingIcon /> : icon}

        {/* Button text */}
        <span className="tracking-tight">
          {loading && loadingText ? loadingText : children}
        </span>
      </span>

      {/* Subtle shine effect on hover */}
      {!loading && !disabled && (
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            -translate-x-full group-hover:translate-x-full
            transition-transform duration-1000 ease-in-out
          `}
        />
      )}
    </button>
  );
};

export default ProfessionalButton;
