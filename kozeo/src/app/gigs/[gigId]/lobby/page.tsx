"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { io, Socket } from "socket.io-client";
import { getGigById } from "../../../../../utilities/kozeoApi";
import { use } from "react";
import { useRouter } from "next/navigation";

interface Request {
  name?: string;
  requesterName?: string;
  message: string;
  timestamp?: string;
  gigId?: string;
}

export default function GigLobbyPage({
  params: paramsPromise,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = use(paramsPromise);
  const router = useRouter();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = React.useRef<Socket | null>(null);

  // Setup WebSocket connection IMMEDIATELY - no waiting for anything
  useEffect(() => {
    console.log("Setting up WebSocket connection for gig:", gigId);

    // Connect to WebSocket for incoming requests IMMEDIATELY
    const socket = io("ws://localhost:3001", {
      query: { gigID: gigId },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
      setWsConnected(true);
      socket.emit("join-room", gigId);
      console.log("Joined room:", gigId);
    });

    socket.on("gig-request", (request) => {
      console.log("Incoming request received:", request);
      setRequests((prev) => {
        console.log("Current requests:", prev);
        const newRequests = [...prev, request];
        console.log("Updated requests:", newRequests);
        return newRequests;
      });
    });

    socket.on("gig-request-cancel", (cancelData) => {
      console.log("Request cancelled:", cancelData);
      const { requesterName } = cancelData;
      
      // Remove the cancelled request from the list
      setRequests((prev) => {
        const updatedRequests = prev.filter(
          (req) => req.requesterName !== requesterName && req.name !== requesterName
        );
        console.log(`Removed request from ${requesterName}. Remaining requests:`, updatedRequests);
        return updatedRequests;
      });
      
      // Optional: Show a notification about the cancellation
      console.log(`${requesterName} cancelled their request`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setWsConnected(false);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    });

    // Test connection
    socket.on("user-joined", (userId) => {
      console.log("User joined room:", userId);
    });

    return () => {
      console.log("Disconnecting WebSocket");
      socket.disconnect();
    };
  }, [gigId]); // Only depends on gigId - connects immediately when component mounts

  // Fetch gig data SEPARATELY (this doesn't affect WebSocket connection)
  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        const gigData = await getGigById(gigId);
        setGig(gigData);
      } catch (err: any) {
        console.error("Error fetching gig:", err);
        setError(err.message || "Failed to load gig");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [gigId]);

  const handleAcceptRequest = (request: any, index: number) => {
    console.log("Accepting request:", request);

    // Remove the request from the list
    setRequests((prev) => prev.filter((_, i) => i !== index));

    // You can add logic here to:
    // 1. Update the gig status to "in_progress"
    // 2. Set the requester as the gig's guest
    // 3. Send notification to the requester
    // 4. Navigate to the actual gig workspace

    alert(`Request from ${request.requesterName || request.name} accepted!`);

    // Navigate to the gig workspace (you can modify this URL as needed)
    router.push(`/Gig/${gigId}`);
  };

  const handleRejectRequest = (request: any, index: number) => {
    console.log("Rejecting request:", request);

    // Remove the request from the list
    setRequests((prev) => prev.filter((_, i) => i !== index));

    // You can add logic here to:
    // 1. Send notification to the requester about rejection
    // 2. Log the rejection for analytics

    alert(`Request from ${request.requesterName || request.name} rejected.`);
  };

  // Test function to manually add a request (for debugging)
  const addTestRequest = () => {
    const testRequest = {
      requesterName: "testuser",
      message: "This is a test request to check if the UI works",
      timestamp: new Date().toISOString(),
      gigId: gigId,
    };
    setRequests((prev) => [...prev, testRequest]);
    console.log("Added test request:", testRequest);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <div className="text-xl mb-4">Loading gig...</div>
        <div className="text-sm text-gray-400">
          WebSocket: <span className={`font-semibold ${
            wsConnected ? "text-green-400" : "text-red-400"
          }`}>
            {wsConnected ? "Connected" : "Connecting..."}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Gig ID: {gigId}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-4">Error loading gig</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => router.push("/Atrium")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
          >
            Go back to Atrium
          </button>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <div className="text-center">
          <div className="text-xl text-gray-400 mb-4">Gig not found</div>
          <button
            onClick={() => router.push("/Atrium")}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
          >
            Go back to Atrium
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col p-0 sm:p-8">
          <main className="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-center w-full max-w-6xl mx-auto py-8">
            {/* Gig Info Container */}
            <section className="flex-1 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-xl drop-shadow-glow backdrop-blur-md min-w-[300px] max-w-xl">
              <h2 className="text-2xl font-bold mb-4">Gig Info</h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-cyan-400">Title:</span>{" "}
                  <span className="text-white">{gig.title}</span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">Host:</span>{" "}
                  <span className="text-white">
                    @{gig.host?.username || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">Gig ID:</span>{" "}
                  <span className="text-white">{gigId}</span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">
                    WebSocket Status:
                  </span>{" "}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      wsConnected
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {wsConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">
                    Looking For:
                  </span>{" "}
                  <span className="text-white">{gig.looking_For}</span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">
                    Description:
                  </span>{" "}
                  <span className="text-gray-300">{gig.description}</span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">Skills:</span>{" "}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {gig.skills?.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-neutral-800 border border-neutral-600 text-gray-300 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">Amount:</span>{" "}
                  <span className="text-green-400 font-bold">
                    {gig.currency} {gig.amount}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-cyan-400">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      gig.status === "active"
                        ? "bg-green-900 text-green-300"
                        : "bg-gray-900 text-gray-300"
                    }`}
                  >
                    {gig.status || "Unknown"}
                  </span>
                </div>
              </div>
            </section>

            {/* Incoming Requests Container */}
            <section className="flex-1 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-xl drop-shadow-glow backdrop-blur-md min-w-[300px] max-w-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Incoming Requests</h2>
                <div className="flex items-center gap-2">
                  {requests.length > 0 && (
                    <div className="bg-cyan-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {requests.length}
                    </div>
                  )}
                  {/* Test button for debugging */}
                  <button
                    onClick={addTestRequest}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition"
                  >
                    Test Request
                  </button>
                </div>
              </div>
              {requests && requests.length > 0 ? (
                <ul className="space-y-4">
                  {requests.map((req: any, idx: number) => (
                    <li
                      key={idx}
                      className="bg-neutral-800/80 rounded-xl p-4 flex flex-col gap-3 border border-neutral-700 hover:border-neutral-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-white text-lg">
                          @{req.requesterName || req.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.timestamp
                            ? new Date(req.timestamp).toLocaleTimeString()
                            : "Just now"}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 bg-neutral-900/50 p-3 rounded-lg">
                        {req.message}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                          onClick={() => {
                            const username = req.requesterName || req.name;
                            if (username) {
                              const cleanUsername = username.replace(/^@/, "");
                              router.push(`/profile/${cleanUsername}`);
                            }
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                          onClick={() => handleAcceptRequest(req, idx)}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
                          onClick={() => handleRejectRequest(req, idx)}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-4">📥</div>
                  <div>No incoming requests yet.</div>
                  <div className="text-sm mt-2">
                    People interested in this gig will appear here.
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>

        {/* Glows */}
        <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
        <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      </div>
    </>
  );
}
