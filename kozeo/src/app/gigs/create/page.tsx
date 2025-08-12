"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { useRouter } from "next/navigation";
import { createGig } from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";
import {
  FiPlus,
  FiX,
  FiInfo,
  FiHeart,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiTarget,
  FiCheck,
  FiBriefcase,
  FiGift,
} from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

export default function CreateGigPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useUser();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    title: "",
    looking_For: "",
    description: "",
    skills: [] as string[],
    currency: "INR",
    amount: "",
    isSkillForge: false,
  });
  const [newSkill, setNewSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.looking_For.trim()) {
      setError("Looking For field is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    if (form.skills.length === 0) {
      setError("At least one skill is required");
      return;
    }
    if (!form.isSkillForge && (!form.amount || parseFloat(form.amount) < 0)) {
      setError("Valid amount is required");
      return;
    }

    setSubmitting(true);

    try {
      const gigData = {
        title: form.title.trim(),
        looking_For: form.looking_For.trim(),
        description: form.description.trim(),
        skills: form.skills,
        currency: form.currency,
        amount: form.isSkillForge ? 0 : parseFloat(form.amount),
        isSkillForge: form.isSkillForge,
      };

      console.log("Creating gig with data:", gigData);
      const newGig = await createGig(gigData);
      console.log("Gig created successfully:", newGig);

      setSuccess("Gig created successfully!");

      // Reset form
      setForm({
        title: "",
        looking_For: "",
        description: "",
        skills: [],
        currency: "INR",
        amount: "",
        isSkillForge: false,
      });

      // Redirect to the specific gig's lobby page with the gig ID
      setTimeout(() => {
        router.push(`/gigs/${(newGig as any).id}/lobby`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating gig:", error);
      setError(error?.message || "Failed to create gig. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-4xl">
              {/* Header Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h1
                  className={`text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create Your Next
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-medium ml-3">
                    Collaboration
                  </span>
                </h1>
                <p
                  className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Transform your ideas into reality by connecting with talented
                  collaborators worldwide
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className={`w-full rounded-3xl border-0 shadow-2xl p-8 sm:p-12 lg:p-16 flex flex-col gap-8 transition-all duration-300 relative overflow-hidden ${
                  theme === "dark"
                    ? "bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/50"
                    : "bg-white/95 backdrop-blur-xl border border-gray-200/50"
                }`}
                style={{
                  boxShadow:
                    theme === "dark"
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)",
                }}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.3),transparent_50%)]"></div>
                </div>

                <div className="relative z-10 space-y-8">
                  {/* Title Input */}
                  <div className="space-y-3">
                    <label
                      className={`block text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Project Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter an engaging project title..."
                      className={`w-full px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                          : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                      }`}
                      required
                    />
                  </div>

                  {/* Looking For Input */}
                  <div className="space-y-3">
                    <label
                      className={`block text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Looking For
                    </label>
                    <input
                      name="looking_For"
                      value={form.looking_For}
                      onChange={handleChange}
                      placeholder="e.g., React Developer, UI/UX Designer, Marketing Specialist..."
                      className={`w-full px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                          : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                      }`}
                      required
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-3">
                    <label
                      className={`block text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your project vision, goals, and what makes it exciting..."
                      rows={5}
                      className={`w-full px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 resize-none ${
                        theme === "dark"
                          ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                          : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                      }`}
                      required
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <label
                      className={`block text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Required Skills
                    </label>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        placeholder="Add a skill (e.g., React, Figma, SEO...)"
                        className={`flex-1 px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                            : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <FiPlus className="text-lg" />
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                      {form.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            theme === "dark"
                              ? "bg-neutral-800/70 border-neutral-600 text-gray-200"
                              : "bg-gray-50 border-gray-200 text-gray-800"
                          }`}
                        >
                          <span className="font-medium">{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className={`transition-colors duration-300 hover:scale-110 ${
                              theme === "dark"
                                ? "text-gray-400 hover:text-red-400"
                                : "text-gray-500 hover:text-red-500"
                            }`}
                          >
                            <FiX className="text-lg" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skill Forge Toggle Section */}
                  <div
                    className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                      form.isSkillForge
                        ? theme === "dark"
                          ? "bg-neutral-800/60 border-blue-500/30 shadow-lg"
                          : "bg-blue-50/50 border-blue-200/50 shadow-md"
                        : theme === "dark"
                        ? "bg-neutral-800/30 border-neutral-600/50"
                        : "bg-gray-50/50 border-gray-200"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start gap-6 mb-6">
                        <div
                          className={`p-4 rounded-xl transition-all duration-300 ${
                            form.isSkillForge
                              ? theme === "dark"
                                ? "bg-blue-900/50 shadow-md"
                                : "bg-blue-100 shadow-sm"
                              : theme === "dark"
                              ? "bg-neutral-700"
                              : "bg-gray-200"
                          }`}
                        >
                          <FiUsers
                            className={`text-2xl transition-all duration-300 ${
                              form.isSkillForge
                                ? theme === "dark"
                                  ? "text-blue-400"
                                  : "text-blue-600"
                                : theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Skill Development Collaboration
                          </h3>
                          <p
                            className={`text-base leading-relaxed transition-colors duration-300 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            Enable experience-based collaboration focused on
                            skill development and professional growth
                          </p>
                        </div>
                      </div>

                      {/* Professional Toggle Switch */}
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              isSkillForge: !prev.isSkillForge,
                            }))
                          }
                          className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 ${
                            form.isSkillForge
                              ? theme === "dark"
                                ? "bg-blue-600 focus:ring-blue-500/30"
                                : "bg-blue-500 focus:ring-blue-400/30"
                              : theme === "dark"
                              ? "bg-neutral-600 focus:ring-neutral-500/30"
                              : "bg-gray-300 focus:ring-gray-400/30"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                              form.isSkillForge
                                ? "translate-x-8"
                                : "translate-x-0"
                            }`}
                          >
                            {form.isSkillForge && (
                              <FiCheck className="text-blue-600 text-xs" />
                            )}
                          </div>
                        </button>
                        <span
                          className={`text-base font-medium transition-colors duration-300 ${
                            form.isSkillForge
                              ? theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-600"
                              : theme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {form.isSkillForge ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      {/* Professional Skill Forge Info Card */}
                      {form.isSkillForge && (
                        <div
                          className={`p-6 rounded-xl border transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/50 border-neutral-600/50"
                              : "bg-white/80 border-gray-200/50"
                          }`}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className={`p-3 rounded-lg ${
                                theme === "dark"
                                  ? "bg-blue-900/30"
                                  : "bg-blue-100"
                              }`}
                            >
                              <FiInfo
                                className={`text-lg ${
                                  theme === "dark"
                                    ? "text-blue-400"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h4
                                className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                Benefits of Skill Development Collaboration
                              </h4>
                              <div
                                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <FiTrendingUp className="text-green-500 text-sm" />
                                  <span>Gain practical experience</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <FiBriefcase className="text-blue-500 text-sm" />
                                  <span>Build professional portfolio</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <FiAward className="text-purple-500 text-sm" />
                                  <span>Earn platform recognition</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <FiUsers className="text-orange-500 text-sm" />
                                  <span>Expand professional network</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`mt-4 p-4 rounded-lg transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-blue-950/20 border border-blue-800/20"
                                : "bg-blue-50/70 border border-blue-200/30"
                            }`}
                          >
                            <p
                              className={`text-sm leading-relaxed transition-colors duration-300 ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <FiTarget className="inline mr-2 text-blue-500" />
                              <strong>Ideal for:</strong> Students,
                              professionals changing careers, developers
                              building portfolios, and anyone looking to
                              contribute to meaningful projects while advancing
                              their skills.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Section - Enhanced Design */}
                  {!form.isSkillForge && (
                    <div className="space-y-4">
                      <label
                        className={`block text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Project Budget
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                          name="currency"
                          value={form.currency}
                          onChange={handleSelectChange}
                          className={`px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/50 border-neutral-700 text-white focus:ring-cyan-500/30 focus:border-cyan-500"
                              : "bg-white/80 border-gray-200 text-gray-900 focus:ring-blue-500/30 focus:border-blue-500"
                          }`}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                        <input
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="Enter amount"
                          type="number"
                          min="0"
                          className={`sm:col-span-2 px-6 py-4 rounded-2xl border-2 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                          }`}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Skill Forge Payment Display */}
                  {form.isSkillForge && (
                    <div
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-neutral-800/60 border-blue-500/20"
                          : "bg-blue-50/50 border-blue-200/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"
                          }`}
                        >
                          <FiGift
                            className={`text-xl ${
                              theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Experience-Based Collaboration
                          </p>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            No monetary exchange • Focus on skill development &
                            recognition
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl backdrop-blur-sm">
                      <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-2xl backdrop-blur-sm">
                      <p className="text-green-400 font-medium">{success}</p>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                      form.isSkillForge
                        ? theme === "dark"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-900/30"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : theme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                    } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 ${
                      form.isSkillForge
                        ? "focus:ring-blue-500/30"
                        : "focus:ring-purple-500/30"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Collaboration...
                      </>
                    ) : form.isSkillForge ? (
                      <>
                        <FiBriefcase className="text-xl" />
                        Launch Skill Forge Project
                      </>
                    ) : (
                      <>
                        <FiTarget className="text-xl" />
                        Create Professional Gig
                      </>
                    )}
                  </button>
                </div>
              </form>
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
