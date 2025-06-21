"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiStar, FiUser } from "react-icons/fi";
import gigs from "../../../../data/gig.json";
import users from "../../../../data/user.json";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Description() {
  const router = useRouter();
  const [requested, setRequested] = useState(false);
  const searchParams = useSearchParams();
  const gigIdParam = searchParams.get("gigId");

  // safely parse and check if gigId is valid
  const gigId = gigIdParam ? parseInt(gigIdParam) : null;

  const gig = gigs.find((g) => g.gigId === gigId);
  const user = users[0]; // sample assumption

  if (!gigId || !gig || !user) {
    return <main className="p-10 text-white">Loading or Invalid Gig ID</main>;
  }

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <main className="flex-1 px-10 py-6 grid grid-cols-1 md:grid-cols-2  md:gap-6 items-start ">
          {/* Gig Info */}
          <div className="relative  flex flex-col justify-between bg-gradient-to-br mb-10 min-h-2/3 from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_rgba(168,85,247,0.1))] rounded-lg p-6 shadow-md w-full">
            <div className="absolute top-3 right-3 text-xs text-gray-300 bg-neutral-800 bg-opacity-80 px-2 py-0.5 rounded-sm border border-neutral-600 backdrop-blur-sm flex items-center gap-1">
              <FiStar className="text-sm text-gray-400" fill="white" />
              <span className="font-medium">{gig.hostRating.toFixed(1)}</span>
            </div>

            {/* Top Content */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-6">
                Gig Details
              </h2>

              <div className="text-sm text-cyan-400 font-medium mb-1">
                {gig.host}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {gig.Title}
              </h3>

              <p
                style={{
                  display: "-webkit-box",

                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
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

            {/* Bottom Section */}
            <div className="mt-auto pt-4 border-t border-neutral-800 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-400">
                  {gig.currency} {gig.Amount}
                </span>
                <span className="text-xs text-gray-500">
                  {gig.active_request} active requests
                </span>
              </div>

              <button
                onClick={() => setRequested(!requested)}
                className={`w-auto px-5 self-center py-2 rounded-md border-0 transition-colors duration-200 ${
                  requested
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-emerald-400 text-black hover:bg-emerald-500"
                }`}
              >
                {requested ? "Cancel?" : "Send Request"}
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col  bg-gradient-to-br  md:mb-0 min-h-2/3 from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1),_rgba(34,211,238,0.1))] rounded-lg p-6 shadow-md w-full">
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                About the Creator
              </h2>

              <button
                className="text-xs text-gray-300 bg-neutral-800 bg-opacity-80 px-2 py-1 rounded-sm  backdrop-blur-sm flex items-center gap-1 hover:bg-neutral-700 transition-colors"
                onClick={() => {
                  router.push(`/profile/${user.username}`);
                }}
              >
                <FiUser className="text-sm" />
                <span className="hidden md:inline">Visit</span>
              </button>
            </div>

            {/* User Profile Section */}
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={user.profilePictureLink}
                alt={user.username}
                className="w-20 h-20 rounded-full border border-neutral-600 mb-3"
              />
              <div className="font-semibold text-lg">{user.username}</div>
              <div className="flex items-center gap-1 text-gray-300 text-sm mt-1 mb-2">
                <FiStar className="text-yellow-400" />
                {user.Rating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-300 w-2/3">{user.bio}</p>
            </div>

            {/* Reviews Section */}
            <h4 className="font-bold text-white mb-2">Reviews:</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {user.reviews.map((review, i) => (
                <div
                  key={i}
                  className="border border-neutral-700 rounded-md p-3"
                >
                  <div className="font-semibold mb-1">{review.title}</div>
                  <p className="text-sm text-gray-300">{review.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    by {review.username} • ⭐ {review.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
