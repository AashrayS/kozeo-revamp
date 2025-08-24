"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../src/contexts/ThemeContext";
import ProfessionalButton from "./ProfessionalButton";
import { FaStar } from "react-icons/fa";

interface RequestCardProps {
  request: any;
  index: number;
  processingRequests: Set<number>;
  onAccept: (request: any, index: number) => void;
  onReject: (request: any, index: number) => void;
}

// Profile Picture Component with fallback handling
interface ProfilePictureWithFallbackProps {
  src?: string;
  alt: string;
  fallbackText: string;
  status?: string;
}

function ProfilePictureWithFallback({
  src,
  alt,
  fallbackText,
  status,
}: ProfilePictureWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Show fallback if no src, image failed to load, or still loading and errored
  const showFallback = !src || imageError || (imageLoading && !src);

  if (showFallback) {
    return (
      <div
        className={`
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
          bg-gradient-to-br font-bold text-white shadow-lg border-2 transition-all duration-300
          text-xs sm:text-sm md:text-base
          ${
            status === "pending"
              ? "from-gray-500 to-gray-600 border-gray-300"
              : status === "accepted"
              ? "from-gray-600 to-gray-700 border-gray-400"
              : status === "rejected"
              ? "from-gray-500 to-gray-600 border-gray-300"
              : "from-gray-500 to-gray-600 border-gray-300"
          }
        `}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <div
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden shadow-lg border-2 transition-all duration-300
        ${
          status === "pending"
            ? "border-gray-300"
            : status === "accepted"
            ? "border-gray-400"
            : status === "rejected"
            ? "border-gray-300"
            : "border-gray-300"
        }
      `}
    >
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

export default function RequestCard({
  request: req,
  index: idx,
  processingRequests,
  onAccept,
  onReject,
}: RequestCardProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <div
      className={`
        relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4 h-full
        transition-all duration-300 ease-out
        backdrop-blur-sm shadow-lg hover:shadow-xl
        border group overflow-hidden
        ${
          req.status === "pending"
            ? theme === "light"
              ? "bg-white/95 border-gray-200/60 hover:border-gray-300/80 hover:shadow-gray-200/20"
              : "bg-neutral-900/80 border-neutral-700/60 hover:border-neutral-600/80 hover:shadow-neutral-900/20"
            : req.status === "accepted"
            ? theme === "light"
              ? "bg-gray-50/95 border-gray-300/60 hover:border-gray-400/80 hover:shadow-gray-200/20"
              : "bg-neutral-800/80 border-neutral-700/60 hover:border-neutral-500/80 hover:shadow-neutral-900/20"
            : req.status === "rejected"
            ? theme === "light"
              ? "bg-gray-100/95 border-gray-300/60 hover:border-gray-400/80 hover:shadow-gray-200/20"
              : "bg-neutral-850/80 border-neutral-700/60 hover:border-neutral-600/80 hover:shadow-neutral-900/20"
            : theme === "light"
            ? "bg-white/95 border-gray-200/60 hover:border-gray-300/80 hover:shadow-gray-200/20"
            : "bg-neutral-900/80 border-neutral-700/60 hover:border-neutral-600/80 hover:shadow-neutral-900/20"
        }
      `}
    >
      {/* Subtle shine effect on hover */}
      <div
        className={`
          absolute inset-0 opacity-0 transition-opacity duration-500
          ${req.status === "pending" ? "group-hover:opacity-100" : ""}
          bg-gradient-to-r from-transparent via-white/3 to-transparent
          transform -skew-x-12 translate-x-full group-hover:-translate-x-full
          transition-transform duration-700 pointer-events-none
        `}
      />

      {/* Header section with user info and status */}
      <div className="relative z-10 flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Profile Picture or Avatar */}
          <div className="relative flex-shrink-0">
            <ProfilePictureWithFallback
              src={req.requesterProfilePicture}
              alt={`${req.requesterName || req.name} profile`}
              fallbackText={(req.requesterName || req.name || "U")
                .charAt(0)
                .toUpperCase()}
              status={req.status}
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div
              className={`font-bold text-sm sm:text-base md:text-lg transition-colors duration-300 truncate ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              @{req.requesterName || req.name}
            </div>

            {/* Gig stats - Hosted and Collaborated counts */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mt-1">
              <div
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium
                  backdrop-blur-sm border transition-colors duration-300
                  ${
                    theme === "light"
                      ? "bg-gray-100/70 border-gray-200/70 text-gray-700"
                      : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                  }
                `}
              >
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs whitespace-nowrap">
                  {req.requesterGigHostedCount || 0} hosted
                </span>
              </div>
              <div
                className={`
                  flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium
                  backdrop-blur-sm border transition-colors duration-300
                  ${
                    theme === "light"
                      ? "bg-gray-100/70 border-gray-200/70 text-gray-700"
                      : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                  }
                `}
              >
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs whitespace-nowrap">
                  {req.requesterGigCollaboratedCount || 0} collaborated
                </span>
              </div>
            </div>

            {/* Enhanced status indicator */}
            <div
              className={`
                inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold mt-1 sm:mt-2
                backdrop-blur-sm border shadow-sm transition-all duration-300 w-fit
                ${
                  req.status === "pending"
                    ? "bg-gray-100/80 border-gray-300/50 text-gray-700 dark:bg-gray-800/50 dark:border-gray-600/50 dark:text-gray-300"
                    : req.status === "accepted"
                    ? "bg-gray-100/80 border-gray-300/50 text-gray-700 dark:bg-gray-800/50 dark:border-gray-600/50 dark:text-gray-300"
                    : req.status === "rejected"
                    ? "bg-gray-100/80 border-gray-300/50 text-gray-600 dark:bg-gray-800/50 dark:border-gray-600/50 dark:text-gray-400"
                    : "bg-gray-100/80 border-gray-300/50 text-gray-700 dark:bg-gray-800/50 dark:border-gray-600/50 dark:text-gray-300"
                }
              `}
            >
              {req.status === "pending" && (
                <>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400 animate-pulse" />
                  <span className="text-xs">Pending Review</span>
                </>
              )}
              {req.status === "accepted" && (
                <>
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs">Accepted</span>
                </>
              )}
              {req.status === "rejected" && (
                <>
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs">Rejected</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating and timestamp section */}
        <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
          <div
            className={`
            flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg
            backdrop-blur-sm border transition-colors duration-300
            ${
              theme === "light"
                ? "bg-white/70 border-gray-200/70 text-gray-600"
                : "bg-black/20 border-neutral-600/50 text-gray-300"
            }
          `}
          >
            <FaStar
              className={`${
                theme === "light" ? "text-yellow-500" : "text-yellow-400"
              }`}
              size={10}
            />
            <span className="text-xs font-medium">
              {(() => {
                const rating =
                  req.requesterRating || req.rating || req.sender?.rating;
                return rating ? `${Number(rating).toFixed(1)}` : "N/A";
              })()}
            </span>
          </div>

          <div
            className={`text-xs font-medium text-center ${
              theme === "light" ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {req.timestamp
              ? new Date(req.timestamp).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now"}
          </div>

          {req.responseTime && req.status !== "pending" && (
            <div
              className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded backdrop-blur-sm border font-medium ${
                req.status === "accepted"
                  ? theme === "light"
                    ? "bg-gray-100/70 border-gray-200/70 text-gray-700"
                    : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                  : theme === "light"
                  ? "bg-gray-100/70 border-gray-200/70 text-gray-600"
                  : "bg-gray-800/50 border-gray-700/50 text-gray-400"
              }`}
            >
              {new Date(req.responseTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bio section */}
      {(req.requesterBio || req.sender?.bio) && (
        <div
          className={`
            relative p-3 sm:p-4 rounded-lg sm:rounded-xl transition-colors duration-300
            backdrop-blur-sm border
            ${
              theme === "light"
                ? "bg-gray-50/60 border-gray-200/60 text-gray-700"
                : "bg-neutral-800/30 border-neutral-700/50 text-gray-300"
            }
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              About
            </span>
          </div>
          <div className="text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4">
            {req.requesterBio}
          </div>
        </div>
      )}

      {/* Message section */}
      <div
        className={`
          relative p-3 sm:p-4 rounded-lg sm:rounded-xl transition-colors duration-300
          backdrop-blur-sm border flex-grow
          ${
            theme === "light"
              ? "bg-white/40 border-gray-200/40 text-gray-800"
              : "bg-black/20 border-neutral-600/30 text-gray-200"
          }
        `}
      >
        <div className="text-xs sm:text-sm leading-relaxed font-medium">
          <b>Invite message:</b> {req.message}
        </div>
      </div>

      {/* Action buttons section */}
      {req.status === "pending" && (
        <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
          <ProfessionalButton
            onClick={() => {
              const username = req.requesterName || req.name;
              if (username) {
                const cleanUsername = username.replace(/^@/, "");
                router.push(`/profile/${cleanUsername}`);
              }
            }}
            variant="neutral"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            icon={
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          >
            <span className="hidden sm:inline">View Profile</span>
            <span className="sm:hidden">Profile</span>
          </ProfessionalButton>
          <ProfessionalButton
            onClick={() => onAccept(req, idx)}
            disabled={processingRequests.has(idx)}
            variant="primary"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            loading={processingRequests.has(idx)}
            loadingText="Processing..."
            icon={
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
          >
            Accept
          </ProfessionalButton>
          <ProfessionalButton
            onClick={() => onReject(req, idx)}
            disabled={processingRequests.has(idx)}
            variant="danger"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            loading={processingRequests.has(idx)}
            loadingText="Processing..."
            icon={
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Reject
          </ProfessionalButton>
        </div>
      )}

      {/* Enhanced status messages for processed requests */}
      {req.status === "accepted" && (
        <div
          className={`
          relative z-10 mt-2 sm:mt-3 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm border
          transition-all duration-300
          ${
            theme === "light"
              ? "bg-gray-100/80 border-gray-200/80 text-gray-700"
              : "bg-gray-800/50 border-gray-700/50 text-gray-300"
          }
        `}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`
              w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
              ${
                theme === "light"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-700/70 text-gray-300"
              }
            `}
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xs sm:text-sm">
                Request Accepted
              </div>
              <div className="text-xs opacity-90">
                User can now join the gig workspace
              </div>
            </div>
          </div>
        </div>
      )}

      {req.status === "rejected" && (
        <div
          className={`
          relative z-10 mt-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg backdrop-blur-sm border
          transition-all duration-300 text-center
          ${
            theme === "light"
              ? "bg-gray-100/60 border-gray-200/60 text-gray-600"
              : "bg-gray-800/40 border-gray-700/50 text-gray-400"
          }
        `}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <svg
              className="w-2.5 h-2.5 sm:w-3 sm:h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-xs">Request Declined</span>
          </div>
        </div>
      )}
    </div>
  );
}
