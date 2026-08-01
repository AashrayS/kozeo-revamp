"use client";
import React from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

interface GigInfo {
  Title: string;
  host: string;
  Looking_For: string;
  Description: string;
  Skills: string;
  Amount: string | number;
  currency: string;
}

interface Request {
  name: string;
  message: string;
}

interface GigLobbyScreenProps {
  gigInfo: GigInfo | null;
  requests: Request[];
}

export default function GigLobbyScreen({
  gigInfo,
  requests,
}: GigLobbyScreenProps) {
  return (
    <>
      <Header logoText="Kozeo" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-text-1">
        <Sidebar />
        <div className="flex-1 flex flex-col p-0 sm:p-8">
          <main className="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-center w-full max-w-6xl mx-auto py-8">
            {/* Project Info Container */}
            <section className="flex-1 bg-forge-bg-raised/70 border border-container-3 rounded-sm p-6 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:drop-shadow-glow transition-all duration-300 min-w-[300px] max-w-xl">
              <h2 className="text-2xl font-bold mb-4">Project Info</h2>
              {gigInfo ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Title:</span>{" "}
                    {gigInfo.Title}
                  </div>
                  <div>
                    <span className="font-semibold">Host:</span> {gigInfo.host}
                  </div>
                  <div>
                    <span className="font-semibold">Looking For:</span>{" "}
                    {gigInfo.Looking_For}
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>{" "}
                    {gigInfo.Description}
                  </div>
                  <div>
                    <span className="font-semibold">Skills:</span>{" "}
                    {gigInfo.Skills}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span>{" "}
                    {gigInfo.Amount} {gigInfo.currency}
                  </div>
                </div>
              ) : (
                <div className="text-text-3">No project info available.</div>
              )}
            </section>
            {/* Incoming Requests Container */}
            <section className="flex-1 bg-forge-bg-raised/70 border border-container-3 rounded-sm p-6 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:drop-shadow-glow transition-all duration-300 min-w-[300px] max-w-xl">
              <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
              {requests && requests.length > 0 ? (
                <ul className="space-y-4">
                  {requests.map((req: Request, idx: number) => (
                    <li
                      key={idx}
                      className="bg-forge-bg-raised/80 rounded-sm p-4 flex flex-col gap-2"
                    >
                      <div className="font-semibold">{req.name}</div>
                      <div className="text-sm text-text-1">{req.message}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-4 py-2 rounded-sm bg-forge-ember-low hover:bg-forge-ember-low text-text-1 text-sm font-semibold">
                          Accept
                        </button>
                        <button className="px-4 py-2 rounded-sm bg-[forge-error-bg hover:bg-[forge-error-bg text-text-1 text-sm font-semibold">
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-text-3">No incoming requests.</div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
