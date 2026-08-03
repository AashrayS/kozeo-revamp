"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiZap,
  FiLayers,
  FiAward,
  FiUsers,
  FiShield,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiFilter,
  FiSearch,
  FiX,
  FiBriefcase,
  FiTrendingUp,
} from "react-icons/fi";
import { Spotlight } from "@/components/core/spotlight";
import { useUser } from "../../../store/hooks";
import { isAdminUser } from "../../../utilities/api";

interface SpeedrunItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  durationMinutes: number;
  badge: string;
  status: "Live" | "Draft" | "Archived";
}

interface WorkSprintItem {
  id: string;
  title: string;
  poster: string;
  reward: string;
  deadlineDays: number;
  totalSlots: number;
  status: "Active" | "Completed" | "Pending Approval";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "speedruns" | "sprints" | "escrow" | "users">("overview");

  // Speedruns State & Modals
  const [speedruns, setSpeedruns] = useState<SpeedrunItem[]>([
    {
      id: "sr-1",
      title: "React 19 Server Actions Speedrun",
      category: "Frontend",
      difficulty: "Intermediate",
      durationMinutes: 45,
      badge: "React Server Specialist",
      status: "Live",
    },
    {
      id: "sr-2",
      title: "GraphQL Schema Optimization",
      category: "Backend",
      difficulty: "Advanced",
      durationMinutes: 60,
      badge: "GraphQL Architect",
      status: "Live",
    },
    {
      id: "sr-3",
      title: "Monochrome Glassmorphic UI Challenge",
      category: "UI/UX",
      difficulty: "Beginner",
      durationMinutes: 30,
      badge: "UI Craftsmanship",
      status: "Live",
    },
  ]);

  const [isSpeedrunModalOpen, setIsSpeedrunModalOpen] = useState(false);
  const [newSpeedrun, setNewSpeedrun] = useState({
    title: "",
    category: "Frontend",
    difficulty: "Intermediate",
    durationMinutes: 45,
    badge: "",
  });

  // Work Sprints State & Modals
  const [workSprints, setWorkSprints] = useState<WorkSprintItem[]>([
    {
      id: "sp-1",
      title: "Real-time Notification Engine",
      poster: "Vercel Labs",
      reward: "$500",
      deadlineDays: 5,
      totalSlots: 4,
      status: "Active",
    },
    {
      id: "sp-2",
      title: "Next.js Turbopack Cache Plugin",
      poster: "Kozeo Core",
      reward: "$750",
      deadlineDays: 7,
      totalSlots: 3,
      status: "Active",
    },
    {
      id: "sp-3",
      title: "Escrow Smart Contract Integration",
      poster: "DeFi Capital",
      reward: "$1,200",
      deadlineDays: 10,
      totalSlots: 2,
      status: "Pending Approval",
    },
  ]);

  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [newSprint, setNewSprint] = useState({
    title: "",
    poster: "",
    reward: "$500",
    deadlineDays: 5,
    totalSlots: 3,
  });

  const isAdmin = isAdminUser(user);

  // Handlers
  const handleCreateSpeedrun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeedrun.title || !newSpeedrun.badge) return;

    const item: SpeedrunItem = {
      id: `sr-${Date.now()}`,
      title: newSpeedrun.title,
      category: newSpeedrun.category,
      difficulty: newSpeedrun.difficulty,
      durationMinutes: Number(newSpeedrun.durationMinutes),
      badge: newSpeedrun.badge,
      status: "Live",
    };

    setSpeedruns([item, ...speedruns]);
    setNewSpeedrun({ title: "", category: "Frontend", difficulty: "Intermediate", durationMinutes: 45, badge: "" });
    setIsSpeedrunModalOpen(false);
  };

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprint.title || !newSprint.poster) return;

    const item: WorkSprintItem = {
      id: `sp-${Date.now()}`,
      title: newSprint.title,
      poster: newSprint.poster,
      reward: newSprint.reward,
      deadlineDays: Number(newSprint.deadlineDays),
      totalSlots: Number(newSprint.totalSlots),
      status: "Active",
    };

    setWorkSprints([item, ...workSprints]);
    setNewSprint({ title: "", poster: "", reward: "$500", deadlineDays: 5, totalSlots: 3 });
    setIsSprintModalOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="p-4 rounded-3xl bg-container-2 border border-container-3 text-text-1 text-3xl mb-4">
          <FiShield />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h2>
        <p className="text-sm text-text-3 max-w-md mb-6">
          The Admin Control Center is restricted to authorized platform administrators.
        </p>
        <button
          onClick={() => router.push("/Atrium")}
          className="px-6 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md"
        >
          Return to Mission Control
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-1 pb-24">
      {/* Header Banner */}
      <div className="mb-10 p-8 rounded-3xl backdrop-blur-xl border border-container-3 bg-container-1 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FiShield className="text-9xl text-text-1" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-state-hover border border-container-3 mb-4 text-text-2">
          <FiShield className="text-text-1" /> Platform Control Center
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Admin Dashboard
        </h1>
        <p className="text-lg text-text-3 max-w-2xl leading-relaxed">
          Manage platform Speedruns, startup Work Sprints, escrow milestone authorizations, and candidate reputation signals.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-container-3">
          <button
            onClick={() => setIsSpeedrunModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            <FiPlus /> Create Speedrun
          </button>

          <button
            onClick={() => setIsSprintModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            <FiPlus /> Create Work Sprint
          </button>

          <button
            onClick={() => router.push("/admin/withdraw-requests")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            <FiDollarSign /> Withdraw Requests
          </button>

          <button
            onClick={() => router.push("/admin/discussion-rooms")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            Room Moderation
          </button>

          <button
            onClick={() => router.push("/admin/settings")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
          >
            Admin Settings
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-container-3">
        {[
          { id: "overview", label: "Overview Analytics", icon: FiBarChart2 },
          { id: "speedruns", label: "Speedruns Manager", icon: FiZap },
          { id: "sprints", label: "Work Sprints", icon: FiLayers },
          { id: "escrow", label: "Escrow Audits", icon: FiDollarSign },
          { id: "users", label: "Users & Signals", icon: FiUsers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-text-1 text-container-1 shadow-md scale-105"
                  : "bg-container-1 border border-container-3 text-text-3 hover:text-text-1 hover:bg-state-hover"
              }`}
            >
              <Icon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Analytics Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden">
              <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Total Speedruns</span>
                <span className="text-3xl font-extrabold text-text-1">{speedruns.length} Active</span>
                <span className="text-xs text-text-3 block mt-2">1,240+ Badges Awarded</span>
              </div>
            </div>

            <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden">
              <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Active Work Sprints</span>
                <span className="text-3xl font-extrabold text-text-1">{workSprints.length} Live</span>
                <span className="text-xs text-text-3 block mt-2">94% Completion Rate</span>
              </div>
            </div>

            <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden">
              <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Escrow Volume</span>
                <span className="text-3xl font-extrabold text-text-1">$24,500</span>
                <span className="text-xs text-text-3 block mt-2">100% Verified Stipends</span>
              </div>
            </div>

            <div className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden">
              <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Platform Builders</span>
                <span className="text-3xl font-extrabold text-text-1">8,420</span>
                <span className="text-xs text-text-3 block mt-2">+18% Monthly Growth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speedruns Manager Tab */}
      {activeTab === "speedruns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Speedrun Challenges</h2>
            <button
              onClick={() => setIsSpeedrunModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              <FiPlus /> New Speedrun
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {speedruns.map((sr) => (
              <div
                key={sr.id}
                className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col justify-between"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {sr.category}
                    </span>
                    <span className="text-xs text-text-3 font-semibold flex items-center gap-1">
                      <FiClock /> {sr.durationMinutes}m
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-1 mb-2">{sr.title}</h3>
                  <div className="p-3 rounded-2xl bg-container-2 border border-container-3/50 text-xs mb-4">
                    <span className="text-text-4 block uppercase font-semibold">Badge Award</span>
                    <span className="text-text-1 font-bold">{sr.badge}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-container-3 relative z-10">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 uppercase">
                    {sr.status}
                  </span>
                  <span className="text-xs font-semibold text-text-3">{sr.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Sprints Tab */}
      {activeTab === "sprints" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Active Work Sprints</h2>
            <button
              onClick={() => setIsSprintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              <FiPlus /> New Work Sprint
            </button>
          </div>

          <div className="space-y-4">
            {workSprints.map((sp) => (
              <div
                key={sp.id}
                className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {sp.status}
                    </span>
                    <span className="text-xs text-text-4 font-semibold">{sp.poster}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-1">{sp.title}</h3>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right">
                    <span className="text-xs text-text-4 block uppercase font-semibold">Stipend Reward</span>
                    <span className="text-base font-bold text-text-1">{sp.reward}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-4 block uppercase font-semibold">Deadline</span>
                    <span className="text-base font-bold text-text-1">{sp.deadlineDays} Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escrow Audits Tab */}
      {activeTab === "escrow" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Milestone Escrow Audits</h2>
              <p className="text-xs text-text-3 mt-1">Review locked deposits and authorize stipend payouts for completed Work Sprints.</p>
            </div>
            <button
              onClick={() => router.push("/admin/withdraw-requests")}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
            >
              <FiDollarSign /> View Withdrawal Requests
            </button>
          </div>

          <div className="space-y-4">
            {[
              { id: "esc-1", title: "Real-time Notification Engine", poster: "Vercel Labs", candidate: "alex_dev", amount: "$500", status: "Work Verified - Pending Release" },
              { id: "esc-2", title: "GraphQL Schema Optimization", poster: "DeFi Capital", candidate: "sarah_m", amount: "$750", status: "In Progress" },
              { id: "esc-3", title: "Monochrome Glassmorphic UI", poster: "Kozeo Core", candidate: "david_ui", amount: "$1,200", status: "Released" },
            ].map((esc) => (
              <div key={esc.id} className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {esc.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-1">{esc.title}</h3>
                  <span className="text-xs text-text-4 font-medium block">Poster: {esc.poster} • Candidate: {esc.candidate}</span>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-right">
                    <span className="text-xs text-text-4 block uppercase font-semibold">Locked Stipend</span>
                    <span className="text-lg font-extrabold text-text-1">{esc.amount}</span>
                  </div>
                  {esc.status.includes("Pending Release") && (
                    <button
                      onClick={() => alert(`Stipend of ${esc.amount} released to ${esc.candidate} successfully!`)}
                      className="px-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
                    >
                      Authorize Release
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users & Signals Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Users & Signal Engine Audit</h2>
              <p className="text-xs text-text-3 mt-1">Audit builder proof-of-work signals, badges awarded, and match rank multipliers.</p>
            </div>
            <button
              onClick={() => router.push("/admin/discussion-rooms")}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-bold text-xs hover:bg-state-hover transition-all"
            >
              Room Moderation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Alex Rivera", handle: "@alex_dev", role: "Developer", badges: 4, matchRank: "+18% Rank" },
              { name: "Sarah Chen", handle: "@sarah_m", role: "Design Engineer", badges: 6, matchRank: "+25% Rank" },
              { name: "Vercel Team", handle: "@vercel_labs", role: "Startup Host", badges: 12, matchRank: "Verified Host" },
            ].map((usr, i) => (
              <div key={i} className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col justify-between">
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {usr.role}
                    </span>
                    <span className="text-xs text-text-3 font-semibold">{usr.matchRank}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-1">{usr.name}</h3>
                  <span className="text-xs text-text-4 font-medium block mb-4">{usr.handle}</span>
                  <div className="p-3 rounded-2xl bg-container-2 border border-container-3/50 text-xs">
                    <span className="text-text-4 block uppercase font-semibold">Verified Badges</span>
                    <span className="text-text-1 font-bold">{usr.badges} Verified Signals</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Modal: Create Speedrun */}
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
                <h3 className="text-2xl font-bold text-text-1">Create Speedrun Challenge</h3>
                <p className="text-xs text-text-3">Publish a timed micro-skill challenge for candidates.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSpeedrun} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Router Speedrun"
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
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, difficulty: e.target.value })}
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
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={120}
                    value={newSpeedrun.durationMinutes}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, durationMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Badge Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js Specialist"
                    value={newSpeedrun.badge}
                    onChange={(e) => setNewSpeedrun({ ...newSpeedrun, badge: e.target.value })}
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
                  Publish Speedrun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Modal: Create Work Sprint */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsSprintModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              <FiX />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-2xl bg-container-2 text-text-1 text-xl font-bold border border-container-3">
                <FiLayers />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-text-1">Create Startup Work Sprint</h3>
                <p className="text-xs text-text-3">Host a production deliverable sprint with stipend reward.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Sprint Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Escrow Payment Gateway Integration"
                  value={newSprint.title}
                  onChange={(e) => setNewSprint({ ...newSprint, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Host / Startup Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe Labs"
                  value={newSprint.poster}
                  onChange={(e) => setNewSprint({ ...newSprint, poster: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Stipend</label>
                  <input
                    type="text"
                    required
                    placeholder="$500"
                    value={newSprint.reward}
                    onChange={(e) => setNewSprint({ ...newSprint, reward: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={newSprint.deadlineDays}
                    onChange={(e) => setNewSprint({ ...newSprint, deadlineDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Slots</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={newSprint.totalSlots}
                    onChange={(e) => setNewSprint({ ...newSprint, totalSlots: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSprintModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-3 font-semibold text-xs hover:text-text-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  Publish Work Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
