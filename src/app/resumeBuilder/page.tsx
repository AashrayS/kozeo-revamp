"use client";

import React, { useState, useEffect } from "react";
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

      {/* Glow Effects */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />

      <div className="min-h-screen relative z-10 flex flex-row theme-transition">
        <div className="flex-1 flex flex-col p-4 sm:p-8">
          <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 sm:px-6">
            {/* Main Coming Soon Section */}
            <div className="text-center mb-12">
              {/* Portfolio Icon with Animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl kozeo-glass flex items-center justify-center mb-6 shadow-xl">
                  <FiGlobe className="w-12 h-12 sm:w-16 sm:h-16 text-black dark:text-white animate-pulse-slow" />
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-black dark:text-white">
                Portfolio Builder
              </h1>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="kozeo-badge text-xs px-4 py-1.5 font-bold uppercase tracking-wider">
                  <FiZap className="inline w-4 h-4 mr-1 text-amber-500" />
                  Coming Soon
                </div>
              </div>

              <p className="text-lg sm:text-xl font-medium mb-8 max-w-2xl mx-auto text-text-3 leading-relaxed">
                Create stunning online portfolios in minutes. Just enter your
                basic information and showcase your work to the world.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16 w-full max-w-7xl">
              {[
                {
                  icon: FiEdit3,
                  title: "Simple Setup",
                  description:
                    "Just fill in your basic info and we'll create your portfolio",
                },
                {
                  icon: FiLayers,
                  title: "Beautiful Templates",
                  description:
                    "Choose from professionally designed portfolio layouts",
                },
                {
                  icon: FiImage,
                  title: "Showcase Your Work",
                  description:
                    "Display projects, skills, and achievements beautifully",
                },
                {
                  icon: FiGlobe,
                  title: "Instant Publishing",
                  description: "Get your own custom URL to share with anyone",
                },
                {
                  icon: FiShare2,
                  title: "Easy Sharing",
                  description: "Share your portfolio across social platforms",
                },
                {
                  icon: FiEye,
                  title: "Mobile Responsive",
                  description: "Looks perfect on all devices and screen sizes",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="kozeo-card p-6 flex flex-col justify-between group"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 p-3 rounded-2xl w-fit bg-container-2 border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-2 text-black dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-text-3">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notify Me Section */}
            <div className="w-full max-w-lg p-8 md:p-10 kozeo-card text-center">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-container-2 flex items-center justify-center border border-black/5 dark:border-white/10">
                      <FiBell className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-black dark:text-white mb-2">
                      Get Notified
                    </h3>
                    <p className="text-sm text-text-3">
                      Be the first to know when our portfolio builder launches
                    </p>
                  </div>

                  <form onSubmit={handleNotifyMe} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="kozeo-input text-center"
                      />
                    </div>

                    <button
                      type="submit"
                      className="kozeo-btn-primary w-full !py-3 shadow-md"
                    >
                      <FiMail className="w-4 h-4" />
                      Notify Me
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-container-3 flex items-center justify-center">
                    <FiMail className="w-8 h-8 text-black dark:text-white" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-black dark:text-white mb-2">
                    You're All Set!
                  </h3>
                  <p className="text-sm text-text-3">
                    We'll email you as soon as the portfolio builder is ready
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-12 text-center">
              <div className="kozeo-badge px-6 py-2.5 text-xs font-semibold tracking-wider uppercase">
                <FiCalendar className="w-4 h-4 mr-2" />
                Expected Launch: Q1 2026
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
