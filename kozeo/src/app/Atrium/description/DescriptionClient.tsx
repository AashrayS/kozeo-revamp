"use client";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { FiStar, FiUser } from "react-icons/fi";
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
        setError("No gig ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        console.log("Fetching gig with ID:", gigId);

        const gigData = await getGigById(gigId);

        if (gigData) {
          setGig(gigData);
          console.log("Gig data fetched:", gigData);

          // Check if current user has already sent a request to this gig
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
      const socket = io("ws://localhost:3001", {
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
          requesterGigCollaboratedCount: savedRequest?.sender?.gigCollaboratedCount || 0,
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
              Loading gig details...
            </div>
          </main>
        </div>
      </>
    );
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
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        </>
      )}

      <div
        className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
        }`}
      >
        <Sidebar />
        <main className="flex-1 px-10 py-6 grid grid-cols-1 md:grid-cols-2  md:gap-6 items-start ">
          {/* Gig Info */}
          <div
            className={`relative flex flex-col justify-between mb-10 min-h-2/3 rounded-lg p-6 shadow-md w-full transition-all duration-300 ${
              theme === "dark"
                ? "bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.1),_rgba(168,85,247,0.1))]"
                : "bg-white/90 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl"
            }`}
          >
            <div
              className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-sm border backdrop-blur-sm flex items-center gap-1 transition-colors duration-300 ${
                theme === "dark"
                  ? "text-gray-300 bg-neutral-800 bg-opacity-80 border-neutral-600"
                  : "text-gray-700 bg-white/80 border-gray-300"
              }`}
            >
              <FiStar
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
                fill={theme === "dark" ? "white" : "currentColor"}
              />
              <span className="font-medium">
                {gig.host?.rating?.toFixed(1) || "N/A"}
              </span>
            </div>

            {/* Top Content */}
            <div className="flex flex-col">
              <h2
                className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Gig Details
              </h2>

              <div className="text-sm text-cyan-400 font-medium mb-1">
                {gig.host?.username || "Unknown Host"}
              </div>

              <h3
                className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {gig.title}
              </h3>

              <p
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                className={`text-sm mb-3 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {gig.description}
              </p>

              <p className="text-sm mb-2">
                <span
                  className={`transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Looking For:{" "}
                </span>
                <span
                  className={`transition-colors duration-300 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {gig.looking_For}
                </span>
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {gig.skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 text-xs border rounded-md transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-neutral-800 border-neutral-600 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="text-sm mb-2">
                <span
                  className={`transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status:{" "}
                </span>
                <span
                  className={`font-medium ${
                    gig.status === "open"
                      ? "text-green-400"
                      : gig.status === "in_progress"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {gig.status?.charAt(0).toUpperCase() +
                    gig.status?.slice(1).replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Bottom Section */}
            <div
              className={`mt-auto pt-4 border-t flex flex-col gap-3 transition-colors duration-300 ${
                theme === "dark" ? "border-neutral-800" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-400">
                  {gig.currency} {gig.amount}
                </span>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {gig.activeRequest?.length || 0} active requests
                  </span>
                  {user && gig.host?.id === user.id && (
                    <span className="text-xs text-blue-400">
                      You are the host
                    </span>
                  )}
                  {user &&
                    gig.guest &&
                    gig.guest.username === user.username && (
                      <span className="text-xs text-green-400">
                        You are in this gig
                      </span>
                    )}
                  {user &&
                    gig.host?.id !== user.id &&
                    !gig.guest &&
                    requested && (
                      <span className="text-xs text-yellow-400">
                        Request sent
                      </span>
                    )}
                  {gig.guest &&
                    user &&
                    gig.guest.username !== user.username &&
                    gig.host?.id !== user.id && (
                      <span className="text-xs text-gray-400">
                        Gig taken by @{gig.guest.username}
                      </span>
                    )}
                </div>
              </div>

              {/* Show different button based on user status */}
              {user && gig.host?.id === user.id ? (
                // User is the host
                <button
                  onClick={() => router.push(`/gigs/${gigId}/lobby`)}
                  className="w-auto px-5 self-center py-2 rounded-md border-0 transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Go to Lobby
                </button>
              ) : gig.guest ? (
                // Gig has a guest - check if current user is the guest
                user && gig.guest.username === user.username ? (
                  <button
                    onClick={() => router.push(`/Gig/${gigId}`)}
                    className="w-auto px-5 self-center py-2 rounded-md border-0 transition-colors duration-200 bg-green-500 text-white hover:bg-green-600"
                  >
                    Enter Gig
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-auto px-5 self-center py-2 rounded-md border-0 transition-colors duration-200 bg-gray-500 text-white cursor-not-allowed"
                  >
                    Gig Closed
                  </button>
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
                  className="self-center"
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
                    ? "Request Rejected"
                    : requested
                    ? "Cancel Request"
                    : "Send Request"}
                </ProfessionalButton>
              )}
            </div>
          </div>

          {/* User Info */}
          <div
            className={`flex flex-col md:mb-0 min-h-2/3 rounded-lg p-6 shadow-md w-full transition-all duration-300 ${
              theme === "dark"
                ? "bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1),_rgba(34,211,238,0.1))]"
                : "bg-white/90 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <h2
                className={`text-2xl font-bold transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                About the Host
              </h2>

              <button
                className={`text-xs px-2 py-1 rounded-sm backdrop-blur-sm flex items-center gap-1 transition-colors duration-300 ${
                  theme === "dark"
                    ? "text-gray-300 bg-neutral-800 bg-opacity-80 hover:bg-neutral-700"
                    : "text-gray-700 bg-white/80 border border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  router.push(`/profile/${hostUsername}`);
                }}
              >
                <FiUser className="text-sm" />
                <span className="hidden md:inline">Visit</span>
              </button>
            </div>

            {/* Loading state for host profile */}
            {hostLoading && (
              <div className="text-center py-4">
                <div
                  className={`transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Loading host profile...
                </div>
              </div>
            )}

            {/* User Profile Section */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mb-3">
                {displayHost.profile_Picture ? (
                  <img
                    src={displayHost.profile_Picture}
                    alt={displayHost.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {displayHost.username?.charAt(0).toUpperCase() || "H"}
                  </span>
                )}
              </div>
              <div
                className={`font-semibold text-lg transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {displayHost.first_name} {displayHost.last_name} @
                {displayHost.username}
              </div>
              <div
                className={`flex items-center gap-1 text-sm mt-1 mb-2 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <FiStar className="text-yellow-400" />
                {displayHost.rating?.toFixed(1) || "N/A"}
              </div>
              <p
                className={`text-sm w-2/3 transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {displayHost.bio || "No bio available"}
              </p>

              {/* Additional host info */}
              {displayHost.country_Code && (
                <div
                  className={`text-xs mt-2 transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  📍 {displayHost.country_Code}
                </div>
              )}

              {displayHost.links && displayHost.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {displayHost.links
                    .slice(0, 2)
                    .map((link: string, idx: number) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {link
                          .replace(/^https?:\/\//, "")
                          .replace(/\/$/, "")
                          .substring(0, 20)}
                      </a>
                    ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <h4
              className={`font-bold mb-2 transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Reviews ({displayHost.reviewsReceived?.length || 0}):
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {displayHost.reviewsReceived &&
              displayHost.reviewsReceived.length > 0 ? (
                displayHost.reviewsReceived
                  .slice(0, 3)
                  .map((review: any, idx: number) => (
                    <div
                      key={idx}
                      className={`rounded-md p-3 transition-colors duration-300 ${
                        theme === "dark"
                          ? "border border-neutral-700 bg-neutral-800/50"
                          : "border border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`font-semibold transition-colors duration-300 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {review.title || "Great work!"}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiStar
                            className="text-yellow-400 text-sm"
                            fill="currentColor"
                          />
                          <span className="text-yellow-400 text-sm">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm mb-2 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {review.description || "No description provided"}
                      </p>
                      <div
                        className={`text-xs transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        by @{review.author?.username || "Anonymous"} •{" "}
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : "Recent"}
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  {/* Fallback to gig status info if no reviews */}
                  {gig.status === "open" && (
                    <div
                      className={`rounded-md p-3 transition-colors duration-300 ${
                        theme === "dark"
                          ? "border border-neutral-700 bg-neutral-800/50"
                          : "border border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold mb-1 text-green-400">
                        Gig Available
                      </div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        This gig is currently open and accepting requests.
                      </p>
                      <div
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Created: {new Date(gig.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {gig.status === "in_progress" && gig.guest && (
                    <div
                      className={`rounded-md p-3 transition-colors duration-300 ${
                        theme === "dark"
                          ? "border border-neutral-700 bg-neutral-800/50"
                          : "border border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold mb-1 text-yellow-400">
                        In Progress
                      </div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Currently collaborating with @{gig.guest.username}
                      </p>
                      <div
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Started: {new Date(gig.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {gig.activeRequest && gig.activeRequest.length > 0 && (
                    <div
                      className={`rounded-md p-3 transition-colors duration-300 ${
                        theme === "dark"
                          ? "border border-neutral-700 bg-neutral-800/50"
                          : "border border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold mb-1 text-blue-400">
                        Pending Requests
                      </div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {gig.activeRequest.length} request(s) pending review
                      </p>
                      <div
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Latest:{" "}
                        {new Date(
                          gig.activeRequest[0]?.sentTime || gig.updatedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {(!gig.activeRequest || gig.activeRequest.length === 0) &&
                    gig.status === "open" && (
                      <div
                        className={`rounded-md p-3 transition-colors duration-300 ${
                          theme === "dark"
                            ? "border border-neutral-700 bg-neutral-800/50"
                            : "border border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div
                          className={`font-semibold mb-1 transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          No Reviews Yet
                        </div>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          This host doesn't have any reviews yet.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg p-6 max-w-md w-full mx-4 transition-colors duration-300 ${
              theme === "dark" ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Send Request Message
            </h3>
            <p
              className={`mb-4 text-sm transition-colors duration-300 ${
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
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-colors duration-300 ${
                theme === "dark"
                  ? "bg-neutral-700 border-neutral-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setRequestMessage("");
                }}
                className={`px-4 py-2 rounded transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!requestMessage.trim() || sendingRequest}
                className={`px-4 py-2 rounded transition-colors duration-300 text-white ${
                  !requestMessage.trim() || sendingRequest
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {sendingRequest ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
