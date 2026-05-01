"use client";

import React, { useState, useEffect } from "react";
import { uploadReviewImagesToS3 } from "../../../utilities/helper";
import { Fragment, useRef } from "react";
import Image from "next/image";
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
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Handle paste in modal
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (images.length >= 3) return;
    const items = e.clipboardData.items;
    let pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length) {
      const totalImages = images.length + pastedFiles.length;
      if (totalImages > 3) {
        setError("You can attach up to 3 images only.");
        return;
      }
      setImages((prev) => [...prev, ...pastedFiles]);
      setError("");
    }
  };

  // Handle file input in modal
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;
    if (totalImages > 3) {
      setError("You can attach up to 3 images only.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setError("");
    setShowImageModal(false);
  };
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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;
    if (totalImages > 3) {
      setError("You can attach up to 3 images only.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setError("");
  };

  // Generate previews when images change
  useEffect(() => {
    const previews = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Remove an image
  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setError("");
  };

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
    if (images.length > 3) {
      setError("You can attach up to 3 images only.");
      return;
    }
    if (!user || !gigInfo) {
      setError("Missing user or project information");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // Upload images to S3 and collect URLs
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (const img of images) {
          const url = await uploadReviewImagesToS3(
            img,
            "reviews",
            gigInfo.id
           
          );
          imageUrls.push(url);
        }
      }
      let reviewData: any = {
        receiver: revieweeUsername,
        title: title.trim(),
        description: review.trim(),
        rating: rating,
        gig: gigInfo.id,
        images: imageUrls,
      };
      await createReview(reviewData);
      if (isHost) {
        try {
          await completeGig(gigInfo.id);
          console.log("Project completed successfully");
        } catch (completeError) {
          console.error("Failed to complete project:", completeError);
        }
      }
      setSubmitted(true);
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
      <div
        className={`w-full max-w-2xl mx-auto rounded-none sm:rounded-2xl border-0 sm:border shadow-none sm:shadow-xl p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8 justify-center items-center text-center transition-all duration-300 ${
          theme === "dark"
            ? "bg-transparent border-neutral-800 drop-shadow-none sm:drop-shadow-glow backdrop-blur-none sm:backdrop-blur-md text-white"
            : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-lg text-gray-900"
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
          Thank you for your feedback.{" "}
          {isHost && "The project has been marked as completed. "}You'll
          be redirected to the projects page shortly.
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
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Disclaimer Banner */}
      <div
        className={`w-full mb-6 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm flex items-start gap-3 ${
          theme === "dark"
            ? "bg-transparent border border-neutral-800 text-neutral-400"
            : "bg-gray-50 border border-gray-200 text-gray-600"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0 text-cyan-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <span className="leading-relaxed">
          Please share a{" "}
          <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
            genuine, detailed review
          </span>{" "}
          to help build stronger profiles.{" "}
          <span className="text-red-400">
            Fake or inappropriate reviews
          </span>{" "}
          may lead to suspension.
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-4xl rounded-2xl border p-6 md:p-10 flex flex-col gap-8 transition-all duration-300 ${
          theme === "dark"
            ? "bg-neutral-900/40 border-neutral-800 drop-shadow-glow"
            : "bg-white border-gray-100 shadow-sm"
        }`}
      >
              <h1
                className={`text-2xl sm:text-3xl font-bold mb-2 text-center tracking-tight transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Review Your Collaboration
              </h1>

              {/* Project Info */}
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
                    Project Details
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
                        {gigInfo.title}
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
                        {gigInfo.guest?.username || revieweeUsername}
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
                      <span className="text-cyan-400">
                        {gigInfo.host.username}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-sm mb-2">{error}</p>
                  {error.includes(
                    "Missing gigs ID or receiver information"
                  ) && (
                    <div className="text-xs text-gray-500">
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
                        className="mt-2 text-blue-500 hover:text-blue-600 underline"
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

              {/* Title Section */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your experience..."
                  className={`w-full px-4 sm:px-5 py-3 rounded-xl border text-base sm:text-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-neutral-900/70 border-neutral-800 text-white placeholder-gray-400 focus:ring-neutral-700"
                      : "bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  required
                />
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

              {/* Image Upload Section */}
              <div className="space-y-3">
                <label
                  className={`block font-medium text-base sm:text-lg transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Attach Images (optional)
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {images.length}/3
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  disabled={images.length >= 3}
                  className={`inline-block px-6 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer border shadow-sm ${
                    theme === "dark"
                      ? "bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 hover:border-purple-500"
                      : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
                  } ${
                    images.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {images.length >= 3 ? "Max Images Selected" : "Choose Images"}
                </button>

                {/* Image Upload Modal */}
                {showImageModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div
                      className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 w-full max-w-md relative`}
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
                        onClick={() => setShowImageModal(false)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <h2
                        className={`text-lg font-semibold mb-3 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Add Images
                      </h2>
                      <div
                        className="border-dashed border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4 flex flex-col items-center justify-center cursor-pointer"
                        tabIndex={0}
                        onPaste={handlePaste}
                        onClick={() => modalInputRef.current?.click()}
                      >
                        <p
                          className={`mb-2 text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Paste images here or click to select from device
                        </p>
                        <input
                          ref={modalInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleModalFileChange}
                          disabled={images.length >= 3}
                        />
                        <span className="text-xs text-gray-500">
                          {images.length}/3 selected
                        </span>
                      </div>
                      <div className="flex gap-3 flex-wrap mt-2 border border-neutral-700">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative w-20 h-20">
                            <Image
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              fill
                              className="object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {images.length >= 3 && (
                        <p className="text-xs text-red-500 mt-2">
                          Maximum 3 images allowed.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 w-auto flex-wrap mt-2 border border-neutral-800 rounded-2xl px-4 ">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 group cursor-pointer"
                    >
                      <Image
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover rounded-lg border"
                        onClick={() => setPreviewIdx(idx)}
                        style={{ zIndex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        aria-label="Remove image"
                        style={{ zIndex: 2 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Large Image Preview Modal */}
                {previewIdx !== null && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setPreviewIdx(null)}
                  >
                    <div
                      className="relative max-w-full w-full flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={imagePreviews[previewIdx]}
                        alt={`Large Preview ${previewIdx + 1}`}
                        width={800}
                        height={800}
                        className="object-fill rounded-xl border shadow-lg bg-transparent dark:bg-transaprent max-h-[70vh]"
                      />
                      <button
                        type="button"
                        className="absolute top-4 right-4 bg-white/80 dark:bg-neutral-900/80 border border-gray-300 dark:border-neutral-700 shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-2xl text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => setPreviewIdx(null)}
                        aria-label="Close preview"
                      >
                        <span className="font-bold">&times;</span>
                      </button>
                    </div>
                  </div>
                )}
                {images.length >= 3 && (
                  <p className="text-xs text-red-500">
                    Maximum 3 images allowed.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting || !rating || !title.trim() || !review.trim()
                }
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
    </div>
  );
}
