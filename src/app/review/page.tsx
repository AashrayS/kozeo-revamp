"use client";

import React, { useState, useEffect } from "react";
import { PageLoader } from "@/components/common/PageLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../store/hooks";
import {
  createReview,
  completeGig,
  getGigById,
} from "../../../utilities/kozeoApi";

interface GigInfo {
  id: string;
  title: string;
  host: {
    id: string;
    username: string;
  };
  guest?: {
    id: string;
    username: string;
  };
  status: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gigInfo, setGigInfo] = useState<GigInfo | null>(null);
  const [revieweeUsername, setRevieweeUsername] = useState("");
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchGigInfo = async () => {
      try {
        const gigId = searchParams.get("gigId");
        const receiverUsername = searchParams.get("receiver");

        if (!gigId || !receiverUsername) {
          setError(
            "Missing project ID or receiver information. Please access this page from a completed project."
          );
          // Don't return immediately - let user see the error and potentially navigate away
          return;
        }

        // Fetch gig details
        const gig = await getGigById(gigId);
        if (!gig) {
          setError("Project not found");
          return;
        }

        // Check if user is authorized to leave a review (must be host or guest)
        if (user && (gig as any).host && (gig as any).guest) {
          const userIsHost = user.id === (gig as any).host.id;
          const userIsGuest = user.id === (gig as any).guest.id;

          if (!userIsHost && !userIsGuest) {
            setError("You are not authorized to review this project");
            setTimeout(() => router.push("/projects"), 3000);
            return;
          }

          setIsHost(userIsHost);
        }

        setGigInfo(gig as GigInfo);
        setRevieweeUsername(receiverUsername);
      } catch (err) {
        console.error("Error fetching project info:", err);
        setError("Failed to load project information");
      }
    };

    if (user) {
      fetchGigInfo();
    } else {
      setError("Please log in to leave a review");
    }
  }, [searchParams, user, router]);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !title.trim() || !review.trim()) {
      setError("Please provide a title, rating, and review");
      return;
    }

    if (!user || !gigInfo) {
      setError("Missing user or project information");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Create the review
      const reviewData = {
        receiver: revieweeUsername,
        title: title.trim(),
        description: review.trim(),
        rating: rating,
        gig: gigInfo.id,
      };

      await createReview(reviewData);

      // If user is the host, complete the project after successful review
      if (isHost) {
        try {
          await completeGig(gigInfo.id);
          console.log("Project completed successfully");
        } catch (completeError) {
          console.error("Failed to complete project:", completeError);
          // Don't fail the whole process if completing project fails
        }
      }

      setSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/projects");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-forge-ink"
              : "bg-forge-bg    text-forge-ink"
          }`}
        >
          <div className="flex-1 flex flex-col pb-20 lg:pb-0">
            <main className="flex-1 p-0 sm:p-8 flex flex-col items-center sm:justify-center">
              <div
                className={`w-full h-screen sm:h-auto max-w-2xl rounded-none sm:rounded-sm border-0 sm:border shadow-none sm:shadow-[0_4px_20px_rgba(21,18,13,0.5)] p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 justify-center items-center text-center transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-transparent border-forge-line drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:"
                    : "bg-forge-bg/80 border-forge-line  shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                }`}
              >
                <div className="text-6xl mb-4">✅</div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 tracking-tight transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                  }`}
                >
                  Review Submitted!
                </h1>
                <p
                  className={`text-lg mb-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink-muted"
                  }`}
                >
                  Thank you for your feedback.{" "}
                  {isHost && "The project has been marked as completed. "}You'll
                  be redirected to the projects page shortly.
                </p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-forge-ember rounded-full animate-pulse-slow"></div>
                  <div
                    className="w-2 h-2 bg-forge-ember-low rounded-full animate-pulse-slow"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-forge-ember rounded-full animate-pulse-slow"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </main>
          </div>
          {/* Glows */}
          {theme === "dark" && (
            <>
              <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
              <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-forge-ink"
            : "bg-forge-bg    text-forge-ink"
        }`}
      >
        <div className="flex-1 flex flex-col pb-20 lg:pb-0">
          <main className="flex-1 p-0 sm:p-8 flex flex-col items-center sm:justify-center">
            <form
              onSubmit={handleSubmit}
              className={`w-full h-screen sm:h-auto max-w-2xl rounded-none sm:rounded-sm border-0 sm:border shadow-none sm:shadow-[0_4px_20px_rgba(21,18,13,0.5)] p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 justify-start transition-all duration-300 ${
                theme === "dark"
                  ? "bg-transparent border-forge-line drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:"
                  : "bg-forge-bg/80 border-forge-line  shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
              }`}
            >
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 text-center tracking-tight transition-colors duration-300 ${
                  theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                }`}
              >
                Review Your Collaboration
              </h1>

              {/* Project Info */}
              {gigInfo && (
                <div
                  className={`border rounded-sm p-4 sm:p-6 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-forge-bg-raised/50 border-forge-line"
                      : "bg-forge-bg/80 border-forge-line"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                    }`}
                  >
                    Project Details
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                        }`}
                      >
                        Project:{" "}
                      </span>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                        }`}
                      >
                        {gigInfo.title}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                        }`}
                      >
                        Working with:{" "}
                      </span>
                      <span className="text-forge-ember">
                        {gigInfo.guest?.username || revieweeUsername}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                        }`}
                      >
                        Host:{" "}
                      </span>
                      <span className="text-forge-ember">
                        {gigInfo.host.username}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-[forge-error-bg/10 border border-[forge-error/20 rounded-sm p-4">
                  <p className="text-[forge-error text-sm mb-2">{error}</p>
                  {error.includes(
                    "Missing gigs ID or receiver information"
                  ) && (
                    <div className="text-xs text-forge-ink-muted">
                      <p>To leave a review, you need to:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Complete a project collaboration</li>
                        <li>
                          Access the review page from the project completion
                          flow
                        </li>
                      </ul>
                      <button
                        onClick={() => router.push("/projects")}
                        className="mt-2 text-forge-ember hover:text-forge-ember underline"
                      >
                        Go to Projects Page
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Rating Section */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                  }`}
                >
                  Rate Your Experience
                </label>
                <div className="flex gap-2 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className="text-3xl transition-colors duration-200 focus:outline-none"
                    >
                      <FaStar
                        className={`${
                          star <= (hoverRating || rating)
                            ? "text-forge-ember"
                            : theme === "dark"
                            ? "text-forge-ink-muted"
                            : "text-forge-ink"
                        } hover:text-forge-ember`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p
                    className={`text-sm text-center sm:text-left transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                    }`}
                  >
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Title Section */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                  }`}
                >
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your experience..."
                  className={`w-full px-4 sm:px-5 py-3 rounded-sm border text-base sm:text-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-forge-bg-raised/70 border-forge-line text-forge-ink placeholder-gray-400 focus:ring-forge-line"
                      : "bg-forge-bg/80 border-forge-line text-forge-ink placeholder-gray-500 focus:ring-forge-line focus:border-forge-ember"
                  }`}
                  required
                />
              </div>

              {/* Review Text Area */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                  }`}
                >
                  Share Your Experience
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell others about your collaboration experience..."
                  rows={6}
                  className={`w-full px-4 sm:px-5 py-3 rounded-sm border text-base sm:text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-forge-bg-raised/70 border-forge-line text-forge-ink placeholder-gray-400 focus:ring-forge-line"
                      : "bg-forge-bg/80 border-forge-line text-forge-ink placeholder-gray-500 focus:ring-forge-line focus:border-forge-ember"
                  }`}
                  required
                />
                <p
                  className={`text-xs transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                  }`}
                >
                  {review.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting || !rating || !title.trim() || !review.trim()
                }
                className={`w-full py-3 rounded-sm font-semibold transition-colors text-base sm:text-lg shadow-none border mt-2 ${
                  theme === "dark"
                    ? "bg-forge-bg-raised/80 text-forge-ink hover:bg-forge-bg-raised border-forge-line disabled:opacity-60"
                    : "bg-forge-ember-low text-forge-ink hover:bg-forge-ember-low border-forge-ember disabled:opacity-60"
                } disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-forge-line border-t-transparent rounded-full animate-spin"></div>
                    Submitting Review...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </main>
        </div>
        {/* Glows */}
        {theme === "dark" && (
          <>
            <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
            <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
          </>
        )}
      </div>
    </>
  );
}
