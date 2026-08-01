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
      <>
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-forge-ink"
              : "bg-forge-bg  via-blue-50 to-indigo-50 text-forge-ink"
          }`}
        >
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl text-[forge-error mb-2">
                  Error loading projects
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
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
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen relative z-10 flex flex-row theme-transition">
        <div className="flex-1 flex flex-col pb-20 lg:pb-0">
          <main className="flex-1 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
                My Projects <span className="text-sm font-medium opacity-60">({filteredGigs.length})</span>
              </h1>

              {/* Filter buttons */}
              {user && gigs.length > 0 && (
                <div className="flex flex-wrap gap-2 p-1.5 rounded-full kozeo-glass">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                      filter === "all"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    All ({gigs.length})
                  </button>
                  <button
                    onClick={() => setFilter("hosted")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                      filter === "hosted"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    Hosting ({gigs.filter((g) => g.host.id === user.id).length})
                  </button>
                  <button
                    onClick={() => setFilter("collaborating")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                      filter === "collaborating"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    Collaborating (
                    {gigs.filter((g) => g.host.id !== user.id).length})
                  </button>
                </div>
              )}
            </div>
            {!user ? (
              <div className="text-center py-16 kozeo-card p-8 max-w-md mx-auto">
                <div className="text-xl font-bold mb-2">Please log in</div>
                <div className="text-sm text-black/60 dark:text-white/60 mb-6">
                  You need to be logged in to view your gigs.
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="kozeo-btn-primary"
                >
                  Go to Login
                </button>
              </div>
            ) : filteredGigs.length === 0 ? (
              <div className="text-center py-16 kozeo-card p-8 max-w-md mx-auto">
                <div className="text-xl font-bold mb-2">
                  {filter === "all"
                    ? "No projects yet"
                    : filter === "hosted"
                    ? "No hosted projects"
                    : "No collaborating projects"}
                </div>
                <div className="text-sm text-black/60 dark:text-white/60 mb-6">
                  {filter === "all"
                    ? "You haven't hosted or joined any projects yet."
                    : filter === "hosted"
                    ? "You haven't hosted any projects yet."
                    : "You aren't collaborating on any projects yet."}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push("/gigs/create")}
                    className="kozeo-btn-primary"
                  >
                    Create a Gig
                  </button>
                  <button
                    onClick={() => router.push("/Atrium")}
                    className="kozeo-btn-secondary"
                  >
                    Browse Gigs
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredGigs.map((gig) => (
                  <div
                    key={gig.id}
                    onClick={() => handleGigNavigation(gig)}
                    className="relative flex flex-col justify-between h-full min-h-[320px] kozeo-card p-6 cursor-pointer group"
                  >
                    {/* Top Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50">
                          @{gig.host.username}
                        </div>
                        {user && gig.host.id === user.id ? (
                          <span className="kozeo-badge text-[10px]">
                            Host
                          </span>
                        ) : (
                          <span className="kozeo-badge text-[10px]">
                            Collaborator
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold tracking-tight text-black dark:text-white group-hover:underline">
                          {gig.title}
                        </h3>
                        <span className="kozeo-badge text-[10px] uppercase">
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
                        className="text-sm mb-3 text-black/70 dark:text-white/70 leading-relaxed"
                      >
                        {gig.description}
                      </p>
                      <p className="text-xs mb-3 text-black/60 dark:text-white/60">
                        <span className="font-medium">Looking For: </span>
                        <span className="font-semibold text-black dark:text-white">
                          {gig.looking_For}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {gig.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="kozeo-badge text-[10px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Created date */}
                      <div className="text-xs text-black/50 dark:text-white/50">
                        Created: {new Date(gig.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex justify-between items-center border-t border-black/5 dark:border-white/10 pt-4 mt-4">
                      {gig.amount === 0 ? (
                        <div className="kozeo-badge text-[10px]">
                          <FiStar className="w-3 h-3 text-amber-500" />
                          Skill Forge
                        </div>
                      ) : (
                        <span className="text-base font-bold tracking-tight text-black dark:text-white">
                          {gig.currency} {Number(gig.amount).toLocaleString("en-IN")}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black/50 dark:text-white/50">
                          {gig.activeRequest?.length || 0} request(s)
                        </span>
                        <button className="kozeo-btn-secondary !px-3 !py-1 !text-xs">
                          {user && gig.host.id === user.id ? "Manage" : "Workspace"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
