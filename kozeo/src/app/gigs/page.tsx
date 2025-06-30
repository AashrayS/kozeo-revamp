"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import fs from "fs";
import path from "path";
import { useRouter } from "next/navigation";
import gigdata from "../../../data/ongoinggiglist.json"; // Adjust the import path as needed

// Remove old Gig interface and use the new structure
interface OngoingGig {
  gigId: number;
  host: string;
  Title: string;
  Looking_For: string;
  Description: string;
  Skills: string[];
  currency: string;
  Amount: number;
  active_request: number;
  hostRating: number;
}

export default function GigListPage() {
  const [gigs, setGigs] = useState<OngoingGig[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setGigs(gigdata as OngoingGig[]); // Cast gigdata to OngoingGig[]
  }, []);

  const handleGigNavigation = (gigId: number) => {
    setIsNavigating(true);
    router.push(`/Gig/${gigId}`);
  };

  if (isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-glow">
              Ongoing Gigs
            </h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gigs.map((gig) => (
                <div
                  key={gig.gigId}
                  onClick={() => handleGigNavigation(gig.gigId)}
                  className="relative flex flex-col justify-between h-full min-h-[320px] bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md transition-transform duration-200 ease-in-out hover:scale-[1.03] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_rgba(168,85,247,0.1))] cursor-pointer"
                >
                  {/* ⭐ Host Rating Top-Right */}
                  <div className="absolute top-3 right-3 text-xs text-gray-300 bg-neutral-800 bg-opacity-80 px-2 py-0.5 rounded-sm border border-neutral-600 backdrop-blur-sm flex items-center gap-1">
                    <span className="font-medium">
                      {gig.hostRating.toFixed(1)}★
                    </span>
                    {gig.host === "@uxwizard" && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-700 text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                        Self
                      </span>
                    )}
                  </div>
                  {/* Top Content */}
                  <div>
                    <div className="text-sm text-cyan-400 font-medium mb-1">
                      {gig.host}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {gig.Title}
                    </h3>
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
                    {/* <span className="text-xs text-gray-500">
                      {gig.active_request} active requests
                    </span> */}
                    <button
                      className="ml-4 px-3 py-1 rounded border border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800 hover:text-white text-xs font-medium transition-colors shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGigNavigation(gig.gigId);
                      }}
                    >
                      Enter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
        {/* Glows */}
        <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
        <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      </div>
    </>
  );
}
