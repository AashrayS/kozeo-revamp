"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiZap, FiClock, FiAward, FiPlay, FiCheckCircle, FiFilter, FiArrowRight, FiShield, FiCode } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { isAuthenticated } from "../../../utilities/api";

interface Speedrun {
  id: string;
  title: string;
  category: "Frontend" | "Backend" | "UI/UX" | "AI/ML";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  badge: string;
  signalMultiplier: string;
  participantsCount: number;
  description: string;
  tags: string[];
  status: "Live" | "Upcoming" | "Completed";
}

const mockSpeedruns: Speedrun[] = [
  {
    id: "sr-1",
    title: "React Performance Optimization Blitz",
    category: "Frontend",
    difficulty: "Advanced",
    durationMinutes: 45,
    badge: "React Speedmaster",
    signalMultiplier: "+15% Skill Signal",
    participantsCount: 142,
    description: "Refactor a heavy React component tree to eliminate unnecessary re-renders using useMemo, useCallback, and React.memo.",
    tags: ["React 19", "Performance", "TypeScript"],
    status: "Live",
  },
  {
    id: "sr-2",
    title: "REST API Endpoint & Cache Layer",
    category: "Backend",
    difficulty: "Intermediate",
    durationMinutes: 30,
    badge: "API Ninja",
    signalMultiplier: "+12% Reliability Signal",
    participantsCount: 98,
    description: "Build an idempotent Express / Next.js API route with Redis caching and rate-limiting middleware under time pressure.",
    tags: ["Node.js", "Redis", "Security"],
    status: "Live",
  },
  {
    id: "sr-3",
    title: "Glassmorphism UI Component Suite",
    category: "UI/UX",
    difficulty: "Intermediate",
    durationMinutes: 40,
    badge: "UI Craftsman",
    signalMultiplier: "+10% Proof Signal",
    participantsCount: 210,
    description: "Craft a responsive modal and dark/light glass card system using Vanilla CSS custom properties & smooth animations.",
    tags: ["CSS Architecture", "Design System", "Aesthetics"],
    status: "Live",
  },
  {
    id: "sr-4",
    title: "LLM Prompt Evaluation Pipeline",
    category: "AI/ML",
    difficulty: "Advanced",
    durationMinutes: 60,
    badge: "AI Architect",
    signalMultiplier: "+18% Skill Signal",
    participantsCount: 76,
    description: "Implement a structured output validator for LLM JSON responses with retry mechanisms and token tracking.",
    tags: ["Python", "LangChain", "JSON Schema"],
    status: "Upcoming",
  },
];

export default function SpeedrunsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeSpeedrun, setActiveSpeedrun] = useState<Speedrun | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const filteredSpeedruns = selectedCategory === "All"
    ? mockSpeedruns
    : mockSpeedruns.filter((s) => s.category === selectedCategory);

  const handleStartSpeedrun = (speedrun: Speedrun) => {
    setActiveSpeedrun(speedrun);
    setIsModalOpen(true);
    setSubmittedSuccess(false);
    setSubmissionUrl("");
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "light" ? "bg-gradient-light text-text-1" : "bg-gradient-dark text-text-1"}`}>
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
          {/* Top Banner & Signal Engine Architecture Header */}
          <div className="mb-10 p-8 rounded-3xl backdrop-blur-xl border border-container-3 bg-container-1 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <FiZap className="text-9xl text-text-1" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-state-hover border border-container-3 mb-4 text-text-2">
              <FiZap className="text-amber-500" /> Platform Signal Engine
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Speedruns
            </h1>
            <p className="text-lg text-text-3 max-w-2xl leading-relaxed">
              Timed, high-stakes skill challenges. Complete Speedruns to generate verified skill signals, earn portfolio badges, and boost your project matching rank.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-container-3">
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Speedruns Live</span>
                <span className="text-2xl font-bold text-text-1">3 Active</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Avg. Duration</span>
                <span className="text-2xl font-bold text-text-1">45 Mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Badges Awarded</span>
                <span className="text-2xl font-bold text-text-1">1,240+</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Signal Impact</span>
                <span className="text-2xl font-bold text-emerald-500">+15% Match Rank</span>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2">
              {["All", "Frontend", "Backend", "UI/UX", "AI/ML"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-text-1 text-container-1 shadow-md scale-105"
                      : "bg-container-1 border border-container-3 text-text-3 hover:text-text-1 hover:bg-state-hover"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-text-4 font-semibold uppercase tracking-wider">
              <FiFilter /> Filtered by Category
            </div>
          </div>

          {/* Speedruns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSpeedruns.map((speedrun) => (
              <div
                key={speedrun.id}
                className="group p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl hover:border-text-1/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      speedrun.status === "Live"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {speedrun.status === "Live" ? "● Live Now" : "Upcoming"}
                    </span>

                    <span className="flex items-center gap-1.5 text-xs text-text-3 font-medium bg-container-2 px-3 py-1 rounded-full">
                      <FiClock className="text-amber-500" /> {speedrun.durationMinutes} mins
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-text-1 mb-2 group-hover:text-amber-500 transition-colors">
                    {speedrun.title}
                  </h2>

                  <p className="text-sm text-text-3 mb-6 line-clamp-2 leading-relaxed">
                    {speedrun.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {speedrun.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-container-2 text-text-3 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-container-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiAward className="text-amber-500 text-lg" />
                    <div>
                      <span className="text-xs font-bold block text-text-1">{speedrun.badge}</span>
                      <span className="text-[11px] text-emerald-500 font-semibold">{speedrun.signalMultiplier}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartSpeedrun(speedrun)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    <FiPlay /> Start Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Speedrun Execution Modal */}
      {isModalOpen && activeSpeedrun && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              ✕
            </button>

            {!submittedSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 text-xl font-bold">
                    <FiZap />
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-text-1">{activeSpeedrun.title}</h3>
                    <span className="text-xs text-text-3 font-medium">Time Remaining: {activeSpeedrun.durationMinutes}:00</span>
                  </div>
                </div>

                <p className="text-sm text-text-3 mb-6 leading-relaxed">
                  {activeSpeedrun.description}
                </p>

                <div className="p-4 rounded-2xl bg-container-2 mb-6 border border-container-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-text-4 mb-2">Evaluation Criteria</h4>
                  <ul className="text-xs text-text-2 space-y-1.5 list-disc list-inside">
                    <li>Clean TypeScript / CSS implementation without lint warnings</li>
                    <li>Optimal state lifecycle management</li>
                    <li>Verifiable PR or GitHub Repository submission link</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmitSolution} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-4 mb-2">
                      Submit Repository / PR / Code Sandbox URL
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/username/speedrun-solution"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 placeholder:text-text-4 focus:outline-none focus:border-text-1 text-sm transition-all"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-2xl border border-container-3 text-text-3 font-semibold text-sm hover:bg-state-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? "Evaluating Solution..." : "Submit Solution"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl mx-auto border border-emerald-500/20">
                  <FiCheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-text-1">Speedrun Evaluated & Verified!</h3>
                <p className="text-sm text-text-3 max-w-md mx-auto">
                  Congratulations! Your submission generated <strong className="text-emerald-500">{activeSpeedrun.signalMultiplier}</strong> and unlocked the <strong className="text-text-1">{activeSpeedrun.badge}</strong> badge in your candidate profile.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all"
                  >
                    View Updated Portfolio Signals
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
