"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiSearch } from "react-icons/fi";
import gigs from "../../../data/gig.json"; // Adjust this path based on your project structure
import { FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      {/* Main Layout */}
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        {" "}
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Search & Create Gig Section */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="relative w-full max-w-xl">
                <input   
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full py-2 pl-4 pr-10 rounded-md bg-neutral-900 border border-neutral-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                />
                <button className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  <FiSearch className="text-xl" />
                </button>
              </div>

              <button className="px-5 py-2 rounded-md font-semibold text-black bg-white hover:bg-neutral-200 w-auto  transition-colors">
                Create Gig
              </button>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold mb-4">Open Gigs</h2>

            {/* Gig Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
              {gigs.map((gig) => (
                <div
  key={gig.gigId}
  onClick={() => {
    router.push(`/Atrium/description?gigId=${gig.gigId}`);
  }}
  className="relative flex flex-col justify-between h-full min-h-[320px] bg-gradient-to-br from-[#111] to-[#1a1a1a]
             rounded-lg p-5 shadow-md transition-transform duration-200 ease-in-out 
             hover:scale-[1.03] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_rgba(168,85,247,0.1))]"
>
  {/* ⭐ Host Rating Top-Right */}
  <div className="absolute top-3 right-3 text-xs text-gray-300 bg-neutral-800 bg-opacity-80 px-2 py-0.5 rounded-sm border border-neutral-600 backdrop-blur-sm flex items-center gap-1">
    <FiStar className="text-sm text-gray-400" fill="white" />
    <span className="font-medium">{gig.hostRating.toFixed(1)}</span>
  </div>

  {/* Top Content */}
  <div>
    <div className="text-sm text-cyan-400 font-medium mb-1">{gig.host}</div>

    <h3 className="text-lg font-semibold text-white mb-2">{gig.Title}</h3>

    <p
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      className="text-sm text-gray-300 mb-3"
    >
      {gig.Description}
    </p>

    <p className="text-sm mb-2">
      <span className="text-gray-400">Looking For: </span>
      <span className="text-white">{gig.Looking_For}</span>
    </p>

    <div className="flex flex-wrap gap-2 mb-3">
      {gig.Skills.map((skill: string, idx: number) => (
        <span
          key={idx}
          className="px-2 py-0.5 text-xs bg-neutral-800 border border-neutral-600 text-gray-300 rounded-md"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="flex justify-between items-center border-t border-neutral-800 pt-3 mt-4">
    <span className="text-sm font-semibold text-emerald-400">
      {gig.currency} {gig.Amount}
    </span>
    <span className="text-xs text-gray-500">
      {gig.active_request} active requests
    </span>
  </div>
</div>

              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
