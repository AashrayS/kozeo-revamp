"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
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
import { FaStar } from "react-icons/fa";

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
      console.log("Request sender data:", request.sender);
      console.log("Request bio data:", request.sender?.bio);
      setRequests((prev) => {
        // debugger;
        console.log("Current requests:", prev);
        request.status = "pending"; // Ensure new requests have status set
        request.requestId = request.requestId || request.id; // Use requestId or id
        request.rating = request.requesterRating || 0;

        // Ensure bio and other data are properly set for WebSocket requests
        if (!request.requesterBio && request.sender?.bio) {
          request.requesterBio = request.sender.bio;
        }
        if (
          !request.requesterProfilePicture &&
          request.sender?.profile_Picture
        ) {
          request.requesterProfilePicture = request.sender.profile_Picture;
        }
        if (
          !request.requesterGigHostedCount &&
          request.sender?.gigHostedCount
        ) {
          request.requesterGigHostedCount = request.sender.gigHostedCount;
        }
        if (
          !request.requesterGigCollaboratedCount &&
          request.sender?.gigCollaboratedCount
        ) {
          request.requesterGigCollaboratedCount =
            request.sender.gigCollaboratedCount;
        }

        console.log("Processed request with bio:", request.requesterBio);

        // // Check for duplicates based on requestId or requesterName
        // const isDuplicate = prev.some(
        //   (existingReq) =>
        //     (existingReq.requestId &&
        //       request.requestId &&
        //       existingReq.requestId === request.requestId) ||
        //     (existingReq.id &&
        //       request.requestId &&
        //       existingReq.id === request.requestId) ||
        //     existingReq.requesterName === request.requesterName ||
        //     existingReq.name === request.requesterName
        // );

        // if (isDuplicate) {
        //   console.log("Duplicate request detected, not adding:", request);
        //   return prev;
        // }

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

    // Handle gig request responses (accept/reject)
    socket.on("gig-request-response", (responseData) => {
      console.log("Request response received:", responseData);
      const { requestId, requesterName, response, hostUsername } = responseData;

      // Update the request status in the list
      setRequests((prev) => {
        const updatedRequests = prev.map((req) => {
          // Match by requestId or requesterName
          if (
            (requestId && req.requestId === requestId) ||
            req.requesterName === requesterName ||
            req.name === requesterName
          ) {
            return {
              ...req,
              status: response, // "accepted" or "rejected"
              responseTime: new Date().toISOString(),
            };
          }
          return req;
        });

        console.log(
          `Updated request status for ${requesterName}: ${response}`,
          updatedRequests
        );
        return updatedRequests;
      });

      // Show a notification about the response
      if (response === "accepted") {
        console.log(
          `${requesterName}'s request was accepted by ${hostUsername}`
        );
      } else if (response === "rejected") {
        console.log(
          `${requesterName}'s request was rejected by ${hostUsername}`
        );
      }
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
        // debugger;
        const gigData = await getGigById(gigId);
        setGig(gigData);
        // destruct active reqiest for {
        //id : activerequets.id , username : activerequest.sender.usernmae , rating: activerquest.sender.rating , status
        //}

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
            (req: any) => {
              console.log("Transforming request with sender:", req.sender);
              console.log("Sender bio:", req.sender?.bio);

              return {
                id: req.id,
                requestId: req.id, // Use the database ID as requestId
                requesterName: req.sender.username,
                name: req.sender.username,
                message: req.message || "Request to join this gig",
                timestamp: req.createdAt,
                gigId: req.gigId,
                status: req.status,
                sender: req.sender, // Keep full sender info for potential use
                rating: req.sender.rating, // Add rating from sender
                requesterRating: req.sender.rating, // Also add as requesterRating for consistency
                requesterGigHostedCount: req.sender.gigHostedCount || 0, // Add gigHostedCount from sender
                requesterGigCollaboratedCount:
                  req.sender.gigCollaboratedCount || 0, // Add gigCollaboratedCount from sender
                requesterProfilePicture: req.sender.profile_Picture || "", // Add profile picture if available
                requesterBio: req.sender.bio || "", // Add bio if available
              };
            }
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

      // Update the request status locally instead of removing it
      setRequests((prev) =>
        prev.map((req, i) =>
          i === index
            ? {
                ...req,
                status: "accepted",
                responseTime: new Date().toISOString(),
              }
            : req
        )
      );

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
      // debugger;
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

      // Update the request status locally instead of removing it
      setRequests((prev) =>
        prev.map((req, i) =>
          i === index
            ? {
                ...req,
                status: "rejected",
                responseTime: new Date().toISOString(),
              }
            : req
        )
      );

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
          <ProfessionalButton
            onClick={() => router.push("/Atrium")}
            variant="primary"
            className="mx-auto"
          >
            Go back to Atrium
          </ProfessionalButton>
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
          <ProfessionalButton
            onClick={() => router.push("/Atrium")}
            variant="primary"
            className="mx-auto"
          >
            Go back to Atrium
          </ProfessionalButton>
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

                  <ProfessionalButton
                    onClick={() => router.push(`/Gig/${gigId}`)}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    icon={
                      <svg
                        className="w-4 h-4"
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
                    }
                  >
                    Enter Workspace
                  </ProfessionalButton>
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
                <h2 className="text-2xl font-bold">Request History</h2>
                <div className="flex items-center gap-2">
                  {requests.filter((req) => req.status === "pending").length >
                    0 && (
                    <div className="bg-indigo-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {
                        requests.filter((req) => req.status === "pending")
                          .length
                      }
                    </div>
                  )}
                  {requests.filter((req) => req.status === "accepted").length >
                    0 && (
                    <div className="bg-green-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {
                        requests.filter((req) => req.status === "accepted")
                          .length
                      }{" "}
                      ✓
                    </div>
                  )}
                  {requests.filter((req) => req.status === "rejected").length >
                    0 && (
                    <div className="bg-red-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {
                        requests.filter((req) => req.status === "rejected")
                          .length
                      }{" "}
                      ✗
                    </div>
                  )}
                </div>
              </div>
              {requests && requests.length > 0 ? (
                <ul className="space-y-4">
                  {requests
                    .sort((a, b) => {
                      // Sort by status priority: pending first, then accepted, then rejected
                      const statusOrder: { [key: string]: number } = {
                        pending: 0,
                        accepted: 1,
                        rejected: 2,
                      };
                      const aStatus = a.status || "unknown";
                      const bStatus = b.status || "unknown";
                      return (
                        (statusOrder[aStatus] || 3) -
                        (statusOrder[bStatus] || 3)
                      );
                    })
                    .map((req: any, idx: number) => (
                      <li
                        key={idx}
                        className={`
                          relative rounded-2xl p-6 flex flex-col gap-4 
                          transition-all duration-300 ease-out
                          backdrop-blur-sm shadow-lg hover:shadow-xl
                          border group overflow-hidden
                          ${
                            req.status === "pending"
                              ? theme === "light"
                                ? "bg-gradient-to-br from-slate-50/90 via-indigo-25/80 to-slate-100/90 border-slate-300/60 hover:border-indigo-300/80 hover:shadow-slate-200/30"
                                : "bg-gradient-to-br from-slate-900/40 via-indigo-950/30 to-slate-800/40 border-slate-600/60 hover:border-indigo-500/80 hover:shadow-slate-900/20"
                              : req.status === "accepted"
                              ? theme === "light"
                                ? "bg-gradient-to-br from-emerald-50/90 via-green-25/80 to-emerald-50/90 border-emerald-200/60 hover:border-emerald-300/80 hover:shadow-emerald-200/20"
                                : "bg-gradient-to-br from-emerald-950/40 via-emerald-900/30 to-green-950/40 border-emerald-700/60 hover:border-emerald-600/80 hover:shadow-emerald-900/20"
                              : req.status === "rejected"
                              ? theme === "light"
                                ? "bg-gradient-to-br from-red-50/90 via-rose-25/80 to-red-50/90 border-red-200/60 hover:border-red-300/80 hover:shadow-red-200/20"
                                : "bg-gradient-to-br from-red-950/40 via-red-900/30 to-rose-950/40 border-red-700/60 hover:border-red-600/80 hover:shadow-red-900/20"
                              : theme === "light"
                              ? "bg-gradient-to-br from-gray-50/90 via-slate-25/80 to-gray-50/90 border-gray-200/60 hover:border-gray-300/80 hover:shadow-gray-200/20"
                              : "bg-gradient-to-br from-neutral-900/60 via-neutral-800/50 to-neutral-900/60 border-neutral-700/60 hover:border-neutral-600/80 hover:shadow-neutral-900/20"
                          }
                        `}
                      >
                        {/* Subtle shine effect on hover */}
                        <div
                          className={`
                            absolute inset-0 opacity-0 transition-opacity duration-500
                            ${
                              req.status === "pending"
                                ? "group-hover:opacity-100"
                                : ""
                            }
                            bg-gradient-to-r from-transparent via-white/5 to-transparent
                            transform -skew-x-12 translate-x-full group-hover:-translate-x-full
                            transition-transform duration-700 pointer-events-none
                          `}
                        />

                        {/* Header section with user info and status */}
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {/* Profile Picture or Avatar */}
                            <div className="relative">
                              {req.requesterProfilePicture ? (
                                <img
                                  src={req.requesterProfilePicture}
                                  alt={`${
                                    req.requesterName || req.name
                                  } profile`}
                                  className={`
                                    w-14 h-14 rounded-full object-cover shadow-lg border-2 transition-all duration-300
                                    ${
                                      req.status === "pending"
                                        ? "border-indigo-400/50"
                                        : req.status === "accepted"
                                        ? "border-emerald-400/50"
                                        : req.status === "rejected"
                                        ? "border-red-400/50"
                                        : "border-gray-400/50"
                                    }
                                  `}
                                />
                              ) : (
                                <div
                                  className={`
                                    w-14 h-14 rounded-full flex items-center justify-center
                                    bg-gradient-to-br font-bold text-white shadow-lg border-2 transition-all duration-300
                                    ${
                                      req.status === "pending"
                                        ? "from-slate-500 to-indigo-600 border-indigo-400/50"
                                        : req.status === "accepted"
                                        ? "from-emerald-500 to-green-600 border-emerald-400/50"
                                        : req.status === "rejected"
                                        ? "from-red-500 to-rose-600 border-red-400/50"
                                        : "from-gray-500 to-slate-600 border-gray-400/50"
                                    }
                                  `}
                                >
                                  {(req.requesterName || req.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <div
                                className={`font-bold text-lg transition-colors duration-300 ${
                                  theme === "light"
                                    ? "text-gray-900"
                                    : "text-white"
                                }`}
                              >
                                @{req.requesterName || req.name}
                              </div>

                              {/* Gig stats - Hosted and Collaborated counts */}
                              <div className="flex items-center gap-3 mt-1">
                                <div
                                  className={`
                                    flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                                    backdrop-blur-sm border transition-colors duration-300
                                    ${
                                      theme === "light"
                                        ? "bg-blue-100/50 border-blue-200/50 text-blue-700"
                                        : "bg-blue-900/30 border-blue-700/50 text-blue-300"
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>
                                    {req.requesterGigHostedCount || 0} hosted
                                  </span>
                                </div>
                                <div
                                  className={`
                                    flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                                    backdrop-blur-sm border transition-colors duration-300
                                    ${
                                      theme === "light"
                                        ? "bg-purple-100/50 border-purple-200/50 text-purple-700"
                                        : "bg-purple-900/30 border-purple-700/50 text-purple-300"
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>
                                    {req.requesterGigCollaboratedCount || 0}{" "}
                                    collaborated
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced status indicator */}
                              <div
                                className={`
                                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mt-2
                                  backdrop-blur-sm border shadow-sm transition-all duration-300 w-fit
                                  ${
                                    req.status === "pending"
                                      ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-700 dark:text-indigo-300"
                                      : req.status === "accepted"
                                      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-700 dark:text-emerald-300"
                                      : req.status === "rejected"
                                      ? "bg-red-500/20 border-red-400/30 text-red-700 dark:text-red-300"
                                      : "bg-gray-500/20 border-gray-400/30 text-gray-700 dark:text-gray-300"
                                  }
                                `}
                              >
                                {req.status === "pending" && (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                    Pending Review
                                  </>
                                )}
                                {req.status === "accepted" && (
                                  <>
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Accepted
                                  </>
                                )}
                                {req.status === "rejected" && (
                                  <>
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Rejected
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Rating and timestamp section */}
                          <div className="flex flex-col items-end gap-2">
                            <div
                              className={`
                              flex items-center gap-1.5 px-2 py-1 rounded-lg
                              backdrop-blur-sm border transition-colors duration-300
                              ${
                                theme === "light"
                                  ? "bg-white/50 border-gray-200/50 text-gray-600"
                                  : "bg-black/20 border-neutral-600/30 text-gray-300"
                              }
                            `}
                            >
                              <FaStar
                                className={`${
                                  theme === "light"
                                    ? "text-yellow-500"
                                    : "text-yellow-400"
                                }`}
                                size={12}
                              />
                              <span className="text-sm font-medium">
                                {(() => {
                                  const rating =
                                    req.requesterRating ||
                                    req.rating ||
                                    req.sender?.rating;
                                  return rating
                                    ? `${Number(rating).toFixed(1)}`
                                    : "N/A";
                                })()}
                              </span>
                            </div>

                            <div
                              className={`text-xs font-medium ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {req.timestamp
                                ? new Date(req.timestamp).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Just now"}
                            </div>

                            {req.responseTime && req.status !== "pending" && (
                              <div
                                className={`text-xs px-2 py-0.5 rounded backdrop-blur-sm border font-medium ${
                                  req.status === "accepted"
                                    ? theme === "light"
                                      ? "bg-emerald-100/50 border-emerald-200/50 text-emerald-700"
                                      : "bg-emerald-900/30 border-emerald-700/50 text-emerald-300"
                                    : theme === "light"
                                    ? "bg-red-100/50 border-red-200/50 text-red-700"
                                    : "bg-red-900/30 border-red-700/50 text-red-300"
                                }`}
                              >
                                {new Date(req.responseTime).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Bio section */}
                        {(req.requesterBio || req.sender?.bio) && (
                          <div
                            className={`
                              relative p-4 rounded-xl transition-colors duration-300
                              backdrop-blur-sm border
                              ${
                                theme === "light"
                                  ? "bg-slate-50/40 border-slate-200/40 text-slate-700"
                                  : "bg-slate-900/20 border-slate-700/30 text-slate-300"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className={`w-4 h-4 ${
                                  theme === "light"
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  theme === "light"
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
                                About
                              </span>
                            </div>
                            <div className="text-sm leading-relaxed">
                              {req.requesterBio ||
                                req.sender?.bio ||
                                "No bio available"}
                            </div>
                          </div>
                        )}
                        {/* Message section */}
                        <div
                          className={`
                            relative p-4 rounded-xl transition-colors duration-300
                            backdrop-blur-sm border
                            ${
                              theme === "light"
                                ? "bg-white/40 border-gray-200/40 text-gray-800"
                                : "bg-black/20 border-neutral-600/30 text-gray-200"
                            }
                          `}
                        >
                          <div className="text-sm leading-relaxed font-medium">
                            {req.message}
                          </div>
                        </div>

                        {/* Action buttons section */}
                        {req.status === "pending" && (
                          <div className="relative z-10 flex gap-3 mt-2">
                            <ProfessionalButton
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
                              variant="neutral"
                              size="sm"
                              className="flex-1"
                              icon={
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              }
                            >
                              View Profile
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => handleAcceptRequest(req, idx)}
                              disabled={processingRequests.has(idx)}
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              loading={processingRequests.has(idx)}
                              loadingText="Processing..."
                              icon={
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              }
                            >
                              Accept
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => handleRejectRequest(req, idx)}
                              disabled={processingRequests.has(idx)}
                              variant="danger"
                              size="sm"
                              className="flex-1"
                              loading={processingRequests.has(idx)}
                              loadingText="Processing..."
                              icon={
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              }
                            >
                              Reject
                            </ProfessionalButton>
                          </div>
                        )}

                        {/* Enhanced status messages for processed requests */}
                        {req.status === "accepted" && (
                          <div
                            className={`
                            relative z-10 mt-3 p-4 rounded-xl backdrop-blur-sm border
                            transition-all duration-300
                            ${
                              theme === "light"
                                ? "bg-emerald-100/60 border-emerald-200/60 text-emerald-800"
                                : "bg-emerald-900/30 border-emerald-700/50 text-emerald-200"
                            }
                          `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${
                                  theme === "light"
                                    ? "bg-emerald-200 text-emerald-700"
                                    : "bg-emerald-800/50 text-emerald-300"
                                }
                              `}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm">
                                  Request Accepted
                                </div>
                                <div className="text-xs opacity-90">
                                  User can now join the gig workspace
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {req.status === "rejected" && (
                          <div
                            className={`
                            relative z-10 mt-2 px-3 py-2 rounded-lg backdrop-blur-sm border
                            transition-all duration-300 text-center
                            ${
                              theme === "light"
                                ? "bg-red-100/40 border-red-200/40 text-red-700"
                                : "bg-red-900/20 border-red-700/30 text-red-300"
                            }
                          `}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-medium text-xs">
                                Request Declined
                              </span>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="text-4xl mb-4">📥</div>
                  <div>No requests yet.</div>
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
