"use client";

import React from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { useRouter } from "next/navigation";
import { FaUsers, FaComments, FaArrowRight } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import discussionRooms from "../../../../data/discussionRooms.json";

export default function DiscussionPage() {
  const router = useRouter();

  const joinRoom = (roomId: number) => {
    router.push(`/discussionroom/${roomId}`);
  };

  return (
    <>
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div className="flex flex-col h-screen">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <FaComments className="text-cyan-400" />
                  Discussion Rooms
                </h1>
                <p className="text-gray-400">
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
                    className="w-full py-2 pl-4 pr-10 rounded-md bg-neutral-900 border border-neutral-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  />
                  <button className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    <FiSearch className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discussionRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 transition-all duration-200 hover:border-cyan-500/30 group cursor-pointer"
                    onClick={() => joinRoom(room.id)}
                  >
                    {/* Room Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex items-center justify-center">
                        <img
                          src={room.dp}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzI2MjYyNiIvPgo8cGF0aCBkPSJNMjAgMTBDMTcuNzkgMTAgMTYgMTEuNzkgMTYgMTRDMTYgMTYuMjEgMTcuNzkgMTggMjAgMThDMjIuMjEgMTggMjQgMTYuMjEgMjQgMTRDMjQgMTEuNzkgMjIuMjEgMTAgMjAgMTBaTTIwIDI2QzE2LjY3IDI2IDEwIDI3LjY3IDEwIDMxVjMySDMwVjMxQzMwIDI3LjY3IDIzLjMzIDI2IDIwIDI2WiIgZmlsbD0iIzUyNTI1MiIvPgo8L3N2Zz4K";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FaUsers className="text-xs" />
                          <span>Public Room</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {room.description}
                    </p>

                    {/* Join Button */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Room #{room.id}
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 text-cyan-400 rounded-lg text-sm font-medium group-hover:bg-cyan-600 group-hover:text-white transition-all duration-200">
                        Join Room
                        <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Room CTA */}
              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Want to create your own room?
                </h3>
                <p className="text-gray-400 mb-4">
                  Contact us to set up a custom discussion room for your
                  community
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-purple-700 transition-all duration-200">
                  Request Custom Room
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
