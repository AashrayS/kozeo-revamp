"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
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
  FiRefreshCw,
  FiChevronDown,
  FiDollarSign,
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

  // Currency conversion state
  const [exchangeRates, setExchangeRates] = useState({
    USD: 83.12, // USD to INR
    EUR: 91.45, // EUR to INR
    INR: 1, // INR to INR
  });
  const [convertedAmount, setConvertedAmount] = useState("");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Currency options
  const currencyOptions = [
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  ];

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

  // Currency selection handler
  const handleCurrencySelect = (currencyCode: string) => {
    setForm({ ...form, currency: currencyCode });
    setIsCurrencyDropdownOpen(false);
  };

  // Currency conversion functions
  const convertToINR = (amount: string, fromCurrency: string) => {
    if (!amount || isNaN(parseFloat(amount))) return "";
    const numAmount = parseFloat(amount);
    const rate = exchangeRates[fromCurrency as keyof typeof exchangeRates];
    return (numAmount * rate).toFixed(2);
  };

  const updateExchangeRates = async () => {
    try {
      // In a real application, you would fetch from a currency API
      // For now, using static rates that could be updated
      setExchangeRates({
        USD: 83.12,
        EUR: 91.45,
        INR: 1,
      });
    } catch (error) {
      console.error("Failed to update exchange rates:", error);
    }
  };

  // Update converted amount when amount or currency changes
  useEffect(() => {
    if (form.amount && form.currency !== "INR") {
      const converted = convertToINR(form.amount, form.currency);
      setConvertedAmount(converted);
    } else {
      setConvertedAmount("");
    }
  }, [form.amount, form.currency]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsCurrencyDropdownOpen(false);
    };

    if (isCurrencyDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isCurrencyDropdownOpen]);

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
      };

      console.log("Creating project with data:", gigData);
      const newGig = await createGig(gigData);
      console.log("Project created successfully:", newGig);

      setSuccess("Project created successfully!");

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

      // Redirect to the specific project's lobby page with the project ID
      setTimeout(() => {
        router.push(`/gigs/${(newGig as any).id}/lobby`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating project:", error);
      setError(error?.message || "Failed to create project. Please try again.");
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
        <div className="flex-1 flex flex-col pb-20 lg:pb-0">
          <main className="flex-1 p-2 sm:p-4 lg:p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-4xl px-2 sm:px-4">
              {/* Header Section */}
              <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                <h1
                  className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight mb-3 sm:mb-4 transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create Your Next
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-medium ml-2 sm:ml-3 block sm:inline">
                    Collaboration
                  </span>
                </h1>
                <p
                  className={`text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300 px-4 sm:px-0 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Transform your ideas into reality by connecting with talented
                  collaborators worldwide
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="w-full premium-card p-4 sm:p-8 lg:p-12 xl:p-16 flex flex-col gap-6 sm:gap-8"
              >
                <div className="relative z-10 space-y-6 sm:space-y-8">
                  {/* Title Input */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="premium-label">
                      Project Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter an engaging project title..."
                      className="premium-input"
                      required
                    />
                  </div>

                  {/* Looking For Input */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="premium-label">
                      Looking For
                    </label>
                    <input
                      name="looking_For"
                      value={form.looking_For}
                      onChange={handleChange}
                      placeholder="e.g., React Developer, UI/UX Designer..."
                      className="premium-input"
                      required
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="premium-label">
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your project vision, goals, and what makes it exciting..."
                      rows={4}
                      className="premium-input resize-none"
                      required
                    />
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <label className="premium-label">
                      Required Skills
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        placeholder="Add a skill (e.g., React, Figma...)"
                        className="premium-input border-2"
                      />
                      <ProfessionalButton
                        onClick={addSkill}
                        variant="primary"
                        size="md"
                        icon={<FiPlus className="text-base sm:text-lg" />}
                        className="w-full sm:w-auto"
                      >
                        Add
                      </ProfessionalButton>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                      {form.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border-2 transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
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
                    className={`relative p-4 sm:p-6 lg:p-8 premium-card border transition-all duration-300 ${
                      form.isSkillForge
                        ? "border-black/20 dark:border-white/20"
                        : "border-black/5 dark:border-white/5 opacity-80"
                    }`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                        <div
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0 ${
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
                            className={`text-xl sm:text-2xl transition-all duration-300 ${
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
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-lg sm:text-xl font-semibold mb-2 transition-colors duration-300 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Profile Building Collaboration
                          </h3>
                          <p
                            className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              isSkillForge: !prev.isSkillForge,
                            }))
                          }
                          className={`relative w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 flex-shrink-0 ${
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
                            className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-6 h-6 sm:w-6 sm:h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                              form.isSkillForge
                                ? "translate-x-7 sm:translate-x-8"
                                : "translate-x-0"
                            }`}
                          >
                            {form.isSkillForge && (
                              <FiCheck className="text-blue-600 text-xs" />
                            )}
                          </div>
                        </button>
                        <span
                          className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
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
                          className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/50 border-neutral-600/50"
                              : "bg-white/80 border-gray-200/50"
                          }`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div
                              className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
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
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-base sm:text-lg font-semibold mb-3 transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                Skill Forge Projects
                              </h4>
                              <div
                                className={`grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <FiUsers className="text-green-500 text-sm flex-shrink-0" />
                                  <span>Get eager learners</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <FiHeart className="text-red-500 text-sm flex-shrink-0" />
                                  <span>No payment required</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <FiGift className="text-purple-500 text-sm flex-shrink-0" />
                                  <span>Help others learn</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <FiTrendingUp className="text-blue-500 text-sm flex-shrink-0" />
                                  <span>Build your network</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-blue-950/20 border border-blue-800/20"
                                : "bg-blue-50/70 border border-blue-200/30"
                            }`}
                          >
                            <p
                              className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              <FiTarget className="inline mr-2 text-blue-500 flex-shrink-0" />
                              <strong>Good for:</strong> Projects where you want
                              to teach, share knowledge, or work with people who
                              are learning - no money involved.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Section - Enhanced Design */}
                  {!form.isSkillForge && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="premium-label">
                          Project Budget
                        </label>
                        {form.currency !== "INR" && (
                          <button
                            type="button"
                            onClick={updateExchangeRates}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors duration-300 ${
                              theme === "dark"
                                ? "text-blue-400 hover:bg-blue-900/30"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                          >
                            <FiRefreshCw className="text-xs" />
                            Update Rates
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Professional Currency Dropdown */}
                        <div className="relative z-50">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCurrencyDropdownOpen(
                                !isCurrencyDropdownOpen
                              );
                            }}
                            className="premium-input flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 text-left">
                              <span className="text-lg sm:text-xl">
                                {
                                  currencyOptions.find(
                                    (opt) => opt.code === form.currency
                                  )?.flag
                                }
                              </span>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="font-medium">
                                  {
                                    currencyOptions.find(
                                      (opt) => opt.code === form.currency
                                    )?.code
                                  }
                                </span>
                                <span
                                  className={`text-sm ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  (
                                  {
                                    currencyOptions.find(
                                      (opt) => opt.code === form.currency
                                    )?.symbol
                                  }
                                  )
                                </span>
                              </div>
                            </div>
                            <FiChevronDown
                              className={`text-lg transition-transform duration-200 ${
                                isCurrencyDropdownOpen
                                  ? "rotate-180"
                                  : "rotate-0"
                              } ${
                                  : "text-gray-500"
                              }`}
                            />
                          </button>

                          {/* Professional Dropdown Menu */}
                          {isCurrencyDropdownOpen && (
                            <div
                              className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden premium-glass"
                              style={{
                                zIndex: 9999,
                              }}
                            >
                              {currencyOptions.map((option) => (
                                <button
                                  key={option.code}
                                  type="button"
                                  onClick={() =>
                                    handleCurrencySelect(option.code)
                                  }
                                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center gap-2 sm:gap-3 transition-all duration-200 ${
                                    form.currency === option.code
                                      ? theme === "dark"
                                        ? "bg-blue-900/50 text-blue-400"
                                        : "bg-blue-50 text-blue-600"
                                      : theme === "dark"
                                      ? "text-white hover:bg-neutral-700/50"
                                      : "text-gray-900 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="text-lg sm:text-xl">
                                    {option.flag}
                                  </span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-1">
                                    <span className="font-medium text-sm sm:text-base">
                                      {option.code}
                                    </span>
                                    <span
                                      className={`text-xs sm:text-sm ${
                                        form.currency === option.code
                                          ? theme === "dark"
                                            ? "text-blue-300"
                                            : "text-blue-500"
                                          : theme === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      ({option.symbol})
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs sm:text-sm ${
                                      form.currency === option.code
                                        ? theme === "dark"
                                          ? "text-blue-300"
                                          : "text-blue-500"
                                        : theme === "dark"
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {form.currency === option.code && (
                                    <FiCheck
                                      className={`text-sm ${
                                        theme === "dark"
                                          ? "text-blue-400"
                                          : "text-blue-600"
                                      }`}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="Enter amount"
                          type="number"
                          min="0"
                          className={`sm:col-span-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 text-base sm:text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500 focus:ring-cyan-500/30 focus:border-cyan-500"
                              : "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500"
                          }`}
                          required
                        />
                      </div>

                      {/* Currency Conversion Display */}
                      {form.currency !== "INR" && convertedAmount && (
                        <div
                          className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-neutral-800/40 border-neutral-600/50"
                              : "bg-gray-50/80 border-gray-200/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  theme === "dark"
                                    ? "bg-green-400"
                                    : "bg-green-500"
                                }`}
                              ></div>
                              <span
                                className={`text-xs sm:text-sm font-medium ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Converted to INR:
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm sm:text-base font-semibold ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                ₹{convertedAmount}
                              </span>
                              <span
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                @
                                {
                                  exchangeRates[
                                    form.currency as keyof typeof exchangeRates
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skill Forge Payment Display */}
                  {form.isSkillForge && (
                    <div
                      className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-neutral-800/60 border-blue-500/20"
                          : "bg-blue-50/50 border-blue-200/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <div
                          className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"
                          }`}
                        >
                          <FiGift
                            className={`text-lg sm:text-xl ${
                              theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-base sm:text-lg font-semibold mb-1 transition-colors duration-300 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            Experience-Based Collaboration
                          </p>
                          <p
                            className={`text-xs sm:text-sm transition-colors duration-300 ${
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
                    <div className="p-3 sm:p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                      <p className="text-red-400 font-medium text-sm sm:text-base">
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 sm:p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                      <p className="text-green-400 font-medium text-sm sm:text-base">
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <ProfessionalButton
                    onClick={() => {}} // Form submission handled by type="submit"
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                    loadingText="Creating Collaboration..."
                    variant="primary"
                    size="lg"
                    icon={
                      !submitting &&
                      (form.isSkillForge ? (
                        <FiBriefcase className="text-base sm:text-xl" />
                      ) : (
                        <FiTarget className="text-base sm:text-xl" />
                      ))
                    }
                    className="w-full"
                  >
                    {form.isSkillForge
                      ? "Launch Skill Forge Project"
                      : "Create Professional Project"}
                  </ProfessionalButton>
                </div>
              </form>
            </div>
          </main>
        </div>
        {/* Glows - Hidden on mobile for better performance */}
        {theme === "dark" && (
          <>
            <div className="hidden sm:block fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
            <div className="hidden sm:block fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
          </>
        )}
      </div>
    </>
  );
}
