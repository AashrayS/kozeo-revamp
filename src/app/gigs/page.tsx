"use client";
import React, { useEffect, useState } from "react";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { PageLoader } from "@/components/common/PageLoader";
import { FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserGigs } from "../../../utilities/kozeoApi";
import { useUser } from "../../../store/hooks";

// Updated interface to match API response
interface Gig {
  id: string;
  title: string;
  looking_For: string;
  description: string;
  skills: string[];
  currency: string;
  amount: number;
  status: string;
  activeRequest: Array<{ id: string }>;
  host: {
    id: string;
    username: string;
    profile_Picture?: string;
    rating: number;
  };
  createdAt: string;
}

export default function GigListPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [filter, setFilter] = useState<"all" | "hosted" | "collaborating">(
    "all"
  );
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();
  const userId = user ? user.id : null;

  // Filter gigs based on selected filter
  const filteredGigs = gigs.filter((gig) => {
    if (filter === "hosted") return user && gig.host.id === user.id;
    if (filter === "collaborating") return user && gig.host.id !== user.id;
    return true; // 'all'
  });

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!user) {
          setError("Please log in to view your gigs");
          return;
        }

        console.log("Fetching user gigs...");
        const gigsData = await getUserGigs(userId);
        console.log("User gigs fetched:", gigsData);
        setGigs((gigsData as Gig[]) || []);
      } catch (err) {
        console.error("Error fetching user gigs:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [user]); // Add user as dependency

  const handleGigNavigation = (gig: Gig) => {
    setIsNavigating(true);
    // Since these are user's gigs, determine navigation based on their role in the gig
    if (user && gig.host.id === user.id) {
      // User hosts this gig - go to lobby to manage requests
      router.push(`/gigs/${gig.id}/lobby`);
    } else {
      // User is collaborating on this gig - go to workspace
      router.push(`/Gig/${gig.id}`);
    }
  };

  if (loading || isNavigating) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-2">
            Error loading projects
          </div>
          <div
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {error}
          </div>
          <ProfessionalButton
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
            className="mt-4"
          >
            Try Again
          </ProfessionalButton>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1
          className={`text-3xl font-bold drop-shadow-glow transition-colors duration-300 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          My Projects ({filteredGigs.length})
        </h1>

              {/* Filter buttons */}
              {user && gigs.length > 0 && (
                <div className="flex gap-1 mt-4 sm:mt-0">
                  <ProfessionalButton
                    onClick={() => setFilter("all")}
                    variant={filter === "all" ? "primary" : "neutral"}
                    size="sm"
                    className="text-xs"
                  >
                    All ({gigs.length})
                  </ProfessionalButton>
                  <ProfessionalButton
                    onClick={() => setFilter("hosted")}
                    variant={filter === "hosted" ? "primary" : "neutral"}
                    size="sm"
                    className="text-xs"
                  >
                    Hosting ({gigs.filter((g) => g.host.id === user.id).length})
                  </ProfessionalButton>
                  <ProfessionalButton
                    onClick={() => setFilter("collaborating")}
                    variant={filter === "collaborating" ? "primary" : "neutral"}
                    size="sm"
                    className="text-xs"
                  >
                    Collaborating (
                    {gigs.filter((g) => g.host.id !== user.id).length})
                  </ProfessionalButton>
                </div>
              )}
            </div>
            {!user ? (
              <div
                className={`text-center py-12 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div className="text-xl mb-2">Please log in</div>
                <div className="text-sm">
                  You need to be logged in to view your gigs.
                </div>
                <ProfessionalButton
                  onClick={() => router.push("/login")}
                  variant="primary"
                  size="md"
                  className="mt-4"
                >
                  Go to Login
                </ProfessionalButton>
              </div>
            ) : filteredGigs.length === 0 ? (
              <div
                className={`text-center py-12 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div className="text-xl mb-2">
                  {filter === "all"
                    ? "No projects yet"
                    : filter === "hosted"
                    ? "No hosted projects"
                    : "No collaborating projects"}
                </div>
                <div className="text-sm">
                  {filter === "all"
                    ? "You haven't hosted or joined any projects yet."
                    : filter === "hosted"
                    ? "You haven't hosted any projects yet."
                    : "You aren't collaborating on any projects yet."}
                </div>
                {filter === "all" && (
                  <div className="mt-4 space-x-4">
                    <ProfessionalButton
                      onClick={() => router.push("/gigs/create")}
                      variant="primary"
                      size="md"
                    >
                      Create a Gig
                    </ProfessionalButton>
                    <ProfessionalButton
                      onClick={() => router.push("/Atrium")}
                      variant="neutral"
                      size="md"
                    >
                      Browse Available Gigs
                    </ProfessionalButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredGigs.map((gig) => (
                  <div
                    key={gig.id}
                    onClick={() => handleGigNavigation(gig)}
                    className={`relative flex flex-col justify-between h-full min-h-[320px] rounded-lg p-5 shadow-md transition-all duration-200 ease-in-out hover:scale-[1.03] cursor-pointer ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_rgba(255,255,255,0.02))]"
                        : "bg-white/90 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {/* Host Rating Top-Right */}
                    {/* <div
                      className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-sm border backdrop-blur-sm flex items-center gap-1 transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-gray-300 bg-neutral-800 bg-opacity-80 border-neutral-600"
                          : "text-gray-700 bg-white/80 border-gray-300"
                      }`}
                    >
                      <span className="font-medium">
                        {gig.host.rating.toFixed(1)}★
                      </span>
                      {user && gig.host.id === user.id && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-emerald-700 text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                          Self
                        </span>
                      )}
                    </div> */}

                    {/* Top Content */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-white/40 font-medium">
                          @{gig.host.username}
                        </div>
                        {user && gig.host.id === user.id ? (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wide transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-slate-800/60 text-slate-400 border border-slate-700/50"
                                : "bg-slate-100/80 text-slate-600 border border-slate-200/60"
                            }`}
                          >
                            Host
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wide transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-slate-800/60 text-slate-400 border border-slate-700/50"
                                : "bg-slate-100/80 text-slate-600 border border-slate-200/60"
                            }`}
                          >
                            Member
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`text-lg font-semibold transition-colors duration-300 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {gig.title}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wide transition-colors duration-300 ${(() => {
                            const status = gig.status.toLowerCase();
                            if (status === "open") {
                              return theme === "dark"
                                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50"
                                : "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60";
                            } else if (status === "in_progress") {
                              return theme === "dark"
                                ? "bg-amber-900/40 text-amber-400 border border-amber-800/50"
                                : "bg-amber-50/80 text-amber-700 border border-amber-200/60";
                            } else {
                              return theme === "dark"
                                ? "bg-slate-800/60 text-slate-400 border border-slate-700/50"
                                : "bg-slate-100/80 text-slate-600 border border-slate-200/60";
                            }
                          })()}`}
                        >
                          {gig.status.replace("_", " ")}
                        </span>
                      </div>
                      <p
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        className={`text-sm mb-3 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {gig.description}
                      </p>
                      <p className="text-sm mb-2">
                        <span
                          className={`transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Looking For:{" "}
                        </span>
                        <span
                          className={`transition-colors duration-300 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {gig.looking_For}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {gig.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-[10px] rounded font-medium transition-colors duration-300 ${
                              theme === "dark"
                                ? "bg-slate-800/60 text-slate-300 border border-slate-700/50"
                                : "bg-slate-100/80 text-slate-700 border border-slate-200/60"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Created date */}
                      <div
                        className={`text-xs transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Created: {new Date(gig.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div
                      className={`flex justify-between items-center border-t pt-3 mt-4 transition-colors duration-300 ${
                        theme === "dark"
                          ? "border-neutral-800"
                          : "border-gray-200"
                      }`}
                    >
                      {gig.amount === 0 ? (
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-white/10 text-white/80 border border-white/20"
                              : "bg-black/5 text-black/80 border border-black/10"
                          }`}
                        >
                          <FiStar className="w-3 h-3 mr-1" />
                          Skill Forge
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-emerald-400">
                          {gig.currency} {gig.amount}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {gig.activeRequest?.length || 0} request(s)
                        </span>
                        <ProfessionalButton
                          onClick={() => handleGigNavigation(gig)}
                          variant="neutral"
                          size="sm"
                          className="text-[10px]"
                        >
                          {user && gig.host.id === user.id ? "Manage" : "Enter"}
                        </ProfessionalButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
    </main>
  );
}
