"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiStar, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  getAllGigs,
  searchGigs,
  searchUsers,
} from "../../../utilities/kozeoApi";
import { isAuthenticated } from "../../../utilities/api";
import { useTheme } from "../../contexts/ThemeContext";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { PageLoader } from "@/components/common/PageLoader";
import { useUser } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { clearLoginEntry } from "../../../store/userSlice";
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, loginEntry } = useUser();
  const dispatch = useDispatch();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const gigsPerPage = 12;

  // Users state for Users view
  const [users, setUsers] = useState<any[]>([]);

  // Toggle state: 'gigs' or 'users'
  const [viewMode, setViewMode] = useState<"gigs" | "users">("gigs");

  // Pagination logic
  const totalGigs = gigs.length;
  const totalPages = Math.ceil(totalGigs / gigsPerPage);
  const startIndex = (currentPage - 1) * gigsPerPage;
  const endIndex = startIndex + gigsPerPage;
  const currentGigs = gigs.slice(startIndex, endIndex);

  // Reset to first page when gigs change (search, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, [gigs.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [router]);

  // Fetch gigs on component mount
  useEffect(() => {
    // Check for loginEntry in user object
    console.log("Debug loginEntry:", { user, loginEntry });
    if (user && loginEntry) {
      console.log("Setting welcome page to true");
      setShowWelcomePage(true);
      // Clear loginEntry after showing welcome page
      dispatch(clearLoginEntry());
    }
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const gigsData = await getAllGigs();
        // Filter out completed gigs
        const activeGigs = (gigsData || []).filter(
          (gig) => gig.status !== "completed"
        );
        setGigs(activeGigs);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [user]);

  const handleFindProjects = () => {
    setShowWelcomePage(false);
  };

  const handleUserClick = (user: any) => {
    router.push(`/profile/${user.username || user.username}`);
  };

  // Search functionality
  const handleSearch = async () => {
    if (viewMode === "gigs") {
      if (!searchTerm.trim()) {
        // Reset to all gigs
        try {
          const gigsData = await getAllGigs();
          // Filter out completed gigs
          const activeGigs = (gigsData || []).filter(
            (gig) => gig.status !== "completed"
          );
          setGigs(activeGigs);
        } catch (error: any) {
          console.error("Error fetching projects:", error);
        }
        return;
      }

      try {
        const searchResults = await searchGigs(searchTerm);
        // Filter out completed gigs from search results
        const activeSearchResults = (searchResults || []).filter(
          (gig) => gig.status !== "completed"
        );
        setGigs(activeSearchResults);
      } catch (error: any) {
        console.error("Error searching projects:", error);
        setError("Failed to search projects");
      }
    } else {
      // Users search
      setLoading(true);
      setError("");
      try {
        const userResults = await searchUsers(searchTerm);
        setUsers(userResults || []);
      } catch (error: any) {
        console.error("Error searching users:", error);
        setError("Failed to search users");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />

      {/* Welcome Page */}
      {showWelcomePage ? (
        <div
          className={`h-full min-h-[500px] relative z-10 flex items-center justify-center theme-transition ${
            theme === "light"
              ? "bg-gradient-light text-text-1"
              : "bg-gradient-dark text-text-1"
          }`}
        >
          <div className="text-center max-w-4xl mx-auto px-6">
            <h1
              className={`text-6xl md:text-7xl font-bold mb-6 bg-container-1 ${
                theme === "light"
                  ? "text-forge-ember"
                  : "text-forge-ember"
              } bg-clip-text text-transparent`}
            >
              Welcome to Kozeo
            </h1>

            <p
              className={`text-xl md:text-2xl mb-4 font-medium ${
                theme === "light" ? "text-text-1" : "text-text-1"
              }`}
            >
              Hey there, {user?.username || "User"}!
            </p>

            <p
              className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${
                theme === "light" ? "text-text-3" : "text-text-3"
              }`}
            >
              Your gateway to collaborative projects and skill sharing. Connect
              with talented individuals, work on exciting projects, and grow
              your skills in our vibrant community.
            </p>

            <div className="space-y-6">
              <button
                onClick={handleFindProjects}
                className={`group relative inline-flex items-center justify-center px-12 py-4 text-lg font-medium transition-all duration-300 ease-out rounded-sm border-2 hover:scale-[1.02] focus:outline-none focus:ring-4 ${
                  theme === "light"
                    ? "bg-container-1 text-text-1 border-container-3 hover:bg-state-hover hover:border-forge-line focus:ring-state-highlight"
                    : "bg-container-2 text-text-1 border-container-3 hover:bg-state-hover hover:border-forge-line focus:ring-state-highlight"
                } shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]`}
              >
                <span className="relative z-10">Find Projects</span>
                <div
                  className={`absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    theme === "light"
                      ? "bg-container-1 bg-container-1"
                      : "bg-container-1 bg-container-2"
                  }`}
                />
              </button>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <ProfessionalButton
                  onClick={() => router.push("/gigs/create")}
                  variant="neutral"
                  size="md"
                  className="!px-8 !py-3"
                >
                  Create a Project
                </ProfessionalButton>

                <ProfessionalButton
                  onClick={() => router.push("/profile/" + user?.username)}
                  variant="neutral"
                  size="md"
                  className="!px-8 !py-3"
                >
                  View Profile
                </ProfessionalButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Atrium Page
        <div
          className={`h-full relative z-10 flex flex-row theme-transition ${
            theme === "light"
              ? "bg-gradient-light text-text-1"
              : "bg-gradient-dark text-text-1"
          }`}
        >
          <div className="flex flex-1 pb-20 lg:pb-0">
            <main className="flex-1 p-6 overflow-y-auto">
              {/* Search & Create Gig Section */}
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 mb-8 w-full">
                {/* Searchbar - responsive width */}
                <div className="relative w-full sm:max-w-xl flex-shrink-0">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="kozeo-input !rounded-full pl-5 pr-11 py-3 text-sm shadow-xs"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                    aria-label="Search"
                  >
                    <FiSearch className="text-lg" />
                  </button>
                </div>

                {/* Toggle Button for Projects/Users - responsive shrink and grow */}
                <div className="relative inline-flex items-center w-full sm:w-auto">
                  <div
                    className="relative flex items-center rounded-full p-1.5 kozeo-glass w-full sm:w-auto shadow-xs"
                    style={{ minWidth: 0 }}
                  >
                    {/* Background Slider */}
                    <div
                      className={`absolute top-1.5 bottom-1.5 w-1/2 rounded-full bg-black dark:bg-white transition-all duration-300 ease-out shadow-xs ${
                        viewMode === "users"
                          ? "translate-x-full"
                          : "translate-x-0"
                      }`}
                      style={{ left: 0, right: 0 }}
                    />

                    {/* Projects Option */}
                    <button
                      onClick={() => setViewMode("gigs")}
                      className={`relative z-10 flex items-center justify-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors duration-300 flex-1 focus:outline-none ${
                        viewMode === "gigs"
                          ? "text-white dark:text-black"
                          : "text-text-3 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      Projects
                    </button>

                    {/* Users Option */}
                    <button
                      onClick={() => setViewMode("users")}
                      className={`relative z-10 flex items-center justify-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors duration-300 flex-1 focus:outline-none ${
                        viewMode === "users"
                          ? "text-white dark:text-black"
                          : "text-text-3 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      Users
                    </button>
                  </div>
                </div>

                {/* Create Project Button - full width on mobile */}
                <div className="w-full sm:w-auto flex-shrink-0">
                  <button
                    onClick={() => router.push("/gigs/create")}
                    className="kozeo-btn-primary w-full sm:w-auto !py-3 shadow-md"
                  >
                    Create Project
                  </button>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                {viewMode === "gigs" ? "Open Projects" : "Users"}
              </h2>

              {/* Loading State */}
              {loading && (
                <PageLoader
                  duration={1000}
                  onComplete={() => {}}
                  useSlideAnimation={false}
                />
              )}

              {/* Error State */}
              {error && (
                <div className="flex justify-center items-center py-20">
                  <div className="text-red-500 font-medium">{error}</div>
                </div>
              )}

              {/* Cards Grid: Gigs or Users */}
              {!loading &&
                !error &&
                (viewMode === "gigs" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                    {currentGigs.length === 0 ? (
                      <div
                        className="col-span-full text-center py-20 text-black/50 dark:text-white/50"
                      >
                        No gigs found.{" "}
                        {searchTerm && "Try a different search term."}
                      </div>
                    ) : (
                      currentGigs.map((gig: any) => (
                        <div
                          key={gig.id}
                          onClick={() => {
                            router.push(`/Atrium/description?gigId=${gig.id}`);
                          }}
                          className="relative flex flex-col justify-between h-full min-h-[320px] kozeo-card p-6 cursor-pointer"
                        >
                          {/* Host Rating Top-Right */}
                          <div className="absolute top-4 right-4 text-xs px-2.5 py-1 flex items-center gap-1.5 kozeo-badge">
                            <FiStar className="text-xs text-amber-500 fill-amber-500" />
                            <span>{gig.host?.rating?.toFixed(1) || "—"}</span>
                          </div>

                          {/* Sponsored Tag */}
                          {gig.host?.username === "Jayash" && (
                            <div className="absolute -top-3 left-4 px-3 py-0.5 text-[10px] font-semibold tracking-widest uppercase z-10 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-xs">
                              SPONSORED
                            </div>
                          )}

                          {/* Top Content */}
                          <div>
                            <div className="text-xs font-semibold tracking-wider uppercase mb-1.5 text-black/50 dark:text-white/50">
                              {gig.host?.username ||
                                gig.creator?.username ||
                                "Unknown"}
                            </div>

                            <h3 className="text-lg font-bold tracking-tight mb-2 text-black dark:text-white group-hover:underline">
                              {gig.title}
                            </h3>

                            <p
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              className="text-sm mb-4 text-black/70 dark:text-white/70 leading-relaxed"
                            >
                              {gig.description}
                            </p>

                            <p className="text-xs mb-3 text-text-3">
                              <span className="font-medium">Looking For: </span>
                              <span className="font-semibold text-black dark:text-white">
                                {gig.looking_For}
                              </span>
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {gig.skills?.map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="kozeo-badge text-[10px]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Bottom Bar */}
                          <div className="flex justify-between items-center border-t border-black/5 dark:border-white/10 pt-4 mt-2">
                            {gig.amount === 0 ? (
                              <div className="kozeo-badge text-[10px]">
                                <FiStar className="w-3 h-3 text-amber-500" />
                                Skill Forge
                              </div>
                            ) : (
                              <span className="text-base font-bold tracking-tight text-black dark:text-white">
                                {gig.currency}{" "}
                                {Number(gig.amount).toLocaleString("en-IN")}
                              </span>
                            )}
                            <span
                              className={`text-xs ${
                                theme === "light"
                                  ? "text-text-3"
                                  : "text-text-3"
                              }`}
                            >
                              {gig.activeRequest?.length || 0} active requests
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                    {users.length === 0 ? (
                      <div
                        className={`col-span-full text-center py-20 ${
                          theme === "light" ? "text-text-3" : "text-text-3"
                        }`}
                      >
                        No users found. Try searching something else{" "}
                        {searchTerm && "Try a different search term."}
                      </div>
                    ) : (
                      users.map((user: any) => (
                        <div
                          key={user.id || user._id || user.username}
                          onClick={() => handleUserClick(user)}
                          className={`relative flex flex-col justify-between h-full min-h-[220px] rounded-sm p-5 shadow-[0_4px_20px_rgba(21,18,13,0.5)] transition-transform duration-200 ease-in-out hover:scale-[1.02] theme-transition ${
                            theme === "light"
                              ? "bg-container-1 border border-container-3 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:bg-state-hover "
                              : " bg-container-1   hover:"
                          }`}
                        >
                          {/* User Info Top Section */}
                          <div>
                            {/* Profile Picture */}
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden border border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)] bg-container-2 flex items-center justify-center">
                                {user.profile_Picture ? (
                                  <img
                                    src={user.profile_Picture}
                                    alt={user.username}
                                    className="w-full h-full object-cover object-center"
                                    style={{
                                      minWidth: "100%",
                                      minHeight: "100%",
                                    }}
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<svg class="w-8 h-8 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
                                      }
                                    }}
                                  />
                                ) : (
                                  <FiUser className="w-8 h-8 text-text-3" />
                                )}
                              </div>
                            </div>

                            {/* Username & Rating */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span
                                className={`text-lg font-semibold ${
                                  theme === "light"
                                    ? "text-forge-ember"
                                    : "text-forge-ember"
                                }`}
                              >
                                {user.username}
                              </span>
                              <span className="flex items-center gap-1 text-forge-ember text-sm">
                                <FiStar
                                  className="inline-block"
                                  fill="currentColor"
                                />
                                {user.rating ? user.rating.toFixed(1) : "N/A"}
                              </span>
                            </div>

                            {/* Bio */}
                            <p
                              className={`text-sm text-center mb-3 ${
                                theme === "light"
                                  ? "text-text-3"
                                  : "text-text-3"
                              }`}
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.bio || "No bio provided."}
                            </p>

                            {/* Gig Stats */}
                            <div className="flex justify-center items-center gap-6 mb-3">
                              <div className="text-xs font-medium text-text-3">
                                Hosted <br />
                                <span className="text-forge-ember font-semibold text-base">
                                  {user.gigHostedCount ?? 0}
                                </span>
                              </div>
                              <div className="text-xs font-medium text-text-3">
                                Collaborated <br />
                                <span className="text-text-3 font-semibold text-base">
                                  {user.gigCollaboratedCount ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div
                            className={`flex justify-between items-center text-xs pt-3 mt-4 border-t ${
                              theme === "light"
                                ? "border-container-3"
                                : "border-container-3"
                            }`}
                          >
                            <span className="text-text-3">
                              Joined:{" "}
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                            </span>
                            <span className="text-text-3">
                              {user.role || "User"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ))}

              {/* Pagination for Gigs */}
              {!loading && !error && viewMode === "gigs" && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : "hover:scale-105"
                    } ${
                      theme === "light"
                        ? "bg-container-1 border border-container-3 text-text-1 hover:bg-state-hover disabled:bg-forge-bg"
                        : "bg-container-2 border border-container-3 text-text-1 hover:bg-state-hover disabled:bg-forge-bg-raised"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      const isCurrentPage = page === currentPage;

                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className={`px-3 py-2 text-sm ${
                                theme === "light"
                                  ? "text-text-3"
                                  : "text-text-3"
                              }`}
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            isCurrentPage
                              ? theme === "light"
                                ? "bg-forge-ember-low text-text-1 border border-forge-ember"
                                : "bg-forge-ember-low text-text-1 border border-forge-ember"
                              : theme === "light"
                              ? "bg-container-1 border border-container-3 text-text-1 hover:bg-state-hover"
                              : "bg-container-2 border border-container-3 text-text-1 hover:bg-state-hover"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-sm text-sm font-medium transition-all duration-200 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "hover:scale-105"
                    } ${
                      theme === "light"
                        ? "bg-container-1 border border-container-3 text-text-1 hover:bg-state-hover disabled:bg-forge-bg"
                        : "bg-container-2 border border-container-3 text-text-1 hover:bg-state-hover disabled:bg-forge-bg-raised"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              {!loading && !error && viewMode === "gigs" && totalGigs > 0 && (
                <div className="text-center mt-4">
                  <span
                    className={`text-sm ${
                      theme === "light" ? "text-text-3" : "text-text-3"
                    }`}
                  >
                    Showing {startIndex + 1}-{Math.min(endIndex, totalGigs)} of{" "}
                    {totalGigs} gigs
                  </span>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
