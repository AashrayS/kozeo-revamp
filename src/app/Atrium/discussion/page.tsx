"use client";

import React, { useEffect, useState } from "react";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { useRouter } from "next/navigation";
import { FaUsers, FaComments, FaArrowRight } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { getDiscussionRooms } from "../../../../utilities/kozeoApi";

export default function DiscussionPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [discussionRooms, setDiscussionRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch discussion rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const roomsData = await getDiscussionRooms();
        setDiscussionRooms(roomsData || []);
      } catch (err) {
        console.error("Error fetching discussion rooms:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load discussion rooms"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const joinRoom = (roomId: string) => {
    router.push(`/discussionroom/${roomId}`);
  };

  return (
    <>
      {/* Glows */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
        </>
      )}

      <div className="flex flex-col h-screen">
        <div
          className={`relative z-10 flex flex-1 flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-forge-ink"
              : "bg-forge-bg    text-forge-ink"
          }`}
        >

          <main className="flex-1 p-6 overflow-y-auto pb-20 lg:pb-6">
            <div className="max-w-full mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1
                  className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                  }`}
                >
                  {/* <FaComments className="text-forge-ember" /> */}
                  Discussion Rooms
                </h1>
                <p
                  className={`transition-colors duration-300 ${
                    theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                  }`}
                >
                  Join topic-based discussion rooms and connect with like-minded
                  developers
                </p>
              </div>

              {/* Search Section */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="relative w-full max-w-xl">
                  <input
                    type="text"
                    placeholder="Search discussion rooms..."
                    className={`w-full py-2 pl-4 pr-10 rounded-sm border focus:outline-none focus:ring-2 transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-forge-bg-raised border-forge-line placeholder-gray-400 focus:ring-forge-line text-forge-ink"
                        : "bg-forge-bg border-forge-line placeholder-gray-500 focus:ring-forge-line focus:border-forge-ember text-forge-ink"
                    }`}
                  />
                  <button
                    className={`absolute top-1/2 right-2 -translate-y-1/2 transition-colors duration-300 ${
                      theme === "dark"
                        ? "text-forge-ink-muted hover:text-forge-ink"
                        : "text-forge-ink-muted hover:text-forge-ink"
                    }`}
                  >
                    <FiSearch className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Rooms Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div
                    className={`text-xl mb-2 transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                    }`}
                  >
                    Loading discussion rooms...
                  </div>
                  <div
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                    }`}
                  >
                    Please wait...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-xl mb-2 text-[forge-error">
                    Error loading discussion rooms
                  </div>
                  <div
                    className={`text-sm mb-4 transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                    }`}
                  >
                    {error}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-forge-ember hover:bg-forge-ember text-forge-ink rounded transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : discussionRooms.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className={`text-xl mb-2 transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                    }`}
                  >
                    No discussion rooms available
                  </div>
                  <div
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                    }`}
                  >
                    Check back later for new rooms to join.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discussionRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-sm p-6 transition-all duration-200 group cursor-pointer ${
                        theme === "dark"
                          ? "bg-forge-bg-raised/50 border-forge-line hover:bg-forge-bg-raised/50 hover:border-forge-ember/30"
                          : "bg-forge-bg/80 border-forge-line hover:bg-forge-bg hover:border-forge-ember shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                      }`}
                      onClick={() => joinRoom(room.id)}
                    >
                      {/* Room Avatar */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-sm overflow-hidden flex items-center justify-center ${
                            theme === "dark" ? "bg-forge-bg-raised" : "bg-forge-bg"
                          }`}
                        >
                          <img
                            src={room.displayPicture}
                            alt={room.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzI2MjYyNiIvPgo8cGF0aCBkPSJNMjAgMTBDMTcuNzkgMTAgMTYgMTEuNzkgMTYgMTRDMTYgMTYuMjEgMTcuNzkgMTggMjAgMThDMjIuMjEgMTggMjQgMTYuMjEgMjQgMTRDMjQgMTEuNzkgMjIuMjEgMTAgMjAgMTBaTTIwIDI2QzE2LjY3IDI2IDEwIDI3LjY3IDEwIDMxVjMySDMwVjMxQzMwIDI3LjY3IDIzLjMzIDI2IDIwIDI2WiIgZmlsbD0iIzUyNTI1MiIvPgo8L3N2Zz4K";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-semibold transition-colors duration-300 ${
                              theme === "dark"
                                ? "text-forge-ink group-hover:text-forge-ember"
                                : "text-forge-ink group-hover:text-forge-ember"
                            }`}
                          >
                            {room.title}
                          </h3>
                          <div
                            className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                              theme === "dark"
                                ? "text-forge-ink-muted"
                                : "text-forge-ink-muted"
                            }`}
                          >
                            <FaUsers className="text-xs" />
                            <span>
                              {room.isActive ? "Active Room" : "Inactive Room"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={`text-sm mb-4 line-clamp-3 transition-colors duration-300 ${
                          theme === "dark" ? "text-forge-ink" : "text-forge-ink"
                        }`}
                      >
                        {room.description}
                      </p>

                      {/* Join Button */}
                      <div className="flex justify-between items-center">
                        <div
                          className={`text-xs transition-colors duration-300 ${
                            theme === "dark" ? "text-forge-ink-muted" : "text-forge-ink-muted"
                          }`}
                        >
                          Room #{room.id}
                        </div>
                        <ProfessionalButton
                          onClick={() => joinRoom(room.id)}
                          variant="primary"
                          size="sm"
                          className="text-sm"
                          icon={<FaArrowRight className="w-3 h-3" />}
                        >
                          Join Room
                        </ProfessionalButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Room CTA */}
              {/* <div className="mt-8 p-6 bg-forge-bg bg-forge-bg-raised border border-forge-ember/20 rounded-sm text-center">
                <h3 className="text-xl font-semibold text-forge-ink mb-2">
                  Want to create your own room?
                </h3>
                <p className="text-forge-ink-muted mb-4">
                  Contact us to set up a custom discussion room for your
                  community
                </p>
                <button className="px-6 py-2 bg-forge-bg  text-forge-ink rounded-sm font-medium  transition-all duration-200">
                  Request Custom Room
                </button>
              </div> */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
