"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FiFileText,
  FiUser,
  FiEdit3,
  FiDownload,
  FiBriefcase,
  FiAward,
  FiMail,
  FiCalendar,
  FiZap,
  FiBell,
  FiGlobe,
  FiImage,
  FiLayers,
  FiShare2,
  FiEye,
} from "react-icons/fi";

export default function PortfolioBuilderPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      // Here you would typically send the email to your backend
      console.log("Email submitted for notifications:", email);
    }
  };

  return (
    <>
      <Header logoText="Kozeo" />

      {/* Glow Effects */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col p-4 sm:p-8">
          <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 sm:px-6">
            {/* Main Coming Soon Section */}
            <div className="text-center mb-12">
              {/* Portfolio Icon with Animation */}
              <div className="relative mb-8">
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                    theme === "light"
                      ? "bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200"
                      : "bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/50"
                  }`}
                >
                  <FiGlobe
                    className={`w-12 h-12 sm:w-16 sm:h-16 animate-pulse ${
                      theme === "light" ? "text-blue-600" : "text-blue-400"
                    }`}
                  />
                </div>

                {/* Floating Feature Icons */}
                {/* <div className="absolute -top-4 -left-4 animate-bounce delay-100">
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "light" ? "bg-green-100" : "bg-green-900/30"
                    }`}
                  >
                    <FiEdit3
                      className={`w-4 h-4 ${
                        theme === "light" ? "text-green-600" : "text-green-400"
                      }`}
                    />
                  </div>
                </div> */}
                {/* <div className="absolute -top-4 -right-4 animate-bounce delay-300">
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "light" ? "bg-purple-100" : "bg-purple-900/30"
                    }`}
                  >
                    <FiDownload
                      className={`w-4 h-4 ${
                        theme === "light"
                          ? "text-purple-600"
                          : "text-purple-400"
                      }`}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce delay-500">
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "light" ? "bg-orange-100" : "bg-orange-900/30"
                    }`}
                  >
                    <FiAward
                      className={`w-4 h-4 ${
                        theme === "light"
                          ? "text-orange-600"
                          : "text-orange-400"
                      }`}
                    />
                  </div>
                </div> */}
              </div>

              <h1
                className={`text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Portfolio Builder
              </h1>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    theme === "light"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-yellow-950/50 border-yellow-800/50 text-yellow-300"
                  }`}
                >
                  <FiZap className="inline w-4 h-4 mr-2" />
                  Coming Soon
                </div>
              </div>

              <p
                className={`text-lg sm:text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Create stunning online portfolios in minutes. Just enter your
                basic information and showcase your work to the world.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 w-full max-w-7xl">
              {[
                {
                  icon: FiEdit3,
                  title: "Simple Setup",
                  description:
                    "Just fill in your basic info and we'll create your portfolio",
                  color: "blue",
                },
                {
                  icon: FiLayers,
                  title: "Beautiful Templates",
                  description:
                    "Choose from professionally designed portfolio layouts",
                  color: "purple",
                },
                {
                  icon: FiImage,
                  title: "Showcase Your Work",
                  description:
                    "Display projects, skills, and achievements beautifully",
                  color: "green",
                },
                {
                  icon: FiGlobe,
                  title: "Instant Publishing",
                  description: "Get your own custom URL to share with anyone",
                  color: "orange",
                },
                {
                  icon: FiShare2,
                  title: "Easy Sharing",
                  description: "Share your portfolio across social platforms",
                  color: "red",
                },
                {
                  icon: FiEye,
                  title: "Mobile Responsive",
                  description: "Looks perfect on all devices and screen sizes",
                  color: "cyan",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 h-full ${
                    theme === "light"
                      ? "bg-white/90 border-gray-200/60 hover:shadow-2xl hover:border-gray-300/80"
                      : "bg-neutral-900/80 border-neutral-700/50 hover:shadow-2xl hover:border-neutral-600/70"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`mb-6 p-4 rounded-xl w-fit transition-all duration-300 group-hover:scale-110 ${
                        feature.color === "blue"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
                            : "bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700/50"
                          : feature.color === "purple"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
                            : "bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700/50"
                          : feature.color === "green"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
                            : "bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700/50"
                          : feature.color === "orange"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
                            : "bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-700/50"
                          : feature.color === "red"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
                            : "bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-700/50"
                          : feature.color === "cyan"
                          ? theme === "light"
                            ? "bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200"
                            : "bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border border-cyan-700/50"
                          : theme === "light"
                          ? "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
                          : "bg-gradient-to-br from-gray-900/40 to-gray-800/40 border border-gray-700/50"
                      }`}
                    >
                      <feature.icon
                        className={`w-8 h-8 transition-all duration-300 ${
                          feature.color === "blue"
                            ? theme === "light"
                              ? "text-blue-600"
                              : "text-blue-400"
                            : feature.color === "purple"
                            ? theme === "light"
                              ? "text-purple-600"
                              : "text-purple-400"
                            : feature.color === "green"
                            ? theme === "light"
                              ? "text-green-600"
                              : "text-green-400"
                            : feature.color === "orange"
                            ? theme === "light"
                              ? "text-orange-600"
                              : "text-orange-400"
                            : feature.color === "red"
                            ? theme === "light"
                              ? "text-red-600"
                              : "text-red-400"
                            : feature.color === "cyan"
                            ? theme === "light"
                              ? "text-cyan-600"
                              : "text-cyan-400"
                            : theme === "light"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-3 ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-base leading-relaxed flex-grow ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notify Me Section */}
            <div
              className={`w-full max-w-lg p-10 rounded-3xl border backdrop-blur-md shadow-2xl ${
                theme === "light"
                  ? "bg-white/95 border-gray-200/60"
                  : "bg-neutral-900/90 border-neutral-700/50"
              }`}
            >
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <FiBell
                      className={`w-8 h-8 mx-auto mb-3 ${
                        theme === "light" ? "text-blue-600" : "text-blue-400"
                      }`}
                    />
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      Get Notified
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Be the first to know when our portfolio builder launches
                    </p>
                  </div>

                  <form onSubmit={handleNotifyMe} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-medium mb-2 ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === "light"
                            ? "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                            : "bg-neutral-800 border-neutral-600 text-white placeholder-gray-400"
                        }`}
                      />
                    </div>

                    <ProfessionalButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => {}}
                      icon={<FiMail className="w-4 h-4" />}
                    >
                      Notify Me
                    </ProfessionalButton>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      theme === "light" ? "bg-green-100" : "bg-green-900/30"
                    }`}
                  >
                    <FiMail
                      className={`w-8 h-8 ${
                        theme === "light" ? "text-green-600" : "text-green-400"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    You're All Set!
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    We'll email you as soon as the portfolio builder is ready
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-16 text-center">
              <div
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-base font-medium shadow-lg ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-2 border-blue-200"
                    : "bg-gradient-to-r from-blue-950/50 to-purple-950/50 text-blue-300 border-2 border-blue-800/50"
                }`}
              >
                <FiCalendar className="w-5 h-5" />
                Expected Launch: Q1 2026
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
