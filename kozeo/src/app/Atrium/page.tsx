"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiSearch } from "react-icons/fi";
import { FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getAllGigs, searchGigs } from "../../../utilities/kozeoApi";
import { isAuthenticated } from "../../../utilities/api";
import { useTheme } from "../../contexts/ThemeContext";
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

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
        setGigs(gigsData || []);
      } catch (error: any) {
        console.error("Error fetching gigs:", error);
        setError("Failed to load gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  // Search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to all gigs
      try {
        const gigsData = await getAllGigs();
        setGigs(gigsData || []);
      } catch (error: any) {
        console.error("Error fetching gigs:", error);
      }
      return;
    }

    try {
      const searchResults = await searchGigs(searchTerm);
      setGigs(searchResults || []);
    } catch (error: any) {
      console.error("Error searching gigs:", error);
      setError("Failed to search gigs");
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
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Search & Create Gig Section */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className={`w-full py-2 pl-4 pr-10 rounded-md border focus:outline-none focus:ring-2 theme-transition ${
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
                >
                  <FiSearch className="text-xl" />
                </button>
              </div>

              <button
                className={`px-5 py-2 rounded-md font-semibold transition-colors ${
                  theme === "light"
                    ? "text-white bg-cyan-600 hover:bg-cyan-700"
                    : "text-black bg-white hover:bg-neutral-200"
                }`}
                onClick={() => router.push("/gigs/create")}
              >
                Create Gig
              </button>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4">Open Gigs</h2>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <div
                  className={
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }
                >
                  Loading gigs...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex justify-center items-center py-20">
                <div className="text-red-500">{error}</div>
              </div>
            )}

            {/* Gig Cards Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                {gigs.length === 0 ? (
                  <div
                    className={`col-span-full text-center py-20 ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    No gigs found.{" "}
                    {searchTerm && "Try a different search term."}
                  </div>
                ) : (
                  gigs.map((gig: any) => (
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
                              theme === "light" ? "text-gray-900" : "text-white"
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
                        <span className="text-sm font-semibold text-emerald-500">
                          {gig.currency} {gig.amount}
                        </span>
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
            )}
          </main>
        </div>
      </div>
    </>
  );
}
