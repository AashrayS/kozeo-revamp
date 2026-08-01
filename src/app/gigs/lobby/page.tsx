"use client";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

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

export default function GigLobbyPage() {
  const router = useRouter();
  const [gigInfo, setGigInfo] = useState<GigInfo | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    // Read gig info from localStorage (set by create page)
    const gigStr =
      typeof window !== "undefined"
        ? localStorage.getItem("kozeo_gig_lobby")
        : null;
    let gigId: string | number | undefined = undefined;
    if (gigStr) {
      try {
        const gig = JSON.parse(gigStr);
        setTimeout(() => setGigInfo(gig), 0);
        gigId = gig.gigId || gig.id || gig.Title || "1";
      } catch {
        setTimeout(() => setGigInfo(null), 0);
      }
    }
    // Connect to WebSocket for incoming requests
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      query: { gigID: gigId || "1" },
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      if (gigId) socket.emit("join-room", gigId.toString());
    });
    socket.on("gig-request", (request) => {
      console.log("Incoming request:", request);
      setRequests((prev) => [...prev, request]);
    });
    setRequests([]);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div className="min-h-screen relative z-10 flex flex-row text-text-1">
        <div className="flex-1 flex flex-col p-0 sm:p-8">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-0 pt-4 flex justify-start">
            <button
              onClick={() => router.back()}
              className="flex items-center text-sm font-medium transition-colors text-text-3 hover:text-text-1 hover:scale-[1.02]"
            >
              <FiArrowLeft className="mr-2 w-4 h-4" />
              Back
            </button>
          </div>
          <main className="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-center w-full max-w-6xl mx-auto py-8">
            {/* Gig Info Container */}
            <section className="flex-1 bg-container-2 border border-container-3 rounded-sm p-6 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:drop-shadow-glow transition-all duration-300 min-w-[300px] max-w-xl">
              <h2 className="text-2xl font-bold mb-4">Gig Info</h2>
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
                <div className="text-text-3">No gig info available.</div>
              )}
            </section>
            {/* Incoming Requests Container */}
            <section className="flex-1 bg-container-2 border border-container-3 rounded-sm p-6 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:drop-shadow-glow transition-all duration-300 min-w-[300px] max-w-xl">
              <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
              {requests && requests.length > 0 ? (
                <ul className="space-y-4">
                  {requests.map((req: any, idx: number) => (
                    <li
                      key={idx}
                      className="bg-forge-bg-raised/80 rounded-sm p-4 flex flex-col gap-2"
                    >
                      <div className="font-semibold">{req.requesterName || req.name}</div>
                      <div className="text-sm text-text-1">{req.message}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-4 py-2 rounded-sm bg-forge-ember-low hover:bg-forge-ember-low text-text-1 text-sm font-semibold"
                          onClick={() => {
                            const username = req.requesterName || req.name;
                            if (username) window.open(`/profile/${username.replace(/^@/,"")}`);
                          }}
                        >
                          View Profile
                        </button>
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
