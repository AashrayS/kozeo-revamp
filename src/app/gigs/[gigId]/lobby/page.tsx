"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import RequestCard from "@/components/common/RequestCard";
import { PageLoader } from "@/components/common/PageLoader";
import { FiStar } from "react-icons/fi";
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
    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
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
    return <PageLoader />;
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
        className={`min-h-screen relative z-10 flex theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Glows */}
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

          <main className="flex-1 flex flex-col xl:flex-row gap-2 sm:gap-3 lg:gap-4 xl:gap-6 p-2 sm:p-3 lg:p-4 xl:p-6 min-h-0 overflow-hidden">
            {/* Gig Info Container - Responsive section */}
            <section
              className={`xl:flex-[0.4] rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 w-full border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition min-h-0 ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              {/* Header */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1
                  className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light tracking-tight mb-2 leading-tight ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-3">
                  <span
                    className={`text-xs sm:text-sm lg:text-base font-medium ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    @{gig.host?.username || "Unknown"}
                  </span>
                  <div
                    className={`h-1 w-1 rounded-full ${
                      theme === "light" ? "bg-gray-300" : "bg-gray-600"
                    }`}
                  />
                  <div
                    className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${
                      gig.status === "active"
                        ? theme === "light"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-green-950/50 border-green-800/50 text-green-300"
                        : theme === "light"
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400"
                    }`}
                  >
                    {gig.status || "Unknown"}
                  </div>
                </div>
              </div>

              {/* Project Value */}
              <div className="mb-6 sm:mb-8">
                {gig.amount === 0 ? (
                  <div
                    className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-purple-900/60 to-blue-900/60 text-purple-300 border border-purple-700/50"
                        : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200"
                    }`}
                  >
                    <FiStar className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm">
                      Skill Forge Gig - Learning & Collaboration
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {gig.currency} {gig.amount}
                    </div>
                    <div
                      className={`text-xs sm:text-sm lg:text-base ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Project value
                    </div>
                  </>
                )}
              </div>

              {/* Content Sections */}
              <div className="space-y-6 sm:space-y-8">
                {/* Description */}
                <div>
                  <h3
                    className={`text-xs sm:text-sm lg:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Description
                  </h3>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {gig.description}
                  </p>
                </div>

                {/* Looking For */}
                <div>
                  <h3
                    className={`text-xs sm:text-sm lg:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Looking For
                  </h3>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {gig.looking_For}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h3
                    className={`text-xs sm:text-sm lg:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {gig.skills?.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-full border ${
                          theme === "light"
                            ? "bg-gray-50 border-gray-200 text-gray-700"
                            : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* System Information */}
                <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-3">
                    {/* <div className="flex items-center justify-between">
                      <span
                        className={`text-sm uppercase tracking-wide font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Connection
                      </span>
                      <div
                        className={`flex items-center gap-2 ${
                          wsConnected
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            wsConnected ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {wsConnected ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm uppercase tracking-wide font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Project ID
                      </span>
                      <code
                        className={`text-sm font-mono px-2 py-1 rounded ${
                          theme === "light"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {gigId}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Entry Option for Host when Guest is assigned - Bottom of container */}
              {user && gig.host?.id === user.id && gig.guest && (
                <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-sm uppercase tracking-wide font-medium ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Workspace Status
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        theme === "light" ? "text-green-600" : "text-green-400"
                      }`}
                    >
                      Ready to start
                    </span>
                  </div>

                  {/* Guest Information */}
                  <div
                    className={`mb-4 p-4 rounded-xl border ${
                      theme === "light"
                        ? "bg-gray-50/50 border-gray-200/50"
                        : "bg-gray-800/30 border-gray-700/50"
                    }`}
                  >
                    <div
                      className={`text-sm uppercase tracking-wide font-medium mb-2 ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Current Guest
                    </div>
                    <div
                      className={`text-base font-medium ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      @{gig.guest.username}
                      {(gig.guest.first_name || gig.guest.last_name) && (
                        <span
                          className={`ml-2 font-normal ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
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

            {/* Incoming Requests Container - Responsive section */}
            <section
              className={`xl:flex-[0.6] rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-xl drop-shadow-glow backdrop-blur-md w-full border theme-transition min-h-0 flex flex-col ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 lg:mb-6 gap-2 sm:gap-3 flex-shrink-0">
                <h2
                  className={`text-lg sm:text-xl lg:text-2xl font-light tracking-tight ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Gig Requests
                </h2>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {requests.filter((req) => req.status === "pending").length >
                    0 && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                        theme === "light"
                          ? "bg-slate-50/80 border-slate-200/60 text-slate-700"
                          : "bg-slate-800/50 border-slate-700/50 text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          theme === "light" ? "bg-slate-400" : "bg-slate-400"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {
                          requests.filter((req) => req.status === "pending")
                            .length
                        }{" "}
                        Pending
                      </span>
                    </div>
                  )}
                  {requests.filter((req) => req.status === "accepted").length >
                    0 && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                        theme === "light"
                          ? "bg-emerald-50/80 border-emerald-200/60 text-emerald-700"
                          : "bg-emerald-950/50 border-emerald-800/50 text-emerald-300"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          theme === "light"
                            ? "bg-emerald-500"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {
                          requests.filter((req) => req.status === "accepted")
                            .length
                        }{" "}
                        Accepted
                      </span>
                    </div>
                  )}
                  {requests.filter((req) => req.status === "rejected").length >
                    0 && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                        theme === "light"
                          ? "bg-gray-50/80 border-gray-200/60 text-gray-600"
                          : "bg-gray-800/50 border-gray-700/50 text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          theme === "light" ? "bg-gray-400" : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {
                          requests.filter((req) => req.status === "rejected")
                            .length
                        }{" "}
                        Declined
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {requests && requests.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 xl:gap-6 pb-4">
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
                        <div key={idx} className="w-full">
                          <RequestCard
                            request={req}
                            index={idx}
                            processingRequests={processingRequests}
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-4">
                      📥
                    </div>
                    <div className="text-sm sm:text-base">No requests yet.</div>
                    <div className="text-xs sm:text-sm mt-2 opacity-70">
                      People interested in this gig will appear here.
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
