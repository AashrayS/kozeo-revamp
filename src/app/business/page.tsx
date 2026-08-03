"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiLayers,
  FiZap,
  FiPlus,
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiBriefcase,
  FiX,
  FiShield,
  FiAward,
} from "react-icons/fi";
import { Spotlight } from "@/components/core/spotlight";
import { useUser } from "../../../store/hooks";

interface WorkSprint {
  id: string;
  title: string;
  stipend: string;
  slots: number;
  filled: number;
  deadline: string;
  status: "Active" | "Completed" | "Draft";
}

export default function BusinessPortalPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"sprints" | "candidates" | "escrow">("sprints");

  const [mySprints, setMySprints] = useState<WorkSprint[]>([
    {
      id: "sp-101",
      title: "Real-time Notification Engine Deliverable",
      stipend: "$500",
      slots: 4,
      filled: 3,
      deadline: "5 Days",
      status: "Active",
    },
    {
      id: "sp-102",
      title: "Next.js App Router Cache Plugin",
      stipend: "$750",
      slots: 2,
      filled: 2,
      deadline: "7 Days",
      status: "Active",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSprint, setNewSprint] = useState({
    title: "",
    stipend: "$500",
    slots: 3,
    deadline: "5 Days",
  });

  const handlePostSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprint.title) return;

    const item: WorkSprint = {
      id: `sp-${Date.now()}`,
      title: newSprint.title,
      stipend: newSprint.stipend,
      slots: Number(newSprint.slots),
      filled: 0,
      deadline: newSprint.deadline,
      status: "Active",
    };

    setMySprints([item, ...mySprints]);
    setNewSprint({ title: "", stipend: "$500", slots: 3, deadline: "5 Days" });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen text-text-1 pb-24">
      {/* Header Banner */}
      <div className="mb-10 p-8 rounded-3xl backdrop-blur-xl border border-container-3 bg-container-1 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FiBriefcase className="text-9xl text-text-1" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-state-hover border border-container-3 mb-4 text-text-2">
          <FiBriefcase className="text-text-1" /> Startup & Employer Portal
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Business Work Sprint Hub
        </h1>
        <p className="text-lg text-text-3 max-w-2xl leading-relaxed">
          Host production Work Sprints, deposit stipends into secure escrow, and hire candidates with verified Speedrun signals.
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-container-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md"
          >
            <FiPlus /> Post New Work Sprint
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-container-3">
        {[
          { id: "sprints", label: "My Work Sprints", icon: FiLayers },
          { id: "candidates", label: "Verified Candidate Signals", icon: FiZap },
          { id: "escrow", label: "Escrow Stipend Deposits", icon: FiDollarSign },
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

      {/* Work Sprints Tab */}
      {activeTab === "sprints" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Active Work Sprints</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-semibold text-xs uppercase tracking-wider hover:bg-state-hover transition-all"
            >
              <FiPlus /> Post Sprint
            </button>
          </div>

          <div className="space-y-4">
            {mySprints.map((sp) => (
              <div
                key={sp.id}
                className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20 uppercase">
                      {sp.status}
                    </span>
                    <span className="text-xs text-text-4 font-semibold">{sp.deadline}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-1">{sp.title}</h3>
                  <span className="text-xs text-text-3 mt-1 block">
                    {sp.filled} of {sp.slots} Candidate Slots Filled
                  </span>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="text-right">
                    <span className="text-xs text-text-4 block uppercase font-semibold">Locked Escrow Stipend</span>
                    <span className="text-lg font-extrabold text-text-1">{sp.stipend}</span>
                  </div>
                  <button
                    onClick={() => router.push(`/gigs`)}
                    className="px-4 py-2 rounded-2xl bg-container-2 border border-container-3 text-text-1 font-bold text-xs hover:bg-state-hover transition-all"
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidates Signals Tab */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Verified Candidate Speedrun Signals</h2>
            <p className="text-xs text-text-3 mt-1">Review builders with verified Speedrun scores and proof-of-work badges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Alex Rivera", rank: "+22% Match Rank", badge: "React 19 Server Actions", score: "98% Pass" },
              { name: "Sarah Chen", rank: "+30% Match Rank", badge: "GraphQL Architect", score: "100% Pass" },
              { name: "David Kim", rank: "+15% Match Rank", badge: "UI Craftsmanship", score: "94% Pass" },
            ].map((c, idx) => (
              <div key={idx} className="group relative p-6 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl overflow-hidden flex flex-col justify-between">
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-container-2 text-text-2 font-semibold border border-container-3 uppercase">
                      {c.rank}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-1 mb-1">{c.name}</h3>
                  <div className="p-3 rounded-2xl bg-container-2 border border-container-3/50 text-xs mt-3">
                    <span className="text-text-4 block uppercase font-semibold">Speedrun Verified</span>
                    <span className="text-text-1 font-bold block">{c.badge}</span>
                    <span className="text-emerald-500 font-semibold mt-1 block">{c.score}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/profile`)}
                  className="w-full mt-4 py-2 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md relative z-10"
                >
                  Invite to Sprint
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escrow Deposits Tab */}
      {activeTab === "escrow" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Escrow Stipend Deposits</h2>
            <p className="text-xs text-text-3 mt-1">Stipends locked in smart contracts for candidate deliverables.</p>
          </div>

          <div className="p-8 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl relative overflow-hidden">
            <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={160} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase text-text-4 tracking-wider block mb-1">Total Locked Escrow</span>
                <span className="text-4xl font-extrabold text-text-1">$1,250.00</span>
                <span className="text-xs text-text-3 block mt-2">Protected by Kozeo Escrow Protocol</span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md"
              >
                Deposit New Stipend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Modal: Post Work Sprint */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              <FiX />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-2xl bg-container-2 text-text-1 text-xl font-bold border border-container-3">
                <FiLayers />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-text-1">Post Work Sprint</h3>
                <p className="text-xs text-text-3">Define a deliverable sprint & deposit stipend.</p>
              </div>
            </div>

            <form onSubmit={handlePostSprint} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Sprint Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Router Cache Integration"
                  value={newSprint.title}
                  onChange={(e) => setNewSprint({ ...newSprint, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Stipend Amount ($)</label>
                  <input
                    type="text"
                    required
                    placeholder="$500"
                    value={newSprint.stipend}
                    onChange={(e) => setNewSprint({ ...newSprint, stipend: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-3 block mb-1.5">Candidate Slots</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={newSprint.slots}
                    onChange={(e) => setNewSprint({ ...newSprint, slots: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 text-sm focus:outline-none focus:border-text-1"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-container-2 border border-container-3 text-text-3 font-semibold text-xs hover:text-text-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-text-1 text-container-1 font-bold text-xs hover:scale-105 transition-all shadow-md"
                >
                  Post & Deposit Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
