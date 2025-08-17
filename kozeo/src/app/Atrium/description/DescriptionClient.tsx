"use client";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { PageLoader } from "@/components/common/PageLoader";
import { FiStar, FiUser } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getGigById,
  getUserBasicProfile,
  sendGigRequest,
  cancelGigRequest,
} from "../../../../utilities/kozeoApi";
import { io, Socket } from "socket.io-client";
import { useUser } from "../../../../store/hooks";
import { useTheme } from "@/contexts/ThemeContext";

export default function DescriptionClient() {
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();
  const [requested, setRequested] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [gig, setGig] = useState<any>(null);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hostLoading, setHostLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const searchParams = useSearchParams();
  const gigIdParam = searchParams.get("gigId");
  const socketRef = useRef<Socket | null>(null);

  const gigId = gigIdParam;

  useEffect(() => {
    const fetchGig = async () => {
      if (!gigId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        console.log("Fetching project with ID:", gigId);

        const gigData = await getGigById(gigId);

        if (gigData) {
          setGig(gigData);
          console.log("Project data fetched:", gigData);

          // Check if current user has already sent a request to this project
          if (user && (gigData as any).activeRequest) {
            const userRequest = (gigData as any).activeRequest.find(
              (req: any) =>
                req.sender?.id === user.id ||
                req.sender?.username === user.username
            );

            if (userRequest) {
              console.log("Found existing request from user:", userRequest);
              setRequested(true);
              setCurrentRequestId(userRequest.id);
              if (userRequest.status === "rejected") {
                setRejected(true);
              }
            } else {
              console.log("No existing request found for user");
              setRequested(false);
              setCurrentRequestId(null);
            }
          }

          // Fetch host profile data
          if ((gigData as any).host?.username) {
            setHostLoading(true);
            try {
              const hostData = await getUserBasicProfile(
                (gigData as any).host.username
              );
              setHostProfile(hostData);
              console.log("Host profile fetched:", hostData);
            } catch (hostError) {
              console.error("Error fetching host profile:", hostError);
              // Don't set error state for host profile, just use gig host data
            } finally {
              setHostLoading(false);
            }
          }
        } else {
          setError("Gig not found");
        }
      } catch (err: any) {
        console.error("Error fetching gig:", err);
        setError(err.message || "Failed to load gig");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [gigId, user]); // Include user in dependencies

  // Setup WebSocket connection
  useEffect(() => {
    if (gigId) {
      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
        query: { gigID: gigId },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to WebSocket server for gig:", gigId);
        socket.emit("join-room", gigId);
        console.log("Joined room:", gigId);
      });

      socket.on("gig-request-response", (responseData) => {
        console.log("Received gig request response:", responseData);
        const { requesterName, response, hostUsername, requestId } =
          responseData;

        // Check if this response is for the current user
        if (
          user &&
          (requesterName === user.username || requesterName === user.name)
        ) {
          if (response === "accepted") {
            alert(
              `Great! ${hostUsername} has accepted your request. You can now access the gig workspace.`
            );
            // Update UI state
            setRequested(false);
            setCurrentRequestId(null);
            // Optionally navigate to the gig workspace
            // router.push(`/Gig/${gigId}`);
          } else if (response === "rejected") {
            alert(
              `${hostUsername} has declined your request. You can explore other opportunities in the Atrium.`
            );
            // Update UI state
            setRequested(false);
            setRejected(true);
            setCurrentRequestId(null);
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [gigId, user]);

  const handleSendRequest = async () => {
    if (!user || !gigId) {
      alert("Please log in to send a request");
      return;
    }

    if (!requestMessage.trim()) {
      setShowMessageModal(true);
      return;
    }

    setSendingRequest(true);
    try {
      // First, save the request to the database
      const requestData = {
        gig: gigId,
        message: requestMessage.trim(),
        status: "pending",
      };

      console.log("Saving request to database:", requestData);
      const savedRequest = (await sendGigRequest(requestData)) as any;
      console.log("Request saved to database:", savedRequest);

      // Store the request ID for potential cancellation
      setCurrentRequestId(savedRequest?.id);

      // Then send via WebSocket for real-time updates
      const wsRequest = {
        gigId: gigId,
        request: {
          requesterName: user.username,
          message: requestMessage.trim(),
          status: "pending",
          requesterRating: user.rating || 0,
          requesterBio: savedRequest?.sender?.bio || "No bio available",
          requesterProfilePicture: savedRequest?.sender?.profile_Picture || "",
          requesterGigHostedCount: savedRequest?.sender?.gigHostedCount || 0,
          requesterGigCollaboratedCount:
            savedRequest?.sender?.gigCollaboratedCount || 0,
        },
        requestId: savedRequest?.id || Date.now().toString(), // Include the database ID
        hostUsername: hostUsername,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending WebSocket request data:", wsRequest);

      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.emit("gig-request", wsRequest);
          console.log("Request sent via WebSocket successfully");
        } else {
          console.error("WebSocket not connected");
          throw new Error("WebSocket not connected");
        }
      } else {
        console.error("WebSocket not initialized");
        throw new Error("WebSocket not initialized");
      }

      setRequested(true);
      setRequestMessage("");
      setShowMessageModal(false);
      // alert("Request sent successfully!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user || !gigId) {
      alert("Please log in to cancel request");
      return;
    }

    setSendingRequest(true);
    try {
      // First, cancel the request in the database if we have the request ID
      if (currentRequestId) {
        try {
          console.log("Cancelling request in database:", currentRequestId);
          await cancelGigRequest(currentRequestId);

          console.log("Request cancelled in database successfully");
        } catch (dbError) {
          console.error("Error cancelling request in database:", dbError);
          // Continue with WebSocket cancellation even if database call fails
        }
      }

      const cancelData = {
        gigId: gigId,
        requesterName: user.username,
        requestId: currentRequestId, // Include the request ID
        hostUsername: hostUsername,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending cancel request data:", cancelData);

      // Send cancel request via WebSocket
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.emit("gig-request-cancel", cancelData);
          console.log("Cancel request sent via WebSocket successfully");
        } else {
          console.error("WebSocket not connected");
          throw new Error("WebSocket not connected");
        }
      } else {
        console.error("WebSocket not initialized");
        throw new Error("WebSocket not initialized");
      }

      setRequested(false);
      setCurrentRequestId(null); // Clear the stored request ID
      // alert("Request cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert("Failed to cancel request. Please try again.");
    } finally {
      setSendingRequest(false);
    }
  };

  const openMessageModal = () => {
    if (!user) {
      alert("Please log in to send a request");
      return;
    }
    setShowMessageModal(true);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <main className="flex-1 p-10 flex justify-center items-center">
            <div className="text-red-400">{error}</div>
          </main>
        </div>
      </>
    );
  }

  if (!gig) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <main className="flex-1 p-10 flex justify-center items-center">
            <div
              className={`transition-colors duration-300 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No gig data available
            </div>
          </main>
        </div>
      </>
    );
  }

  // Use host profile data if available, otherwise fallback to gig host data
  const displayHost = hostProfile || gig?.host || {};
  const hostUsername = displayHost.username || gig?.host?.username || "unknown";

  return (
    <>
      <Header logoText="Kozeo" />
      {/* Glows */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col p-0 sm:p-8">
          <main className="flex-1 flex flex-col md:flex-row gap-8 items-stretch justify-center w-full mx-auto py-8">
            {/* Gig Details Container - Golden Ratio smaller section (38.2%) */}
            <section
              className={`md:flex-[0.618] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 min-w-[0] w-full border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              {/* Header */}
              <div className="mb-8">
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-2 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {gig.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span
                    className={`text-sm sm:text-base font-medium ${
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
                      gig.status === "open"
                        ? theme === "light"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-green-950/50 border-green-800/50 text-green-300"
                        : gig.status === "in_progress"
                        ? theme === "light"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                          : "bg-yellow-950/50 border-yellow-800/50 text-yellow-300"
                        : theme === "light"
                        ? "bg-gray-50 border-gray-200 text-gray-600"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400"
                    }`}
                  >
                    {gig.status?.charAt(0).toUpperCase() +
                      gig.status?.slice(1).replace("_", " ") || "Unknown"}
                  </div>
                </div>
              </div>

              {/* Project Value */}
              <div className="mb-8">
                {gig.amount === 0 ? (
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-purple-900/60 to-blue-900/60 text-purple-300 border border-purple-700/50"
                        : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200"
                    }`}
                  >
                    <FiStar className="w-4 h-4 mr-2" />
                    Skill Forge Gig - Learning & Collaboration
                  </div>
                ) : (
                  <>
                    <div
                      className={`text-xl sm:text-2xl md:text-3xl font-semibold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {gig.currency} {gig.amount}
                    </div>
                    <div
                      className={`text-sm sm:text-base ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Project value
                    </div>
                  </>
                )}
              </div>

              {/* Content Sections */}
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3
                    className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
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
                    className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
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
                    className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 tracking-wide uppercase ${
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

                {/* Project Status Information */}
                <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm uppercase tracking-wide font-medium ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Active Requests
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        {gig.activeRequest?.length || 0}
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-between">
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
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Action Button - Bottom of container */}
              <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm uppercase tracking-wide font-medium ${
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Your Status
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      user && gig.host?.id === user.id
                        ? theme === "light"
                          ? "text-blue-600"
                          : "text-blue-400"
                        : user &&
                          gig.guest &&
                          gig.guest.username === user.username
                        ? theme === "light"
                          ? "text-green-600"
                          : "text-green-400"
                        : requested
                        ? theme === "light"
                          ? "text-yellow-600"
                          : "text-yellow-400"
                        : theme === "light"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {user && gig.host?.id === user.id
                      ? "Host"
                      : user &&
                        gig.guest &&
                        gig.guest.username === user.username
                      ? "Collaborator"
                      : requested
                      ? "Request Sent"
                      : rejected
                      ? "Request Declined"
                      : "Visitor"}
                  </span>
                </div>

                {/* Show different button based on user status */}
                {user && gig.host?.id === user.id ? (
                  // User is the host
                  <ProfessionalButton
                    onClick={() => router.push(`/gigs/${gigId}/lobby`)}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    }
                  >
                    Go to Lobby
                  </ProfessionalButton>
                ) : gig.guest ? (
                  // Gig has a guest - check if current user is the guest
                  user && gig.guest.username === user.username ? (
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
                  ) : (
                    <ProfessionalButton
                      onClick={() => {}}
                      variant="neutral"
                      size="lg"
                      className="w-full"
                      disabled
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      }
                    >
                      Gig Closed
                    </ProfessionalButton>
                  )
                ) : (
                  // Gig is open, show send/cancel request button
                  <ProfessionalButton
                    onClick={requested ? handleCancelRequest : openMessageModal}
                    disabled={!user || rejected}
                    variant={
                      !user
                        ? "neutral"
                        : rejected
                        ? "warning"
                        : requested
                        ? "danger"
                        : "primary"
                    }
                    loading={sendingRequest}
                    loadingText={requested ? "Cancelling..." : "Sending..."}
                    size="lg"
                    className="w-full"
                    icon={
                      !user ? (
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
                      ) : rejected ? (
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
                      ) : requested ? (
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
                      ) : (
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )
                    }
                  >
                    {!user
                      ? "Login to Send Request"
                      : rejected
                      ? "Request Declined"
                      : requested
                      ? "Cancel Request"
                      : "Send Request"}
                  </ProfessionalButton>
                )}
              </div>
            </section>

            {/* Host Profile Container - Golden Ratio larger section (61.8%) */}
            <section
              className={`md:flex-[1] rounded-2xl p-6 shadow-xl drop-shadow-glow backdrop-blur-md min-w-[300px] border theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-2xl font-light tracking-tight ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  About the Host
                </h2>
                <ProfessionalButton
                  onClick={() => router.push(`/profile/${hostUsername}`)}
                  variant="neutral"
                  size="sm"
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
              </div>

              {hostLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <div
                      className={`text-base ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Loading host profile...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Host Profile Header */}
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      {displayHost.profile_Picture && !displayHost._imgError ? (
                        <img
                          src={displayHost.profile_Picture}
                          alt={displayHost.username}
                          className="w-20 h-20 rounded-full object-cover shadow-lg"
                          style={{
                            backgroundColor: "#1f2937",
                            border: "2px solid #374151",
                            aspectRatio: "1/1",
                            minWidth: "80px",
                            minHeight: "80px",
                            maxWidth: "80px",
                            maxHeight: "80px",
                          }}
                          onError={() => {
                            setHostProfile((prev: any) =>
                              prev
                                ? { ...prev, _imgError: true }
                                : { ...displayHost, _imgError: true }
                            );
                          }}
                        />
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                          style={{
                            aspectRatio: "1/1",
                            minWidth: "80px",
                            minHeight: "80px",
                            maxWidth: "80px",
                            maxHeight: "80px",
                          }}
                        >
                          <FiUser className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div
                        className={`text-2xl font-semibold mb-1 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {displayHost.first_name && displayHost.last_name
                          ? `${displayHost.first_name} ${displayHost.last_name}`
                          : displayHost.username || "Unknown Host"}
                      </div>
                      <div
                        className={`text-base mb-3 ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        @{displayHost.username || hostUsername}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                            theme === "light"
                              ? "bg-white/70 border-gray-200/70 text-gray-600"
                              : "bg-black/20 border-neutral-600/50 text-gray-300"
                          }`}
                        >
                          <FaStar className="text-yellow-500" size={14} />
                          <span className="text-sm font-medium">
                            {displayHost.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>

                        {/* {displayHost.country_Code && (
                          <div
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                              theme === "light"
                                ? "bg-gray-50/80 border-gray-200/60 text-gray-700"
                                : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                            }`}
                          >
                            📍 {displayHost.country_Code}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {displayHost.bio && (
                    <div
                      className={`p-4 rounded-xl border ${
                        theme === "light"
                          ? "bg-gray-50/60 border-gray-200/60"
                          : "bg-neutral-800/30 border-neutral-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className={`w-4 h-4 ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
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
                          className={`text-sm font-medium uppercase tracking-wide ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          About
                        </span>
                      </div>
                      <p
                        className={`text-base leading-relaxed ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        {displayHost.bio}
                      </p>
                    </div>
                  )}

                  {/* Links Section */}
                  {displayHost.links && displayHost.links.length > 0 && (
                    <div
                      className={`p-4 rounded-xl border ${
                        theme === "light"
                          ? "bg-gray-50/60 border-gray-200/60"
                          : "bg-neutral-800/30 border-neutral-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className={`w-4 h-4 ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        <span
                          className={`text-sm font-medium uppercase tracking-wide ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Links
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {displayHost.links
                          .slice(0, 3)
                          .map((link: string, idx: number) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-2 text-sm font-medium rounded-full border hover:shadow-md transition-all duration-200 ${
                                theme === "light"
                                  ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                  : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-gray-600/50"
                              }`}
                            >
                              {link
                                .replace(/^https?:\/\//, "")
                                .replace(/\/$/, "")
                                .substring(0, 25)}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews Section */}
                  <div
                    className={`p-4 rounded-xl border ${
                      theme === "light"
                        ? "bg-gray-50/60 border-gray-200/60"
                        : "bg-neutral-800/30 border-neutral-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <svg
                        className={`w-4 h-4 ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span
                        className={`text-sm font-medium uppercase tracking-wide ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Reviews ({displayHost.reviewsReceived?.length || 0})
                      </span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {displayHost.reviewsReceived &&
                      displayHost.reviewsReceived.length > 0 ? (
                        displayHost.reviewsReceived
                          .slice(0, 3)
                          .map((review: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border ${
                                theme === "light"
                                  ? "bg-white/80 border-gray-200/80"
                                  : "bg-neutral-900/50 border-neutral-700/50"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div
                                  className={`font-semibold text-sm ${
                                    theme === "light"
                                      ? "text-gray-900"
                                      : "text-white"
                                  }`}
                                >
                                  {review.title || "Great work!"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <FaStar className="text-yellow-400 text-xs" />
                                  <span className="text-xs font-medium text-yellow-400">
                                    {review.rating}
                                  </span>
                                </div>
                              </div>
                              <p
                                className={`text-sm mb-2 leading-relaxed ${
                                  theme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                }`}
                              >
                                {review.description ||
                                  "No description provided"}
                              </p>
                              <div
                                className={`text-xs ${
                                  theme === "light"
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                by @{review.author?.username || "Anonymous"} •{" "}
                                {review.createdAt
                                  ? new Date(
                                      review.createdAt
                                    ).toLocaleDateString()
                                  : "Recent"}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div
                          className={`text-center py-8 ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          <div className="text-2xl mb-2">⭐</div>
                          <div className="text-sm">No reviews yet</div>
                          <div className="text-xs mt-1">
                            This host is new or hasn't received reviews yet
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <>
          <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className={`rounded-2xl p-8 max-w-md w-full mx-4 border shadow-2xl drop-shadow-glow backdrop-blur-md transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-neutral-900/90 border-neutral-700"
                  : "bg-white/90 border-gray-200"
              }`}
            >
              <h3
                className={`text-2xl font-light mb-4 tracking-tight transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Send Request Message
              </h3>
              <p
                className={`mb-5 text-base transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Tell the host why you're interested in this gig and what you can
                offer.
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'm interested in this gig because..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-colors duration-300 text-base shadow-sm ${
                  theme === "dark"
                    ? "bg-neutral-800 border-neutral-700 text-white placeholder-gray-400"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                }`}
              />
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setRequestMessage("");
                  }}
                  className={`px-5 py-2 rounded-lg font-medium transition-colors duration-300 shadow-sm border ${
                    theme === "dark"
                      ? "bg-neutral-800 border-neutral-700 text-gray-200 hover:bg-neutral-700"
                      : "bg-white border-gray-200 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={!requestMessage.trim() || sendingRequest}
                  className={`px-5 py-2 rounded-lg font-medium transition-colors duration-300 shadow-sm border text-white ${
                    !requestMessage.trim() || sendingRequest
                      ? "bg-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-emerald-600 border-emerald-700 hover:bg-emerald-700"
                  }`}
                >
                  {sendingRequest ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
