"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
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
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
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
  }, []);

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
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      {/* Main Layout */}
      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
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
                  className={`w-full py-2 pl-4 pr-10 rounded-md border focus:outline-none focus:ring-2 theme-transition text-base ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                      : "bg-neutral-900 border-neutral-700 text-white placeholder-gray-400 focus:ring-neutral-600"
                  }`}
                />
                <button
                  onClick={handleSearch}
                  className={`absolute top-1/2 right-2 -translate-y-1/2 transition-colors ${
                    theme === "light"
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-label="Search"
                >
                  <FiSearch className="text-xl" />
                </button>
              </div>

              {/* Toggle Button for Projects/Users - responsive shrink and grow */}
              <div className="relative inline-flex items-center w-full sm:w-auto">
                <div
                  className={`relative flex items-center rounded-lg p-1 transition-all duration-200 w-full sm:w-auto ${
                    theme === "light" ? "bg-gray-100" : "bg-neutral-800"
                  }`}
                  style={{ minWidth: 0 }}
                >
                  {/* Background Slider - More subtle */}
                  <div
                    className={`absolute top-1 bottom-1 w-1/2 rounded-md transition-all duration-200 ease-out ${
                      theme === "light"
                        ? "bg-white shadow-sm"
                        : "bg-neutral-700 shadow-sm"
                    } ${
                      viewMode === "users"
                        ? "translate-x-full"
                        : "translate-x-0"
                    }`}
                    style={{ left: 0, right: 0 }}
                  />

                  {/* Projects Option */}
                  <button
                    onClick={() => setViewMode("gigs")}
                    className={`relative z-10 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 focus:outline-none min-w-0 ${
                      viewMode === "gigs"
                        ? theme === "light"
                          ? "text-gray-900"
                          : "text-gray-100"
                        : theme === "light"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    Projects
                  </button>

                  {/* Users Option */}
                  <button
                    onClick={() => setViewMode("users")}
                    className={`relative z-10 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 focus:outline-none min-w-0 ${
                      viewMode === "users"
                        ? theme === "light"
                          ? "text-gray-900"
                          : "text-gray-100"
                        : theme === "light"
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    Users
                  </button>
                </div>
              </div>

              {/* Create Project Button - full width on mobile */}
              <div className="w-full sm:w-auto flex-shrink-0">
                <ProfessionalButton
                  onClick={() => router.push("/gigs/create")}
                  variant="neutral"
                  size="md"
                  className="w-full sm:w-auto !bg-white !text-gray-900 !border-gray-300 hover:!bg-gray-50 hover:!border-gray-400 !shadow-md"
                >
                  Create Project
                </ProfessionalButton>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4">
              {viewMode === "gigs" ? "Open Gigs" : "Users"}
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
                <div className="text-red-500">{error}</div>
              </div>
            )}

            {/* Cards Grid: Gigs or Users */}
            {!loading &&
              !error &&
              (viewMode === "gigs" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                  {currentGigs.length === 0 ? (
                    <div
                      className={`col-span-full text-center py-20 ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
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
                        className={`relative flex flex-col justify-between h-full min-h-[320px] rounded-lg p-5 shadow-md transition-transform duration-200 ease-in-out hover:scale-[1.03] theme-transition ${
                          theme === "light"
                            ? "bg-white border border-gray-200 hover:shadow-lg hover:bg-gradient-to-br hover:from-cyan-50 hover:to-purple-50"
                            : "bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_rgba(168,85,247,0.1))]"
                        }`}
                      >
                        {/* ⭐ Host Rating Top-Right */}
                        <div
                          className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-sm border backdrop-blur-sm flex items-center gap-1 ${
                            theme === "light"
                              ? "text-gray-700 bg-gray-100 bg-opacity-80 border-gray-300"
                              : "text-gray-300 bg-neutral-800 bg-opacity-80 border-neutral-600"
                          }`}
                        >
                          <FiStar
                            className={`text-sm ${
                              theme === "light"
                                ? "text-yellow-500"
                                : "text-gray-400"
                            }`}
                            fill={theme === "light" ? "#eab308" : "white"}
                          />
                          <span className="font-medium">
                            {gig.host?.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>

                        {/* Top Content */}
                        <div>
                          <div
                            className={`text-sm font-medium mb-1 ${
                              theme === "light"
                                ? "text-cyan-600"
                                : "text-cyan-400"
                            }`}
                          >
                            {gig.host?.username ||
                              gig.creator?.username ||
                              "Unknown"}
                          </div>

                          <h3
                            className={`text-lg font-semibold mb-2 ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
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
                            className={`text-sm mb-3 ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            }`}
                          >
                            {gig.description}
                          </p>

                          <p className="text-sm mb-2">
                            <span
                              className={
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }
                            >
                              Looking For:{" "}
                            </span>
                            <span
                              className={
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-white"
                              }
                            >
                              {gig.looking_For}
                            </span>
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {gig.skills?.map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 text-xs border rounded-md ${
                                  theme === "light"
                                    ? "bg-gray-100 border-gray-300 text-gray-700"
                                    : "bg-neutral-800 border-neutral-600 text-gray-300"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Bar */}
                        <div
                          className={`flex justify-between items-center border-t pt-3 mt-4 ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-neutral-800"
                          }`}
                        >
                          {gig.amount === 0 ? (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                theme === "dark"
                                  ? "bg-gradient-to-r from-purple-900/60 to-blue-900/60 text-purple-300 border border-purple-700/50"
                                  : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200"
                              }`}
                            >
                              <FiStar className="w-3 h-3 mr-1" />
                              Skill Forge
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-emerald-500">
                              {gig.currency}{" "}
                              {Number(gig.amount).toLocaleString("en-IN")}
                            </span>
                          )}
                          <span
                            className={`text-xs ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-500"
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
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      No users found.{" "}
                      {searchTerm && "Try a different search term."}
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <div
                        key={user.id || user._id || user.username}
                        onClick={() => handleUserClick(user)}
                        className={`relative flex flex-col justify-between h-full min-h-[220px] rounded-xl p-5 shadow-sm transition-transform duration-200 ease-in-out hover:scale-[1.02] theme-transition ${
                          theme === "light"
                            ? "bg-white border border-gray-200 hover:shadow-md hover:bg-gradient-to-br hover:from-cyan-50/30 hover:to-purple-50/30"
                            : " bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_rgba(168,85,247,0.08))]"
                        }`}
                      >
                        {/* User Info Top Section */}
                        <div>
                          {/* Profile Picture */}
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-700 shadow-sm bg-gray-800 flex items-center justify-center">
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
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
                                    }
                                  }}
                                />
                              ) : (
                                <FiUser className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Username & Rating */}
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span
                              className={`text-lg font-semibold ${
                                theme === "light"
                                  ? "text-cyan-600"
                                  : "text-cyan-400"
                              }`}
                            >
                              {user.username}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-500 text-sm">
                              <FiStar className="inline-block" fill="#eab308" />
                              {user.rating ? user.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>

                          {/* Bio */}
                          <p
                            className={`text-sm text-center mb-3 ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
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
                            <div className="text-xs font-medium text-gray-500">
                              Hosted <br />
                              <span className="text-cyan-500 font-semibold text-base">
                                {user.gigHostedCount ?? 0}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                              Collaborated <br />
                              <span className="text-purple-500 font-semibold text-base">
                                {user.gigCollaboratedCount ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div
                          className={`flex justify-between items-center text-xs pt-3 mt-4 border-t ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-neutral-700"
                          }`}
                        >
                          <span className="text-gray-500">
                            Joined:{" "}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span className="text-gray-500">
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-105"
                  } ${
                    theme === "light"
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                      : "bg-neutral-800 border border-neutral-600 text-gray-300 hover:bg-neutral-700 disabled:bg-neutral-900"
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
                                ? "text-gray-400"
                                : "text-gray-600"
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
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          isCurrentPage
                            ? theme === "light"
                              ? "bg-blue-500 text-white border border-blue-500"
                              : "bg-blue-600 text-white border border-blue-600"
                            : theme === "light"
                            ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            : "bg-neutral-800 border border-neutral-600 text-gray-300 hover:bg-neutral-700"
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-105"
                  } ${
                    theme === "light"
                      ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
                      : "bg-neutral-800 border border-neutral-600 text-gray-300 hover:bg-neutral-700 disabled:bg-neutral-900"
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
                    theme === "light" ? "text-gray-600" : "text-gray-400"
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
    </>
  );
}
