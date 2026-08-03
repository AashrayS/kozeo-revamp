"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBriefcase,
  FiZap,
  FiPlus,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiX,
  FiLayers,
  FiHelpCircle,
  FiArrowRight,
} from "react-icons/fi";
import { Spotlight } from "@/components/core/spotlight";

interface MainProject {
  id: string;
  title: string;
  category: string;
  budget: string;
  duration: string;
  applicantsCount: number;
  status: "Active" | "Completed" | "Draft";
}

interface SpeedrunChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeLimitMinutes: number;
  badgeAwarded: string;
  candidatesTested: number;
  status: "Live" | "Draft";
}

export default function BusinessPortalPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"projects" | "speedruns" | "escrow">("projects");

  // Main Projects State
  const [projects, setProjects] = useState<MainProject[]>([
    {
      id: "proj-1",
      title: "Real-time Analytics Dashboard & API Integration",
      category: "Full Stack",
      budget: "$2,500",
      duration: "3 Weeks",
      applicantsCount: 8,
      status: "Active",
    },
    {
      id: "proj-2",
      title: "Next.js 15 E-Commerce Mobile Web App",
      category: "Frontend",
      budget: "$1,800",
      duration: "2 Weeks",
      applicantsCount: 12,
      status: "Active",
    },
  ]);

  // Speedrun Challenges State
  const [speedruns, setSpeedruns] = useState<SpeedrunChallenge[]>([
    {
      id: "sr-101",
      title: "React 19 Server Actions Speedrun",
      category: "Frontend",
      difficulty: "Intermediate",
      timeLimitMinutes: 45,
      badgeAwarded: "React 19 Specialist",
      candidatesTested: 24,
      status: "Live",
    },
    {
      id: "sr-102",
      title: "GraphQL Schema Optimization Challenge",
      category: "Backend",
      difficulty: "Advanced",
      timeLimitMinutes: 60,
      badgeAwarded: "GraphQL Architect",
      candidatesTested: 15,
      status: "Live",
    },
  ]);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSpeedrunModalOpen, setIsSpeedrunModalOpen] = useState(false);

  // Form States
  const [newProject, setNewProject] = useState({
    title: "",
    category: "Full Stack",
    budget: "$1,500",
    duration: "2 Weeks",
  });

  const [newSpeedrun, setNewSpeedrun] = useState({
    title: "",
    category: "Frontend",
    difficulty: "Intermediate" as const,
    timeLimitMinutes: 45,
    badgeAwarded: "",
  });

  // Handlers
  const handlePostProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    const item: MainProject = {
      id: `proj-${Date.now()}`,
      title: newProject.title,
      category: newProject.category,
      budget: newProject.budget,
      duration: newProject.duration,
      applicantsCount: 0,
      status: "Active",
    };

    setProjects([item, ...projects]);
    setNewProject({ title: "", category: "Full Stack", budget: "$1,500", duration: "2 Weeks" });
    setIsProjectModalOpen(false);
  };

  const handleCreateSpeedrun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeedrun.title || !newSpeedrun.badgeAwarded) return;

    const item: SpeedrunChallenge = {
      id: `sr-${Date.now()}`,
      title: newSpeedrun.title,
      category: newSpeedrun.category,
      difficulty: newSpeedrun.difficulty,
      timeLimitMinutes: Number(newSpeedrun.timeLimitMinutes),
      badgeAwarded: newSpeedrun.badgeAwarded,
      candidatesTested: 0,
      status: "Live",
    };

    setSpeedruns([item, ...speedruns]);
    setNewSpeedrun({ title: "", category: "Frontend", difficulty: "Intermediate", timeLimitMinutes: 45, badgeAwarded: "" });
    setIsSpeedrunModalOpen(false);
  };

  return (
    <div className="min-h-screen text-text-1 pb-24">
      {/* Header Banner */}
      <div className="mb-8 p-8 rounded-3xl backdrop-blur-xl border border-container-3 bg-container-1 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FiBriefcase className="text-9xl text-text-1" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-state-hover border border-container-3 mb-4 text-text-2">
          <FiBriefcase className="text-text-1" /> Employer & Business Portal
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Business Hiring Center
        </h1>
        <p className="text-lg text-text-3 max-w-2xl leading-relaxed">
          Post Main Projects for developer hiring and launch Speedrun Skill Challenges to screen candidates with verified signal scores.
        </p>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-container-3">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            <FiPlus /> Post Main Project
          </button>

          <button
            onClick={() => setIsSpeedrunModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            <FiZap /> Launch Speedrun Test
          </button>
        </div>
      </div>

      {/* Distinction Explainer Banner */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-bold text-base shadow-xs">
                <FiBriefcase />
              </span>
              <div>
                <h3 className="text-base font-bold text-text-1">Main Projects (Hiring & Gigs)</h3>
                <span className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Full Project Deliverables</span>
              </div>
            </div>
            <p className="text-xs text-text-3 leading-relaxed">
              Full client deliverables with milestone budgets. Developers submit proposals and complete project milestones for direct payout.
            </p>
          </div>
        </div>

        <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-bold text-base shadow-xs">
                <FiZap />
              </span>
              <div>
                <h3 className="text-base font-bold text-text-1">Speedruns (Candidate Screening)</h3>
                <span className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Micro-Skill Assessments</span>
              </div>
            </div>
            <p className="text-xs text-text-3 leading-relaxed">
              30–60 minute timed micro-skill tests hosted by your business to automatically evaluate candidate skills with verified signal scores.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-container-3">
        {[
          { id: "projects", label: "Main Projects (Gigs)", icon: FiBriefcase, count: projects.length },
          { id: "speedruns", label: "Hosted Speedruns", icon: FiZap, count: speedruns.length },
          { id: "escrow", label: "Project Escrow Funds", icon: FiDollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-text-1 text-container-1 shadow-md scale-105"
                  : "bg-container-1 border border-container-3 text-text-3 hover:text-text-1 hover:bg-state-hover"
              }`}
            >
              <Icon /> {tab.label} {tab.count !== undefined && <span className="opacity-70">({tab.count})</span>}
            </button>
          );
        })}
      </div>

      {/* Section 1: Main Projects */}
      {activeSection === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Main Client Projects</h2>
              <p className="text-xs text-text-3 mt-1">Manage active project bounties, candidate proposals, and milestones.</p>
            </div>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              <FiPlus /> Post Project
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 uppercase">
                      {p.status}
                    </span>
                    <span className="text-xs text-text-4 font-semibold">{p.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-1">{p.title}</h3>
                  <span className="text-xs text-text-3 mt-1 block">
                    Duration: {p.duration} • {p.applicantsCount} Candidate Proposals Received
                  </span>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right">
                    <span className="text-xs text-text-4 block uppercase font-semibold">Total Budget</span>
                    <span className="text-xl font-extrabold text-text-1">{p.budget}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/gigs`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-bold text-xs hover:bg-state-hover transition-all"
                  >
                    View Proposals <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Speedrun Skill Challenges */}
      {activeSection === "speedruns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Hosted Speedrun Challenges</h2>
              <p className="text-xs text-text-3 mt-1">Timed micro-skill tests hosted by your business to evaluate candidate signal scores.</p>
            </div>
            <button
              onClick={() => setIsSpeedrunModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              <FiPlus /> Create Speedrun
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speedruns.map((sr) => (
              <div
                key={sr.id}
                className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col justify-between"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {sr.category}
                    </span>
                    <span className="text-xs text-text-3 font-semibold flex items-center gap-1">
                      <FiClock /> {sr.timeLimitMinutes}m
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-1 mb-2">{sr.title}</h3>
                  <div className="p-3 rounded-2xl bg-container-2 border border-container-3/50 text-xs mb-4">
                    <span className="text-text-4 block uppercase font-semibold">Verified Badge Award</span>
                    <span className="text-text-1 font-bold block">{sr.badgeAwarded}</span>
                    <span className="text-xs text-text-3 mt-1 block">{sr.candidatesTested} Candidates Tested</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-container-3 relative z-10">
                  <span className="text-xs font-semibold text-text-3">Difficulty: {sr.difficulty}</span>
                  <button
                    onClick={() => router.push(`/speedruns`)}
                    className="px-3 py-1.5 rounded-xl bg-container-2 border border-container-3 text-text-1 font-bold text-xs hover:bg-state-hover transition-all"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Escrow Funds */}
      {activeSection === "escrow" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Escrow Funds</h2>
            <p className="text-xs text-text-3 mt-1">Locked funds held safely for main project milestone releases.</p>
          </div>

          <div className="p-8 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl relative overflow-hidden">
            <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={160} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Total Active Project Escrow</span>
                <span className="text-4xl font-extrabold text-text-1">$4,300.00</span>
                <span className="text-xs text-text-3 block mt-2">Protected by Kozeo Milestone Escrow</span>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md"
              >
                Fund New Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Post Main Project */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              <FiX />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-2xl bg-container-2 text-text-1 text-xl font-bold border border-container-3">
                <FiBriefcase />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-text-1">Post Main Project</h3>
                <p className="text-xs text-text-3">Create a full gig bounty for developer proposals.</p>
              </div>
            </div>

            <form onSubmit={handlePostProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 15 E-Commerce Mobile Web App"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Total Budget</label>
                  <input
                    type="text"
                    required
                    placeholder="$1,500"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Duration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 Weeks"
                  value={newProject.duration}
                  onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-3 font-semibold text-xs hover:text-text-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  Publish Main Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Speedrun Challenge */}
      {isSpeedrunModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsSpeedrunModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              <FiX />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-2xl bg-container-2 text-text-1 text-xl font-bold border border-container-3">
                <FiZap />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-text-1">Launch Speedrun Challenge</h3>
                <p className="text-xs text-text-3">Create a 30-60 min timed skill test to evaluate applicants.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSpeedrun} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL Schema Optimization Challenge"
                  value={newSpeedrun.title}
                  onChange={(e) => setNewSpeedrun({ ...newSpeedrun, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Category</label>
                  <select
                    value={newSpeedrun.category}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Difficulty</label>
                  <select
                    value={newSpeedrun.difficulty}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={120}
                    value={newSpeedrun.timeLimitMinutes}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Badge Awarded</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GraphQL Specialist"
                    value={newSpeedrun.badgeAwarded}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, badgeAwarded: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSpeedrunModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-3 font-semibold text-xs hover:text-text-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  Launch Speedrun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
