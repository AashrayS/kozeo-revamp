"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { io, Socket } from "socket.io-client";
import {
  getGigById,
  sendGigRequest,
  respondToGigRequest,
} from "../../../../../utilities/kozeoApi";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../../store/hooks";
import { useTheme } from "../../../../contexts/ThemeContext";

interface Request {
  id?: string;
  name?: string;
  requesterName?: string;
  message: string;
  timestamp?: string;
  gigId?: string;
  requestId?: string; // Database ID for API operations
  status?: string;
  sender?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_Picture?: string;
    rating?: number;
    bio?: string;
  };
}

export default function GigLobbyPage({
  params: paramsPromise,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = use(paramsPromise);
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<number>>(
    new Set()
  );
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

        // Check for duplicates based on requestId or requesterName
        const isDuplicate = prev.some(
          (existingReq) =>
            (existingReq.requestId &&
              request.requestId &&
              existingReq.requestId === request.requestId) ||
            (existingReq.id &&
              request.requestId &&
              existingReq.id === request.requestId) ||
            existingReq.requesterName === request.requesterName ||
            existingReq.name === request.requesterName
        );

        if (isDuplicate) {
          console.log("Duplicate request detected, not adding:", request);
          return prev;
        }

        const newRequests = [...prev, request];
        console.log("Updated requests:", newRequests);
        return newRequests;
      });
    });

    socket.on("gig-request-cancel", (cancelData) => {
      console.log("Request cancelled:", cancelData);
      const { requesterName, requestId } = cancelData;

      // Remove the cancelled request from the list
      setRequests((prev) => {
        const updatedRequests = prev.filter(
          (req) =>
            // Remove by requestId if available, otherwise by name
            !(requestId && req.requestId === requestId) &&
            !(req.requesterName === requesterName || req.name === requesterName)
        );
        console.log(
          `Removed request from ${requesterName}${
            requestId ? ` (ID: ${requestId})` : ""
          }. Remaining requests:`,
          updatedRequests
        );
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

  // Fetch gig data and extract active requests
  useEffect(() => {
    const fetchGig = async () => {
      try {
        setLoading(true);
        const gigData = await getGigById(gigId);
        setGig(gigData);

        // Extract and set active requests from gig data if user is the host
        if (
          user &&
          gigData &&
          user.id === (gigData as any).host?.id &&
          (gigData as any).activeRequest
        ) {
          console.log(
            "Loading active requests from gig data:",
            (gigData as any).activeRequest
          );

          // Transform database requests to match the expected format
          const transformedRequests = (gigData as any).activeRequest.map(
            (req: any) => ({
              id: req.id,
              requestId: req.id, // Use the database ID as requestId
              requesterName: req.sender.username,
              name: req.sender.username,
              message: req.message || "Request to join this gig",
              timestamp: req.createdAt,
              gigId: req.gigId,
              status: req.status,
              sender: req.sender, // Keep full sender info for potential use
            })
          );

          // Set initial requests from database
          setRequests(transformedRequests);
          console.log(
            "Set initial requests from database:",
            transformedRequests
          );
        }
      } catch (err: any) {
        console.error("Error fetching gig:", err);
        setError(err.message || "Failed to load gig");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [gigId, user]); // Include user in dependencies so it runs when user is available

  const handleAcceptRequest = async (request: any, index: number) => {
    if (!user || !request.requestId) {
      alert("Unable to process request. Missing required information.");
      return;
    }

    setProcessingRequests((prev) => new Set([...prev, index]));

    try {
      console.log("Accepting request:", request);

      // Call API to accept the request
      const response = await respondToGigRequest(request.requestId, "accepted");
      console.log("Request accepted successfully:", response);

      // Remove the request from the list
      setRequests((prev) => prev.filter((_, i) => i !== index));

      // Send WebSocket notification about acceptance to the requester
      if (socketRef.current && socketRef.current.connected) {
        // Send general gig-request-response for room updates
        socketRef.current.emit("gig-request-response", {
          gigId: gigId,
          requestId: request.requestId,
          requesterName: request.requesterName || request.name,
          response: "accepted",
          hostUsername: user.username,
          timestamp: new Date().toISOString(),
        });

        // Send targeted notification to the requester
        const notification = {
          id: `gig-accept-${request.requestId}-${Date.now()}`,
          type: "success",
          title: "Gig Request Accepted!",
          message: `${user.username} has accepted your request to join "${
            gig?.title || "the gig"
          }". You can now access the gig workspace.`,
          timestamp: new Date().toISOString(),
          read: false,
          username: request.requesterName || request.name,
          action: "view_gig",
          actionLabel: "Go to Gig",
          gigId: gigId,
        };

        socketRef.current.emit("send-notification", {
          targetUsername: request.requesterName || request.name,
          notification: notification,
        });

        console.log(
          "Sent acceptance notification to:",
          request.requesterName || request.name
        );
      }

      alert(`Request from ${request.requesterName || request.name} accepted!`);
      debugger;
      // Navigate to the gig workspace/chat page
      router.push(`/Gig/${gigId}`);
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request. Please try again.");
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (request: any, index: number) => {
    if (!user || !request.requestId) {
      alert("Unable to process request. Missing required information.");
      return;
    }

    setProcessingRequests((prev) => new Set([...prev, index]));

    try {
      console.log("Rejecting request:", request);

      // Call API to reject the request
      const response = await respondToGigRequest(request.requestId, "rejected");
      console.log("Request rejected successfully:", response);

      // Remove the request from the list
      setRequests((prev) => prev.filter((_, i) => i !== index));

      // Send WebSocket notification about rejection
      if (socketRef.current && socketRef.current.connected) {
        // Send general gig-request-response for room updates
        socketRef.current.emit("gig-request-response", {
          gigId: gigId,
          requestId: request.requestId,
          requesterName: request.requesterName || request.name,
          response: "rejected",
          hostUsername: user.username,
          timestamp: new Date().toISOString(),
        });

        // Send targeted notification to the requester
        const notification = {
          id: `gig-reject-${request.requestId}-${Date.now()}`,
          type: "warning",
          title: "Gig Request Declined",
          message: `${user.username} has declined your request to join "${
            gig?.title || "the gig"
          }". You can explore other opportunities in the Atrium.`,
          timestamp: new Date().toISOString(),
          read: false,
          username: request.requesterName || request.name,
          action: "view_atrium",
          actionLabel: "Browse Gigs",
        };

        socketRef.current.emit("send-notification", {
          targetUsername: request.requesterName || request.name,
          notification: notification,
        });

        console.log(
          "Sent rejection notification to:",
          request.requesterName || request.name
        );
      }

      alert(`Request from ${request.requesterName || request.name} rejected.`);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Test function to manually add a request (for debugging)
  const addTestRequest = () => {
    const testRequest = {
      requesterName: "testuser",
      message: "This is a test request to check if the UI works",
      timestamp: new Date().toISOString(),
      gigId: gigId,
      status: "pending", // Add pending status so it shows up
    };
    setRequests((prev) => [...prev, testRequest]);
    console.log("Added test request:", testRequest);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <div className="text-xl mb-4">Loading gig...</div>
        <div
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          WebSocket:{" "}
          <span
            className={`font-semibold ${
              wsConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {wsConnected ? "Connected" : "Connecting..."}
          </span>
        </div>
        <div
          className={`text-xs mt-2 ${
            theme === "light" ? "text-gray-500" : "text-gray-500"
          }`}
        >
          Gig ID: {gigId}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">Error loading gig</div>
          <div
            className={`mb-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {error}
          </div>
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
      <div
        className={`min-h-screen flex items-center justify-center theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <div className="text-center">
          <div
            className={`text-xl mb-4 ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Gig not found
          </div>
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
      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col p-0 sm:p-8">
          <main className="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-center w-full max-w-6xl mx-auto py-8">
            {/* Gig Info Container */}
            <section
              className={`flex-1 rounded-2xl p-6 shadow-xl drop-shadow-glow backdrop-blur-md min-w-[300px] max-w-xl border theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <h2 className="text-2xl font-bold mb-4">Gig Info</h2>
              <div className="space-y-4">
                <div>
                  <span
                    className={`font-semibold ${
                      theme === "light" ? "text-cyan-600" : "text-cyan-400"
                    }`}
                  >
                    Title:
                  </span>{" "}
                  <span
                    className={
                      theme === "light" ? "text-gray-900" : "text-white"
                    }
                  >
                    {gig.title}
                  </span>
                </div>
                <div>
                  <span
                    className={`font-semibold ${
                      theme === "light" ? "text-cyan-600" : "text-cyan-400"
                    }`}
                  >
                    Host:
                  </span>{" "}
                  <span
                    className={
                      theme === "light" ? "text-gray-900" : "text-white"
                    }
                  >
                    @{gig.host?.username || "Unknown"}
                  </span>
                </div>
                <div>
                  <span
                    className={`font-semibold ${
                      theme === "light" ? "text-cyan-600" : "text-cyan-400"
                    }`}
                  >
                    Gig ID:
                  </span>{" "}
                  <span
                    className={
                      theme === "light" ? "text-gray-900" : "text-white"
                    }
                  >
                    {gigId}
                  </span>
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

              {/* Chat Entry Option for Host when Guest is assigned - Bottom of container */}
              {user && gig.host?.id === user.id && gig.guest && (
                <div className="mt-6 pt-4 border-t border-neutral-700/50">
                  <div className="flex items-center justify-between text-sm text-neutral-300 mb-3">
                    <span>Workspace Status:</span>
                    <span className="text-green-400 font-medium">
                      Ready to start
                    </span>
                  </div>

                  {/* Guest Information */}
                  <div className="mb-4 p-3 bg-neutral-800/40 rounded-lg border border-neutral-700/50">
                    <div className="text-sm text-neutral-300 mb-1">
                      Current Guest:
                    </div>
                    <div className="text-white font-medium">
                      @{gig.guest.username}
                      {(gig.guest.first_name || gig.guest.last_name) && (
                        <span className="text-neutral-300 ml-2 font-normal">
                          ({gig.guest.first_name} {gig.guest.last_name})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/Gig/${gigId}`)}
                    className="w-full px-4 py-3 bg-neutral-800/60 hover:bg-neutral-700/80 border border-neutral-600/50 hover:border-cyan-500/50 text-neutral-200 hover:text-white rounded-lg transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 group-hover:text-cyan-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="font-medium">Enter Workspace</span>
                    </div>
                  </button>
                </div>
              )}
            </section>

            {/* Incoming Requests Container */}
            <section
              className={`flex-1 rounded-2xl p-6 shadow-xl drop-shadow-glow backdrop-blur-md min-w-[300px] max-w-xl border theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Incoming Requests</h2>
                <div className="flex items-center gap-2">
                  {requests.filter((req) => req.status === "pending").length >
                    0 && (
                    <div className="bg-cyan-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {
                        requests.filter((req) => req.status === "pending")
                          .length
                      }
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
              {requests &&
              requests.filter((req) => req.status === "pending").length > 0 ? (
                <ul className="space-y-4">
                  {requests
                    .filter((req) => req.status === "pending")
                    .map((req: any, idx: number) => (
                      <li
                        key={idx}
                        className={`rounded-xl p-4 flex flex-col gap-3 border transition-colors theme-transition ${
                          theme === "light"
                            ? "bg-gray-50/80 border-gray-200 hover:border-gray-300"
                            : "bg-neutral-800/80 border-neutral-700 hover:border-neutral-600"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className={`font-semibold text-lg ${
                              theme === "light" ? "text-gray-900" : "text-white"
                            }`}
                          >
                            @{req.requesterName || req.name}
                          </div>
                          <div
                            className={`text-xs ${
                              theme === "light"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {req.timestamp
                              ? new Date(req.timestamp).toLocaleTimeString()
                              : "Just now"}
                          </div>
                        </div>
                        <div
                          className={`text-sm p-3 rounded-lg ${
                            theme === "light"
                              ? "text-gray-700 bg-gray-100/50"
                              : "text-gray-300 bg-neutral-900/50"
                          }`}
                        >
                          {req.message}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                            onClick={() => {
                              const username = req.requesterName || req.name;
                              if (username) {
                                const cleanUsername = username.replace(
                                  /^@/,
                                  ""
                                );
                                router.push(`/profile/${cleanUsername}`);
                              }
                            }}
                          >
                            View Profile
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
                            onClick={() => handleAcceptRequest(req, idx)}
                            disabled={processingRequests.has(idx)}
                          >
                            {processingRequests.has(idx)
                              ? "Processing..."
                              : "Accept"}
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
                            onClick={() => handleRejectRequest(req, idx)}
                            disabled={processingRequests.has(idx)}
                          >
                            {processingRequests.has(idx)
                              ? "Processing..."
                              : "Reject"}
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
