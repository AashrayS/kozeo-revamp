"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";

interface GigInfo {
  Title: string;
  host: string;
  gigId: string;
  collaborator: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gigInfo, setGigInfo] = useState<GigInfo | null>(null);

  useEffect(() => {
    // In a real app, you'd get this from URL params or context
    // For now, we'll use mock data
    setGigInfo({
      Title: "Real-time Collaboration Platform",
      host: "@uxwizard",
      gigId: "3",
      collaborator: "@developer123",
    });
  }, []);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoverRating(starValue);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !review.trim()) {
      alert("Please provide both a rating and review");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/gigs");
      }, 3000);
    }, 1500);
  };

  if (submitted) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-0 sm:p-8 flex flex-col items-center sm:justify-center">
              <div
                className={`w-full h-screen sm:h-auto max-w-2xl rounded-none sm:rounded-2xl border-0 sm:border shadow-none sm:shadow-xl p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 justify-center items-center text-center transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-transparent border-neutral-800 drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:backdrop-blur-md"
                    : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-lg"
                }`}
              >
                <div className="text-6xl mb-4">✅</div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 tracking-tight transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Review Submitted!
                </h1>
                <p
                  className={`text-lg mb-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Thank you for your feedback. You'll be redirected to the gigs
                  page shortly.
                </p>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </main>
          </div>
          {/* Glows */}
          {theme === "dark" && (
            <>
              <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
              <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Header logoText="Kozeo" />
      <div
        className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-0 sm:p-8 flex flex-col items-center sm:justify-center">
            <form
              onSubmit={handleSubmit}
              className={`w-full h-screen sm:h-auto max-w-2xl rounded-none sm:rounded-2xl border-0 sm:border shadow-none sm:shadow-xl p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 justify-start transition-all duration-300 ${
                theme === "dark"
                  ? "bg-transparent border-neutral-800 drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:backdrop-blur-md"
                  : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-lg"
              }`}
            >
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 text-center tracking-tight transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Review Your Collaboration
              </h1>

              {/* Gig Info */}
              {gigInfo && (
                <div
                  className={`border rounded-xl p-4 sm:p-6 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-neutral-900/50 border-neutral-800"
                      : "bg-gray-50/80 border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Gig Details
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Project:{" "}
                      </span>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {gigInfo.Title}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Working with:{" "}
                      </span>
                      <span className="text-cyan-400">
                        {gigInfo.collaborator}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Host:{" "}
                      </span>
                      <span className="text-cyan-400">{gigInfo.host}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Section */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
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
                            ? "text-yellow-400"
                            : theme === "dark"
                            ? "text-gray-600"
                            : "text-gray-300"
                        } hover:text-yellow-300`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p
                    className={`text-sm text-center sm:text-left transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
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

              {/* Review Text Area */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Share Your Experience
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell others about your collaboration experience..."
                  rows={6}
                  className={`w-full px-4 sm:px-5 py-3 rounded-xl border text-base sm:text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-neutral-900/70 border-neutral-800 text-white placeholder-gray-400 focus:ring-neutral-700"
                      : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  required
                />
                <p
                  className={`text-xs transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {review.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !rating || !review.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition-colors text-base sm:text-lg shadow-none border mt-2 ${
                  theme === "dark"
                    ? "bg-neutral-900/80 text-white hover:bg-neutral-800 border-neutral-800 disabled:opacity-60"
                    : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 disabled:opacity-60"
                } disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
            <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
          </>
        )}
      </div>
    </>
  );
}
