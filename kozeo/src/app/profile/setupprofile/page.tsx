"use client";

import { useState, useRef, useEffect } from "react";
import Header from "../../../components/common/Header";
import { useRouter } from "next/navigation";
import {
  updateUserProfile,
  getCurrentUser,
} from "../../../../utilities/kozeoApi";
import { isAuthenticated } from "../../../../utilities/api";
import { FiPlus, FiX } from "react-icons/fi";
import { FaCamera, FaUpload, FaTimes } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { PageLoader } from "../../../components/common/PageLoader";
import {
  uploadImageToS3,
  validateImageFile,
} from "../../../../utilities/helper.js";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Profile image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isProfileImageUpdated, setIsProfileImageUpdated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    phone: "",
    profile_Picture: "",
    resume: "",
    links: [] as string[],
  });

  const [newLink, setNewLink] = useState("");

  // Check authentication and load current user
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // Pre-fill form with existing user data
        setForm({
          first_name: (user as any).first_name || "",
          last_name: (user as any).last_name || "",
          bio: (user as any).bio || "",
          phone: (user as any).phone || "",
          profile_Picture: (user as any).profile_Picture || "",
          resume: (user as any).resume || "",
          links: (user as any).links || [],
        });

        // Set existing profile image if available
        if ((user as any).profile_Picture) {
          setProfileImage((user as any).profile_Picture);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addLink = () => {
    if (newLink.trim() && !form.links.includes(newLink.trim())) {
      setForm((prev) => ({
        ...prev,
        links: [...prev.links, newLink.trim()],
      }));
      setNewLink("");
    }
  };

  const removeLink = (linkToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter((link) => link !== linkToRemove),
    }));
  };

  // Image upload handlers
  const handleImageUpload = (file: File) => {
    if (!file) {
      setError("Please select a valid file");
      return;
    }

    // Validate the image file using our helper function
    const validation = validateImageFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
    }) as { isValid: boolean; errors: string[] };

    if (!validation.isValid) {
      setError(`Upload failed: ${validation.errors.join(", ")}`);
      return;
    }

    // Store the file object for later S3 upload
    setProfileImageFile(file);
    setIsProfileImageUpdated(true);

    // Create preview for UI
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUploadProgress("");

    if (!currentUser) {
      setError("User data not loaded");
      return;
    }

    // Basic validation
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      let profilePictureUrl = form.profile_Picture;

      // If profile picture has been updated, upload to S3 first
      if (isProfileImageUpdated && profileImageFile) {
        try {
          setUploadProgress("Uploading profile picture...");
          console.log("Uploading profile picture to S3...");
          profilePictureUrl = await uploadImageToS3(
            profileImageFile,
            "profile-pictures"
          );
          console.log(
            "Profile picture uploaded successfully:",
            profilePictureUrl
          );
          setUploadProgress("Profile picture uploaded successfully!");
        } catch (uploadError) {
          console.error("S3 upload failed:", uploadError);
          setError(
            `Failed to upload profile picture: ${
              (uploadError as Error).message
            }`
          );
          setIsSubmitting(false);
          setUploadProgress("");
          return;
        }
      }

      setUploadProgress("Updating profile...");

      const updateData = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        profile_Picture: profilePictureUrl,
        resume: form.resume.trim(),
        links: form.links,
      };

      await updateUserProfile((currentUser as any).id, updateData);
      setSuccess("Profile updated successfully!");

      // Reset the update flags
      setIsProfileImageUpdated(false);
      setProfileImageFile(null);
      setUploadProgress("");

      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push(`/profile/${(currentUser as any).username}`);
      }, 2000);
    } catch (error: any) {
      setError(error?.message || "Failed to update profile. Please try again.");
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLoader
        duration={1500}
        onComplete={() => {}}
        useSlideAnimation={false}
      />
    );
  }

  return (
    <>
      {isPageLoading && (
        <PageLoader
          duration={2000}
          onComplete={() => setIsPageLoading(false)}
          useSlideAnimation={false}
        />
      )}

      <div
        className={`transition-opacity duration-1000 ${
          isPageLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header logoText="Kozeo" />
        {/* Glows */}
        {theme === "dark" && (
          <>
            <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
            <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
          </>
        )}

        <div
          className={`min-h-screen relative z-10 flex overflow-y-auto transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
          }`}
        >
          <div className="flex-1 max-w-2xl mx-auto p-6">
            <div className="mb-8 text-center">
              <h1
                className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Complete Your Profile
              </h1>
              <p
                className={`transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tell us more about yourself to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={`rounded-lg p-6 shadow-md transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#111] to-[#1a1a1a]"
                    : "bg-white/90 border border-gray-200 shadow-lg"
                }`}
              >
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="first_name"
                      className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium mb-2"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Profile Picture Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-4">
                    Profile Picture
                  </label>

                  <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
                    {/* Avatar Display */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover object-center"
                            style={{
                              minWidth: "100%",
                              minHeight: "100%",
                            }}
                          />
                        ) : (
                          <FiUser className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors border-2 border-neutral-600"
                      >
                        <FaCamera className="text-white text-xs" />
                      </button>
                    </div>

                    {/* Upload Section */}
                    <div className="flex-1 w-full">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                          isDragging
                            ? "border-cyan-400 bg-cyan-400/10"
                            : "border-neutral-600 hover:border-neutral-500"
                        }`}
                      >
                        <FaUpload className="mx-auto text-gray-400 text-xl mb-2" />
                        <p className="text-gray-300 mb-1 text-sm">
                          Drag and drop your image here
                        </p>
                        <p className="text-gray-500 text-xs mb-3">or</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition text-sm"
                        >
                          Browse Files
                        </button>
                      </div>

                      {profileImage && (
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition text-sm"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileImage(null);
                              setProfileImageFile(null);
                              setIsProfileImageUpdated(false);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition text-sm flex items-center gap-1"
                          >
                            <FaTimes className="text-xs" />
                            Remove
                          </button>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume URL */}
                <div className="mb-6">
                  <label
                    htmlFor="resume"
                    className="block text-sm font-medium mb-2"
                  >
                    Resume URL
                  </label>
                  <input
                    type="url"
                    id="resume"
                    name="resume"
                    value={form.resume}
                    onChange={handleInputChange}
                    placeholder="https://example.com/your-resume.pdf"
                    className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Links */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Portfolio/Social Links
                  </label>

                  {/* Add Link Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLink())
                      }
                      placeholder="https://your-portfolio.com"
                      className="flex-1 p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={addLink}
                      className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition flex items-center gap-2"
                    >
                      <FiPlus className="text-sm" />
                      Add
                    </button>
                  </div>

                  {/* Links List */}
                  <div className="space-y-2">
                    {form.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-neutral-800 border border-neutral-600 rounded-md"
                      >
                        <span className="flex-1 text-cyan-400 truncate">
                          {link}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLink(link)}
                          className="text-gray-400 hover:text-white transition p-1"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-md">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-3 bg-green-900/50 border border-green-500 rounded-md">
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/Atrium")}
                    className="flex-1 py-3 px-6 border border-neutral-600 text-white rounded-md hover:bg-neutral-800 transition"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {uploadProgress || "Saving..."}
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
