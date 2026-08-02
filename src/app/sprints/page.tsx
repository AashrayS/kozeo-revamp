"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiLayers, FiCalendar, FiDollarSign, FiUserCheck, FiCheckSquare, FiUploadCloud, FiCheckCircle, FiChevronRight, FiBriefcase } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { isAuthenticated } from "../../../utilities/api";

interface WorkSprint {
  id: string;
  title: string;
  poster: string;
  reward: string;
  deadlineDays: number;
  openSlots: number;
  totalSlots: number;
  sprintSignal: string;
  deliverables: string[];
  description: string;
  status: "Enrolling" | "In Progress" | "Review";
}

const mockWorkSprints: WorkSprint[] = [
  {
    id: "ws-1",
    title: "AI Resume Parser & JSON Schema Extractor",
    poster: "Kozeo Core Labs",
    reward: "$400 Stipend + Skill Badge",
    deadlineDays: 5,
    openSlots: 2,
    totalSlots: 4,
    sprintSignal: "+25% Sprint Performance",
    deliverables: [
      "Extract structured work experience JSON from PDF resumes",
      "Integrate rate-limiter and failure fallback",
      "Write unit tests with >85% coverage",
    ],
    description: "Build a production-ready resume parser microservice using OpenAI / Claude API with structured outputs and automated validation.",
    status: "Enrolling",
  },
  {
    id: "ws-2",
    title: "Stripe Escrow Milestone Settlement Flow",
    poster: "FinTech Venture Studio",
    reward: "$650 Stipend + Trust Signal",
    deadlineDays: 7,
    openSlots: 1,
    totalSlots: 3,
    sprintSignal: "+30% Reliability Score",
    deliverables: [
      "Implement escrow hold & release Webhook listeners",
      "Build milestone status dashboard component",
      "Security audit for idempotent payment claims",
    ],
    description: "Design and code the end-to-end milestone release logic connecting client escrow accounts to student payout triggers.",
    status: "Enrolling",
  },
  {
    id: "ws-3",
    title: "Realtime Collaborative Canvas CanvasDash",
    poster: "DesignForge AI",
    reward: "$500 Stipend + UI Badge",
    deadlineDays: 4,
    openSlots: 3,
    totalSlots: 5,
    sprintSignal: "+20% Skill Signal",
    deliverables: [
      "WebSocket cursor position broadcasting",
      "Smooth 60fps HTML5 Canvas rendering engine",
      "Export diagram to PNG / SVG utility",
    ],
    description: "Build an interactive multi-user whiteboard canvas for architectural diagramming during project team sprints.",
    status: "Enrolling",
  },
];

export default function WorkSprintsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeSprint, setActiveSprint] = useState<WorkSprint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliverableLinks, setDeliverableLinks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Only redirect to login if not in local dev environment and no token
    if (typeof window !== "undefined" && !isAuthenticated() && process.env.NODE_ENV !== "development") {
      router.push("/login");
    }
  }, [router]);

  const handleOpenSprint = (sprint: WorkSprint) => {
    setActiveSprint(sprint);
    setIsModalOpen(true);
    setIsSubmitted(false);
    setDeliverableLinks("");
  };

  const handleSubmitDeliverables = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableLinks.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Banner */}
          <div className="mb-10 p-8 rounded-3xl backdrop-blur-xl border border-container-3 bg-container-1 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <FiLayers className="text-9xl text-text-1" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-state-hover border border-container-3 mb-4 text-text-2">
              <FiLayers className="text-yellow-400" /> Platform Work Sprints
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Work Sprints
            </h1>
            <p className="text-lg text-text-3 max-w-2xl leading-relaxed">
              Short-term, goal-oriented production sprints hosted by startups and Kozeo. Ship real deliverables, earn stipends, and build verifiable proof of ability.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-container-3">
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Active Sprints</span>
                <span className="text-2xl font-bold text-text-1">3 Available</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Avg. Stipend</span>
                <span className="text-2xl font-bold text-yellow-400">$500</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Sprint Duration</span>
                <span className="text-2xl font-bold text-text-1">4 – 7 Days</span>
              </div>
              <div className="p-3 rounded-2xl bg-container-2">
                <span className="text-xs text-text-4 uppercase tracking-wider block font-semibold">Matching Weight</span>
                <span className="text-2xl font-bold text-yellow-400">+25% Reliability</span>
              </div>
            </div>
          </div>

          {/* Work Sprints List */}
          <div className="space-y-6">
            {mockWorkSprints.map((sprint) => (
              <div
                key={sprint.id}
                className="p-8 rounded-3xl border border-container-3 bg-container-1 backdrop-blur-xl hover:border-text-1/30 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 font-semibold border border-yellow-400/20 uppercase tracking-wider">
                        {sprint.status}
                      </span>
                      <span className="text-xs text-text-4 font-medium flex items-center gap-1">
                        <FiBriefcase /> {sprint.poster}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-text-1">
                      {sprint.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-container-2 border border-container-3 text-right">
                      <span className="text-xs text-text-4 block uppercase font-semibold">Reward</span>
                      <span className="text-sm font-bold text-yellow-400">{sprint.reward}</span>
                    </div>

                    <button
                      onClick={() => handleOpenSprint(sprint)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all shadow-md"
                    >
                      Join Sprint <FiChevronRight />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-text-3 mb-6 max-w-3xl leading-relaxed">
                  {sprint.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-4 mb-3">Key Deliverables</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sprint.deliverables.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-container-2 text-xs text-text-2 flex items-start gap-2 border border-container-3/50">
                        <FiCheckSquare className="text-yellow-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-container-3 flex flex-wrap items-center justify-between text-xs text-text-3 gap-4">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiCalendar className="text-text-4" /> {sprint.deadlineDays} Days Remaining
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiUserCheck className="text-text-4" /> {sprint.openSlots} / {sprint.totalSlots} Slots Available
                    </span>
                  </div>

                  <span className="font-semibold text-yellow-400">
                    {sprint.sprintSignal}
                  </span>
                </div>
              </div>
            ))}
          </div>

      {/* Sprint Participation & Deliverable Submission Modal */}
      {isModalOpen && activeSprint && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl p-8 rounded-3xl border border-container-3 bg-container-1 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-text-3 hover:text-text-1 text-xl font-bold"
            >
              ✕
            </button>

            {!isSubmitted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 text-xl font-bold">
                    <FiLayers />
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-text-1">{activeSprint.title}</h3>
                    <span className="text-xs text-text-3 font-medium">Hosted by {activeSprint.poster}</span>
                  </div>
                </div>

                <p className="text-sm text-text-3 mb-6 leading-relaxed">
                  {activeSprint.description}
                </p>

                <div className="p-4 rounded-2xl bg-container-2 mb-6 border border-container-3">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-text-4 mb-2">Deliverable Requirements</h4>
                  <ul className="text-xs text-text-2 space-y-1.5 list-disc list-inside">
                    {activeSprint.deliverables.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSubmitDeliverables} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-4 mb-2">
                      Submit Pull Request / Demo / Artifact Link
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Paste your GitHub PR, Vercel preview link, or video demo link..."
                      value={deliverableLinks}
                      onChange={(e) => setDeliverableLinks(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-container-3 bg-container-2 text-text-1 placeholder:text-text-4 focus:outline-none focus:border-text-1 text-sm transition-all resize-none"
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
                      {isSubmitting ? "Submitting Work..." : "Submit Deliverables"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl mx-auto border border-blue-500/20">
                  <FiCheckCircle />
                </div>
                <h3 className="text-2xl font-bold text-text-1">Sprint Deliverables Submitted!</h3>
                <p className="text-sm text-text-3 max-w-md mx-auto">
                  Your work has been submitted to <strong className="text-text-1">{activeSprint.poster}</strong> for evaluation. Once verified, your portfolio will receive <strong className="text-blue-500">{activeSprint.sprintSignal}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 rounded-2xl bg-text-1 text-container-1 font-bold text-sm hover:scale-105 transition-all"
                  >
                    Back to Work Sprints
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
