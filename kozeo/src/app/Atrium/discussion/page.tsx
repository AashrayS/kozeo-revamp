"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import discussionRooms from "../../../../data/discussionRooms.json"; // Adjust if needed

export default function DiscussionPage() {
  const router = useRouter();

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
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

            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4">Discussion Rooms</h2>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
              {discussionRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => router.push(`/discussion/${room.id}`)}
                  className="group relative flex flex-col justify-self-start h-full min-h-[240px] bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md  hover:scale-[1.02] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_rgba(168,85,247,0.08))] transition-all duration-300 cursor-pointer"
                >
                  {/* Header: Avatar + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={room.dp}
                      alt={room.name}
                      className="w-12 h-12 rounded-full border border-neutral-700 shadow-sm"
                    />
                    <h3 className="text-lg font-semibold text-white">
                      {room.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm text-gray-300 leading-relaxed line-clamp-5 mt-10"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {room.description}
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
