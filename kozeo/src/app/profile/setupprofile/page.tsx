"use client";

import { useState, useEffect } from "react";
import Header from "../../../components/common/Header";
import { useRouter } from "next/navigation";
import {
  updateUserProfile,
  getCurrentUser,
} from "../../../../utilities/kozeoApi";
import { isAuthenticated } from "../../../../utilities/api";
import { FiPlus, FiX } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const updateData = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        profile_Picture: form.profile_Picture.trim(),
        resume: form.resume.trim(),
        links: form.links,
      };

      await updateUserProfile((currentUser as any).id, updateData);
      setSuccess("Profile updated successfully!");

      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push(`/profile/${(currentUser as any).username}`);
      }, 2000);
    } catch (error: any) {
      setError(error?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div className="min-h-screen relative z-10 flex bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
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

              {/* Profile Picture URL */}
              <div className="mb-6">
                <label
                  htmlFor="profile_Picture"
                  className="block text-sm font-medium mb-2"
                >
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="profile_Picture"
                  name="profile_Picture"
                  value={form.profile_Picture}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-photo.jpg"
                  className="w-full p-3 rounded-md border border-neutral-700 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
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
                  className="flex-1 py-3 px-6 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition"
                >
                  {isSubmitting ? "Updating..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
