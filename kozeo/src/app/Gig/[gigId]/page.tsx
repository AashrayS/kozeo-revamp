"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiStar, FiVideo, FiPhone } from "react-icons/fi";
import {
  FaMicrophone,
  FaVideo,
  FaDesktop,
  FaPhoneSlash,
  FaRegSmile,
  FaDollarSign,
} from "react-icons/fa";
import { useMemo, useState, useRef, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import TldrawWrapper from "@/components/common/TldrawWrapper";
import EmojiPicker from "emoji-picker-react";
import { getGigById } from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";

import { io } from "socket.io-client";
import { WEBSOCKET_URL } from "@/config";

interface Props {
  params: {
    gigId: string;
  };
}
type Socket = ReturnType<typeof io>;

export default function GigPage({
  params: paramsPromise,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = use(paramsPromise);
  const router = useRouter();

  // Redux state for current user
  const { user, username, isAuthenticated } = useUser();

  // Gig state management
  const [gig, setGig] = useState<any>(null);
  const [gigLoading, setGigLoading] = useState(true);
  const [gigError, setGigError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [width, setWidth] = useState(700);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileMessagesRef = useRef<HTMLDivElement>(null);
  const desktopMessagesRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [callControls, setCallControls] = useState(false);
  const [screenShareUI, setScreenShareUI] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showEndGigModal, setShowEndGigModal] = useState(false);
  const [showGigEndedModal, setShowGigEndedModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(
    new Set()
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const screenShareRef = useRef<HTMLVideoElement>(null);
  const [isScreenShareActive, setIsScreenShareActive] = useState(false);

  const screenShareSenderRef = useRef<RTCPeerConnection | null>(null);
  const screenReceiverRef = useRef<RTCPeerConnection | null>(null);
  let peerConnection: RTCPeerConnection;
  const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const emojiRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const fetchGig = async () => {
      if (!gigId) {
        setGigError("No gig ID provided");
        setGigLoading(false);
        return;
      }

      try {
        setGigLoading(true);
        setGigError(null);
        console.log("Fetching gig details for ID:", gigId);

        const gigData = await getGigById(gigId);

        if (gigData) {
          setGig(gigData);
          console.log("Gig details fetched:", gigData);
          console.log("Current user:", { username, user });
          console.log("User role:", getCurrentUserRole());
        } else {
          setGigError("Gig not found");
        }
      } catch (err: any) {
        console.error("Error fetching gig details:", err);
        setGigError(err.message || "Failed to load gig details");
      } finally {
        setGigLoading(false);
      }
    };

    fetchGig();
  }, [gigId, username, user]);

  // Helper functions for user roles and messaging
  const getCurrentUserRole = () => {
    if (!gig || !username) return null;

    if (gig.host?.username === username) {
      return "host";
    } else if (gig.guest?.username === username) {
      return "guest";
    }
    return null;
  };

  const getOtherPartyUsername = () => {
    if (!gig || !username) return "Unknown";

    const currentUserRole = getCurrentUserRole();

    if (currentUserRole === "host") {
      return gig.guest?.username || "No guest assigned";
    } else if (currentUserRole === "guest") {
      return gig.host?.username || "Unknown Host";
    }

    // Fallback: if we can't determine the role, show the guest if available, otherwise host
    if (gig.guest) {
      return gig.guest.username;
    }
    return gig.host?.username || "Unknown";
  };

  const getCurrentUsername = () => {
    return username || user?.username || "Unknown User";
  };

  // Message handling functions
  const truncateMessage = (message: string, wordLimit: number = 150) => {
    const words = message.split(" ");
    if (words.length <= wordLimit) return message;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const shouldShowReadMore = (message: string, wordLimit: number = 150) => {
    return message.split(" ").length > wordLimit;
  };

  const toggleMessageExpansion = (messageIndex: number) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageIndex)) {
      newExpanded.delete(messageIndex);
    } else {
      newExpanded.add(messageIndex);
    }
    setExpandedMessages(newExpanded);
  };

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (mobileMessagesRef.current) {
      mobileMessagesRef.current.scrollTop =
        mobileMessagesRef.current.scrollHeight;
    }
    if (desktopMessagesRef.current) {
      desktopMessagesRef.current.scrollTop =
        desktopMessagesRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated

    return () => clearTimeout(timer);
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    // Limit message to 1500 characters
    const trimmedInput = input.trim().slice(0, 1500);

    const messageData = {
      gigId,
      sender: getCurrentUsername(),
      message: trimmedInput,
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
    };

    // Send to other user via WebSocket
    socketRef.current.emit("chat-message", messageData);

    // Add to local messages
    setMessages((prev) => [...prev, messageData]);

    // Clear input
    setInput("");
  };

  useEffect(() => {
    // Only connect to WebSocket after gig is loaded
    if (!gig) return;

    const socket = io(WEBSOCKET_URL, {
      query: { gigID: gigId },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", gigId);
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      console.log("Received chat message:", msg);
    });

    socket.on("screen-offer", async (offer) => {
      const screenPeer = new RTCPeerConnection(config);

      screenPeer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📨 Sending screen ICE candidate", event.candidate);
          socket.emit("screen-ice-candidate", event.candidate);
        }
      };

      screenPeer.ontrack = (event) => {
        console.log("📺 screenPeer.ontrack triggered", event.streams);
        const stream = event.streams[0];

        setTimeout(() => {
          const videoEl = screenShareRef.current;
          if (videoEl) {
            console.log("✅ Assigning stream to screenShareRef");
            videoEl.srcObject = stream;
            videoEl.onloadedmetadata = () => {
              videoEl.play().catch((err) => {
                console.warn("🔇 Auto-play blocked", err);
              });
            };
          } else {
            console.log("❌ screenShareRef is still null after timeout");
          }
        }, 300);

        setIsScreenShareActive(true);
      };
      await screenPeer.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("✅ screenPeer.setRemoteDescription successful");
      const answer = await screenPeer.createAnswer();
      await screenPeer.setLocalDescription(answer);
      console.log("✅ screenPeer.setLocalDescription successful");
      socket.emit("screen-answer", answer);
      screenReceiverRef.current = screenPeer;
    });

    socket.on("screen-answer", async (answer) => {
      if (screenShareSenderRef.current) {
        await screenShareSenderRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("screen-ice-candidate", async (candidate) => {
      const iceCandidate = new RTCIceCandidate(candidate);
      if (screenShareSenderRef.current) {
        await screenShareSenderRef.current.addIceCandidate(iceCandidate);
      } else if (screenReceiverRef.current) {
        await screenReceiverRef.current.addIceCandidate(iceCandidate);
      }
    });

    socket.on("screen-share-stopped", () => {
      setIsScreenShareActive(false);
      if (screenShareRef.current) screenShareRef.current.srcObject = null;
    });

    socket.on("offer", async (offer) => {
      console.log("Received offer");
      setCallControls(true); // Enable call UI

      if (!peerConnectionRef.current) {
        peerConnectionRef.current = new RTCPeerConnection(config);
      }

      const peerConnection = peerConnectionRef.current;

      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false, // start with audio only
          audio: true,
        });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
      console.log("Received answer");
      const peerConnection = peerConnectionRef.current!;
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
    socket.on("incoming-call", (data) => {
      console.log("Incoming call from other user", data);
      setCallControls(true); // Enable call UI
    });
    socket.on("call-ended", () => {
      // console.log(`Call ended by user: ${userId}`);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setCallControls(false);
    });

    socket.on("gig-ended", () => {
      console.log("| Gig ended by the other party");
      setShowGigEndedModal(true);
    });

    socket.on("payment-request", (paymentData) => {
      console.log("Payment request received:", paymentData);
      setMessages((prev) => [
        ...prev,
        {
          sender: paymentData.from,
          time: new Date().toLocaleTimeString(),
          message:
            paymentData.description ||
            `Payment request for $${paymentData.amount}`,
          type: "payment-request",
          amount: paymentData.amount,
          paymentId: paymentData.paymentId,
          status: "pending",
        },
      ]);
    });

    socket.on("payment-response", (responseData) => {
      console.log("Payment response received:", responseData);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.paymentId === responseData.paymentId
            ? { ...msg, status: responseData.status }
            : msg
        )
      );
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate");
      const peerConnection = peerConnectionRef.current!;
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gigId, gig]); // Only connect after gig is loaded

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      console.log("🎥 Got local screen stream", screenStream);

      const screenTrack = screenStream.getVideoTracks()[0];
      const screenPeerConnection = new RTCPeerConnection(config);

      screenPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(
            "📨 Sending screen ICE candidate (sender)",
            event.candidate
          );
          socketRef.current?.emit("screen-ice-candidate", event.candidate);
        }
      };

      screenPeerConnection.addTrack(screenTrack, screenStream);
      console.log("➕ Added screen track to screenPeerConnection");

      const offer = await screenPeerConnection.createOffer();
      await screenPeerConnection.setLocalDescription(offer);
      console.log("📨 Emitting screen-offer");

      socketRef.current?.emit("screen-offer", offer);
      screenShareSenderRef.current = screenPeerConnection;

      if (screenShareRef.current) {
        console.log(
          "✅ Assigning local screen stream to screenShareRef (preview)"
        );
        screenShareRef.current.srcObject = screenStream;
      }

      setIsScreenShareActive(true);
      socketRef.current?.emit("screen-share-started");

      screenTrack.onended = () => {
        console.log("🛑 Screen sharing ended by user");
        stopScreenShare();
      };
    } catch (err) {
      console.error("❌ Screen sharing failed:", err);
      alert("Screen share permission denied.");
    }
  };

  const stopScreenShare = () => {
    setIsScreenShareActive(false);

    if (screenShareRef.current) {
      const stream = screenShareRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      screenShareRef.current.srcObject = null;
    }

    if (screenShareSenderRef.current) {
      screenShareSenderRef.current.close();
      screenShareSenderRef.current = null;
    }

    socketRef.current?.emit("screen-share-stopped");
  };

  async function askForPermissionsAgain() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Permissions granted");
      stream.getTracks().forEach((track) => track.stop()); // Stop stream after testing
    } catch (err) {
      console.error("Permission denied:", err);
      alert("Please enable mic/camera access in your browser settings.");
    }
  }
  const startCall = async () => {
    try {
      setCallControls(true); // Show call UI immediately

      // Notify server that a call is starting
      socketRef.current?.emit("call-start", gigId);

      // Create RTCPeerConnection
      peerConnectionRef.current = new RTCPeerConnection(config);
      const peerConnection = peerConnectionRef.current!;

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("ice-candidate", event.candidate);
        }
      };

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Create an empty stream and assign to local video element
      localStreamRef.current = new MediaStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      // Create and send offer with no tracks initially
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketRef.current?.emit("offer", offer);
    } catch (err) {
      console.error("Error starting call:", err);
      alert("Something went wrong while starting the call.");
    }
  };
  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream || stream.getVideoTracks().length === 0) {
      enableCamera(); // If no video track, enable it
      return;
    }

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    });
  };

  const endCall = () => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Clear local video preview
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });

      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Inform the server (optional)
    socketRef.current?.emit("end-call");

    // Reset UI state
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setCallControls(false);
  };

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream || stream.getAudioTracks().length === 0) {
      enableAudio(); // If no audio track, enable it
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    });
  };

  const enableCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // Use existing audio track if available
      });
      const videoTrack = videoStream.getVideoTracks()[0];

      if (peerConnectionRef.current && localStreamRef.current) {
        localStreamRef.current.addTrack(videoTrack);
        peerConnectionRef.current.addTrack(videoTrack, localStreamRef.current);

        // Update local video preview
        if (localVideoRef.current) {
          const updatedStream = new MediaStream([
            ...localStreamRef.current.getTracks(),
          ]);
          localVideoRef.current.srcObject = updatedStream;
          localStreamRef.current = updatedStream;
        }

        // Renegotiate
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socketRef.current?.emit("offer", offer);
      }

      setIsVideoEnabled(true);
    } catch (err) {
      console.error("Error enabling camera:", err);
      alert("Camera access denied or failed.");
    }
  };

  const enableAudio = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = audioStream.getAudioTracks()[0];

      if (peerConnectionRef.current && localStreamRef.current) {
        localStreamRef.current.addTrack(audioTrack);
        peerConnectionRef.current.addTrack(audioTrack, localStreamRef.current);

        // Update local video element
        if (localVideoRef.current) {
          const updatedStream = new MediaStream([
            ...localStreamRef.current.getTracks(),
          ]);
          localVideoRef.current.srcObject = updatedStream;
          localStreamRef.current = updatedStream;
        }

        // Renegotiate
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socketRef.current?.emit("offer", offer);
      }

      setIsAudioEnabled(true);
    } catch (err) {
      console.error("Error enabling audio:", err);
      alert("Microphone access denied or failed.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiRef.current &&
        !(emojiRef.current as HTMLElement).contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const initiateCall = (type: "audio" | "video") => {
    startCall();
    console.log(`Initiating ${type} call...`);
    setCallControls(true);
  };

  const startResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(250, startWidth + (e.clientX - startX)),
        800
      );
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const [topHeight, setTopHeight] = useState(300); // starting height in px
  const dividerRef = useRef<HTMLDivElement>(null);

  const startVerticalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = topHeight;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = Math.max(100, startHeight + (e.clientY - startY));
      setTopHeight(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const endGig = () => {
    try {
      console.log("Ending gig...", gigId);
      socketRef.current?.emit("gig-ended", { gigId });
      setShowEndGigModal(false);

      // Wait 1 second before redirecting to review page
      setTimeout(() => {
        router.push("/review");
      }, 1000);

      console.log("Gig ended successfully");
    } catch (error) {
      console.error("Error ending gig:", error);
      alert("Failed to end gig. Please try again.");
      return;
    }
  };

  const handlePaymentRequest = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const remainingAmount = gig.amount - (gig.paidAmount || 0);

    if (gig && parseFloat(paymentAmount) > remainingAmount) {
      alert(
        `Payment amount cannot exceed the remaining amount of ${
          gig.currency
        } ${remainingAmount.toFixed(2)}`
      );
      return;
    }

    const currentUser = getCurrentUsername();
    const otherUser = getOtherPartyUsername();

    const paymentData = {
      gigId,
      from: currentUser,
      to: otherUser,
      amount: parseFloat(paymentAmount),
      description: `Payment request for ${gig.currency} ${paymentAmount}`,
      paymentId: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    // Send to other user
    socketRef.current?.emit("payment-request", paymentData);

    // Add to local messages as sent
    setMessages((prev) => [
      ...prev,
      {
        sender: currentUser,
        time: new Date().toLocaleTimeString(),
        message: paymentData.description,
        type: "payment-sent",
        amount: paymentData.amount,
        paymentId: paymentData.paymentId,
        status: "pending",
      },
    ]);

    // Reset and close modal
    setPaymentAmount("");
    setPaymentDescription("");
    setShowPaymentModal(false);
  };

  const sendGigRequest = (request: { name: string; message: string }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("gig-request", {
      gigId: gigId,
      request,
    });
  };

  const handlePaymentResponse = (
    paymentId: string,
    status: "completed" | "declined"
  ) => {
    // Update local message status
    setMessages((prev) =>
      prev.map((msg) =>
        msg.paymentId === paymentId ? { ...msg, status } : msg
      )
    );

    // Send response to other user
    socketRef.current?.emit("payment-response", {
      paymentId,
      status,
      gigId,
    });

    // Show feedback to user
    if (status === "completed") {
      console.log("Payment completed successfully");
      // Could add a toast notification here
    } else {
      console.log("Payment declined");
    }
  };

  // Loading state
  if (gigLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />
          <main className="flex-1 p-10 flex justify-center items-center">
            <div className="text-center">
              <div className="text-xl text-gray-400 mb-4">
                Loading gig workspace...
              </div>
              <div className="text-sm text-gray-500">Gig ID: {gigId}</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (gigError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />
          <main className="flex-1 p-10 flex justify-center items-center">
            <div className="text-center">
              <div className="text-xl text-red-400 mb-4">Error loading gig</div>
              <div className="text-gray-400 mb-4">{gigError}</div>
              <button
                onClick={() => router.push("/Atrium")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                Go back to Atrium
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Gig not found
  if (!gig) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />
          <main className="flex-1 p-10 flex justify-center items-center">
            <div className="text-center">
              <div className="text-xl text-gray-400 mb-4">Gig not found</div>
              <button
                onClick={() => router.push("/Atrium")}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                Go back to Atrium
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="flex flex-col h-screen bg-transparent">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />

          <main
            className="flex-1 p-0 flex flex-col overflow-hidden overflow-x-hidden"
            ref={containerRef}
          >
            <div className="block md:hidden bg-transparent text-cyan-200 p-2 text-center text-xs font-medium rounded-md shadow-sm m-2">
              📱 Mobile View: Chat only. Video calling available on desktop.
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="md:hidden flex bg-neutral-800 border-b border-neutral-600">
              <button
                onClick={() => setShowMobileChat(true)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  showMobileChat
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setShowMobileChat(false)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  !showMobileChat
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🎨 Canvas
              </button>
            </div>

            {/* Gig Info Bar */}
            <div className="bg-transparent border-b border-neutral-800 px-4 md:px-6 py-2.5">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                {/* Left Section - Gig Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-medium text-white mb-1 truncate">
                    {gig.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500">Host:</span>
                      <span className="text-neutral-200 font-medium">
                        @{gig.host?.username || "Unknown"}
                      </span>
                    </div>
                    {gig.guest && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500">Guest:</span>
                        <span className="text-neutral-200 font-medium">
                          @{gig.guest.username}
                        </span>
                      </div>
                    )}
                  </div>
                  {gig.description && (
                    <p className="text-xs text-neutral-400 mt-1.5 max-w-2xl line-clamp-1">
                      {gig.description}
                    </p>
                  )}
                </div>

                {/* Right Section - Payment Info */}
                <div className="lg:min-w-[240px]">
                  <div className="bg-transparent rounded-md p-3 border border-neutral-700/50">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-0.5">
                          Total
                        </p>
                        <p className="text-base font-semibold text-white">
                          {gig.currency} {gig.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide mb-0.5">
                          Remaining
                        </p>
                        <p className="text-base font-semibold text-neutral-300">
                          {gig.currency}{" "}
                          {(gig.amount - (gig.paidAmount || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500">
                          Progress
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          {Math.round(
                            ((gig.paidAmount || 0) / gig.amount) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-1.5">
                        <div
                          className="bg-neutral-400 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              ((gig.paidAmount || 0) / gig.amount) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row containing all three columns */}
            <div
              className="flex flex-1 flex-col md:flex-row min-h-0"
              style={{ height: "calc(100vh - 200px)" }}
            >
              {/* Mobile Chat View */}
              {showMobileChat && (
                <div
                  className="md:hidden flex flex-col overflow-x-hidden border-neutral-700 w-full min-h-0"
                  style={{ height: "100%" }}
                >
                  <div className="p-3 border-b border-neutral-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-base">
                      @{getOtherPartyUsername()}
                    </span>
                    <div className="flex gap-2 justify-between sm:justify-end">
                      <button
                        onClick={() => setShowEndGigModal(true)}
                        className="group relative px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-red-600/90 border border-neutral-600 hover:border-red-500 text-neutral-200 hover:text-white text-xs font-medium transition-all duration-200 ease-in-out shadow-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          End Gig
                        </span>
                      </button>
                      <div className="text-xs text-gray-400">
                        Audio calls available on desktop
                      </div>
                    </div>
                  </div>

                  <div
                    ref={mobileMessagesRef}
                    className="overflow-y-auto overflow-x-auto p-2 space-y-2 text-sm min-h-0 chat-scrollbar"
                    style={{ height: "calc(100vh - 400px)" }}
                  >
                    {messages.map((msg, i) => (
                      <div key={i} className="min-w-0">
                        {msg.type === "payment-request" ||
                        msg.type === "payment-sent" ? (
                          // Payment Message
                          <div
                            className={`p-2 rounded-lg border max-w-[90%] min-w-[200px] ${
                              msg.status === "completed"
                                ? "bg-neutral-800/40 border-neutral-600"
                                : msg.status === "declined"
                                ? "bg-neutral-800/40 border-neutral-600"
                                : msg.type === "payment-sent" ||
                                  msg.sender === getCurrentUsername()
                                ? "bg-neutral-800/40 border-neutral-600 self-end ml-auto"
                                : "bg-neutral-800/40 border-neutral-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-2">
                              <FaDollarSign className="text-sm text-neutral-400" />
                              <span className="font-semibold text-white text-xs">
                                {msg.status === "completed"
                                  ? "✅ Payment Completed"
                                  : msg.status === "declined"
                                  ? "❌ Payment Declined"
                                  : msg.type === "payment-sent" ||
                                    msg.sender === getCurrentUsername()
                                  ? "Payment request sent"
                                  : "Payment Request"}
                              </span>
                            </div>
                            <div className="text-base font-bold mb-1 text-white">
                              ${msg.amount}
                            </div>
                            <div className="text-neutral-300 text-xs mb-2">
                              {msg.message}
                            </div>
                            {/* ...existing payment buttons... */}
                            {msg.type === "payment-request" &&
                              msg.status === "pending" &&
                              msg.sender !== getCurrentUsername() && (
                                <div className="flex flex-col gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handlePaymentResponse(
                                        msg.paymentId,
                                        "completed"
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-neutral-200 hover:bg-white text-neutral-900 text-xs font-semibold transition-colors"
                                  >
                                    Pay Now
                                  </button>
                                  <button
                                    onClick={() =>
                                      handlePaymentResponse(
                                        msg.paymentId,
                                        "declined"
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            <div className="text-xs text-neutral-500 mt-1">
                              {msg.time}
                            </div>
                          </div>
                        ) : (
                          // Regular Message
                          <div
                            className={`p-3 rounded-lg border max-w-[85%] min-w-[120px] break-words ${
                              msg.sender === getCurrentUsername()
                                ? "bg-neutral-700/30 border-neutral-600/30 self-end ml-auto"
                                : "bg-neutral-800/30 border-neutral-700/30"
                            }`}
                          >
                            {msg.sender !== getCurrentUsername() && (
                              <div className="text-xs text-neutral-400 mb-1 font-medium">
                                {msg.sender}
                              </div>
                            )}
                            <div className="text-sm text-neutral-100">
                              {expandedMessages.has(i) ||
                              !shouldShowReadMore(msg.message)
                                ? msg.message
                                : truncateMessage(msg.message)}
                            </div>
                            {shouldShowReadMore(msg.message) && (
                              <button
                                onClick={() => toggleMessageExpansion(i)}
                                className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium"
                              >
                                {expandedMessages.has(i)
                                  ? "Read less"
                                  : "Read more"}
                              </button>
                            )}
                            <div className="text-xs text-neutral-500 mt-1.5 text-right">
                              {msg.time}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-700 p-2 relative flex-shrink-0">
                    {showEmoji && (
                      <div
                        ref={emojiRef}
                        className="absolute bottom-12 left-2 z-10"
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData) =>
                            setInput((prev) => prev + emojiData.emoji)
                          }
                          height={250}
                          width={280}
                        />
                      </div>
                    )}

                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="text-lg text-gray-400 hover:text-white p-1"
                      >
                        <FaRegSmile />
                      </button>
                      <div className="relative group">
                        <button
                          onClick={
                            getCurrentUserRole() === "host"
                              ? undefined
                              : () => setShowPaymentModal(true)
                          }
                          disabled={getCurrentUserRole() === "host"}
                          className={`text-lg p-1 transition-colors ${
                            getCurrentUserRole() === "host"
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-green-400 cursor-pointer"
                          }`}
                          title={
                            getCurrentUserRole() === "host"
                              ? ""
                              : "Request Payment"
                          }
                        >
                          <FaDollarSign />
                        </button>
                        {getCurrentUserRole() === "host" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Hosts cannot request payment
                          </div>
                        )}
                      </div>
                      <input
                        value={input}
                        onChange={(e) =>
                          setInput(e.target.value.slice(0, 1500))
                        }
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-neutral-800 border border-neutral-600 p-2 rounded-md text-white text-sm placeholder-gray-400"
                        placeholder="Type a message..."
                      />
                      {input.length > 1400 && (
                        <div className="absolute -top-6 right-0 text-xs text-neutral-400">
                          {input.length}/1500
                        </div>
                      )}
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="px-2 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 rounded-md text-white font-semibold transition-colors text-sm"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Canvas View */}
              {!showMobileChat && (
                <div className="md:hidden flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <TldrawWrapper gigId={gigId} />
                  </div>
                </div>
              )}

              {/* Desktop Chat Column */}
              <div
                className="hidden md:flex flex-col overflow-x-auto border-neutral-700 min-h-0"
                style={{ width, height: "100%" }}
              >
                <div className="p-3 md:p-4 border-b border-neutral-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 min-w-0 flex-shrink-0">
                  <span className="font-bold text-base md:text-lg truncate">
                    @{getOtherPartyUsername()}
                  </span>

                  <div className="flex gap-2 md:gap-4 justify-between sm:justify-end flex-shrink-0">
                    <button
                      onClick={() => setShowEndGigModal(true)}
                      className="group relative px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-transparent hover:bg-red-600/90 border border-neutral-600 hover:border-red-500 text-neutral-200 hover:text-white text-xs md:text-sm font-medium transition-all duration-200 ease-in-out shadow-sm"
                    >
                      <span className="flex items-center gap-1.5 md:gap-2">
                        {/* <svg
                          className="w-3 h-3 md:w-4 md:h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg> */}
                        End Gig
                      </span>
                    </button>
                    <FiPhone
                      onClick={() => initiateCall("audio")}
                      className="text-lg md:text-xl cursor-pointer hidden md:block"
                    />
                    <div className="md:hidden text-xs text-gray-400">
                      Audio calls available on desktop
                    </div>
                  </div>
                </div>

                <div
                  ref={desktopMessagesRef}
                  className=" overflow-y-auto overflow-x-auto p-2 md:p-4 space-y-2 md:space-y-3 text-sm min-h-0 chat-scrollbar"
                  style={{ height: "calc(100vh - 220px)" }}
                >
                  {messages.map((msg, i) => (
                    <div key={i} className="min-w-0">
                      {msg.type === "payment-request" ||
                      msg.type === "payment-sent" ? (
                        // Payment Message
                        <div
                          className={`p-2 md:p-3 rounded-lg border max-w-[90%] sm:max-w-xs min-w-[200px] ${
                            msg.status === "completed"
                              ? "bg-neutral-800/40 border-neutral-600"
                              : msg.status === "declined"
                              ? "bg-neutral-800/40 border-neutral-600"
                              : msg.type === "payment-sent" ||
                                msg.sender === getCurrentUsername()
                              ? "bg-neutral-800/40 border-neutral-600 self-end ml-auto"
                              : "bg-neutral-800/40 border-neutral-600"
                          }`}
                        >
                          <div className="flex items-center gap-1 md:gap-2 mb-2">
                            <FaDollarSign className="text-sm text-neutral-400" />
                            <span className="font-semibold text-white text-xs md:text-sm">
                              {msg.status === "completed"
                                ? "✅ Payment Completed"
                                : msg.status === "declined"
                                ? "❌ Payment Declined"
                                : msg.type === "payment-sent" ||
                                  msg.sender === getCurrentUsername()
                                ? "Payment request Sent"
                                : "Payment Request"}
                            </span>
                          </div>
                          <div className="text-base md:text-lg font-bold mb-1 text-white">
                            ${msg.amount}
                          </div>
                          <div className="text-neutral-300 text-xs mb-2">
                            {msg.message}
                          </div>
                          {msg.status === "completed" && (
                            <div className="text-xs text-neutral-300 mb-2 font-medium">
                              ✅ Payment processed successfully
                            </div>
                          )}
                          {msg.status === "declined" && (
                            <div className="text-xs text-neutral-300 mb-2 font-medium">
                              ❌ Payment was declined
                            </div>
                          )}
                          {msg.type === "payment-request" &&
                            msg.status === "pending" &&
                            msg.sender !== getCurrentUsername() && (
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    handlePaymentResponse(
                                      msg.paymentId,
                                      "completed"
                                    )
                                  }
                                  className="px-2 md:px-3 py-1 rounded bg-neutral-200 hover:bg-white text-neutral-900 text-xs font-semibold transition-colors"
                                >
                                  Pay Now
                                </button>
                                <button
                                  onClick={() =>
                                    handlePaymentResponse(
                                      msg.paymentId,
                                      "declined"
                                    )
                                  }
                                  className="px-2 md:px-3 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold transition-colors"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          <div className="text-xs text-neutral-500 mt-1">
                            {msg.time}
                          </div>
                        </div>
                      ) : (
                        // Regular Message
                        <div
                          className={`p-3 rounded-lg border max-w-[85%] sm:max-w-xs min-w-[120px] break-words ${
                            msg.sender === getCurrentUsername()
                              ? "bg-neutral-700/30 border-neutral-600/30 self-end ml-auto"
                              : "bg-neutral-800/30 border-neutral-700/30"
                          }`}
                        >
                          {msg.sender !== getCurrentUsername() && (
                            <div className="text-xs text-neutral-400 mb-1 font-medium">
                              {msg.sender}
                            </div>
                          )}
                          <div className="text-sm text-neutral-100">
                            {expandedMessages.has(i) ||
                            !shouldShowReadMore(msg.message)
                              ? msg.message
                              : truncateMessage(msg.message)}
                          </div>
                          {shouldShowReadMore(msg.message) && (
                            <button
                              onClick={() => toggleMessageExpansion(i)}
                              className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium"
                            >
                              {expandedMessages.has(i)
                                ? "Read less"
                                : "Read more"}
                            </button>
                          )}
                          <div className="text-xs text-neutral-500 mt-1.5 text-right">
                            {msg.time}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-700 p-2 md:p-3 relative flex-shrink-0">
                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-12 md:bottom-16 left-2 md:left-3 z-10"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setInput((prev) => prev + emojiData.emoji)
                        }
                        height={300}
                        width={280}
                      />
                    </div>
                  )}

                  <div className="flex gap-1 md:gap-2 items-center">
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="text-lg md:text-xl text-gray-400 hover:text-white p-1"
                    >
                      <FaRegSmile />
                    </button>
                    <div className="relative group">
                      <button
                        onClick={
                          getCurrentUserRole() === "host"
                            ? undefined
                            : () => setShowPaymentModal(true)
                        }
                        disabled={getCurrentUserRole() === "host"}
                        className={`text-lg md:text-xl p-1 transition-colors ${
                          getCurrentUserRole() === "host"
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-green-400 cursor-pointer"
                        }`}
                        title={
                          getCurrentUserRole() === "host"
                            ? ""
                            : "Request Payment"
                        }
                      >
                        <FaDollarSign />
                      </button>
                      {getCurrentUserRole() === "host" && (
                        <div className="absolute bottom-full left-16 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Request payment diabled for hosts
                        </div>
                      )}
                    </div>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value.slice(0, 1500))}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-neutral-800 border border-neutral-600 p-2 rounded-md text-white text-sm md:text-base placeholder-gray-400"
                      placeholder="Type a message..."
                    />
                    {input.length > 1400 && (
                      <div className="absolute -top-6 right-0 text-xs text-neutral-400">
                        {input.length}/1500
                      </div>
                    )}
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      className="px-2 md:px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 rounded-md text-white font-semibold transition-colors text-sm"
                    >
                      <span className="hidden sm:inline">Send</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Resizer */}
              <div
                ref={resizerRef}
                onMouseDown={startResize}
                className="hidden md:block w-2 cursor-col-resize bg-neutral-800 hover:bg-neutral-600 transition-colors"
              />

              {/* Tldraw Board and screen Share Window */}
              <div className="flex-1 h-full overflow-hidden flex-col hidden md:flex">
                {/* Top - Screen Share Area */}
                {callControls && isScreenShareActive && (
                  <>
                    <div
                      style={{ height: topHeight }}
                      className="relative p-4 rounded-xl bg-transparent shadow-lg"
                    >
                      <span className="font-semibold text-gray-100 text-md mb-2 block absolute">
                        📺 Screen is being Shared
                      </span>

                      <video
                        ref={screenShareRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full rounded-lg object-cover"
                      />
                    </div>
                    <div
                      ref={dividerRef}
                      onMouseDown={startVerticalResize}
                      className="h-2 cursor-row-resize bg-neutral-700 hover:bg-neutral-600 transition-colors"
                    />
                  </>
                )}

                {/* Resizer Divider */}

                {/* Bottom - Tldraw Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <TldrawWrapper gigId={gigId} />{" "}
                </div>
              </div>

              {/* Call Column */}
              {callControls && (
                <>
                  <div className="w-80 border-l border-neutral-700 p-4 hidden md:flex flex-col gap-4">
                    <div className="h-1/2 rounded-2xl p-[2px] ">
                      <div className="flex flex-col h-full rounded-xl border border-neutral-700">
                        <p className="text-gray-400 text-sm mb-1 px-2 pt-2">
                          User 1 (You)
                        </p>
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full rounded-b-xl"
                        />
                      </div>
                    </div>

                    <div className="h-1/2 rounded-2xl p-[2px] bg-gradient-to-r  mt-4">
                      <div className="flex flex-col h-full rounded-xl  border border-neutral-700">
                        <p className="text-gray-400 text-sm mb-1 px-2 pt-2">
                          User 2
                        </p>
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full rounded-b-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-around py-4 border-t border-b border-neutral-700">
                      <FaDesktop
                        onClick={startScreenShare}
                        className="text-xl cursor-pointer hover:text-white text-gray-400"
                      />
                      <FaMicrophone
                        onClick={toggleAudio}
                        className={`text-xl cursor-pointer ${
                          isAudioEnabled ? "text-green-400" : "text-red-400"
                        }`}
                      />
                      <FaVideo
                        onClick={toggleVideo}
                        className={`text-xl cursor-pointer ${
                          isVideoEnabled ? "text-green-400" : "text-red-400"
                        }`}
                      />
                    </div>

                    <button
                      onClick={endCall}
                      className="mt-auto flex items-center justify-center gap-2 border border-neutral-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-pink-500 hover:via-fuchsia-600 hover:to-pink-500 "
                    >
                      <FaPhoneSlash className="text-md" />
                      <span>End Call</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Payment Request Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center">
                  <FaDollarSign className="text-neutral-300 text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Request Payment
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Send a payment request
                  </p>
                </div>
              </div>
            </div>

            {/* Gig Payment Summary */}
            {gig && (
              <div className="bg-neutral-900/40 border border-neutral-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">
                    Payment Summary
                  </h4>
                  <span className="text-xs text-neutral-500">{gig.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Total Value</p>
                    <p className="text-base font-semibold text-white">
                      {gig.currency} {gig.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Available</p>
                    <p className="text-base font-semibold text-neutral-200">
                      {gig.currency}{" "}
                      {(gig.amount - (gig.paidAmount || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-500">
                      Payment Progress
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {Math.round(((gig.paidAmount || 0) / gig.amount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-1.5">
                    <div
                      className="bg-neutral-400 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((gig.paidAmount || 0) / gig.amount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg">
                  {gig?.currency || "$"}
                </span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={gig ? gig.amount - (gig.paidAmount || 0) : undefined}
                  step="0.01"
                  className="w-full pl-16 pr-4 py-3 bg-neutral-900/50 border border-neutral-600 rounded-lg text-white text-lg font-medium placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                />
              </div>
              {gig && (
                <p className="text-xs text-neutral-500 mt-2">
                  Maximum available: {gig.currency}{" "}
                  {(gig.amount - (gig.paidAmount || 0)).toFixed(2)}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount("");
                  setPaymentDescription("");
                }}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentRequest}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-white text-neutral-900 font-medium rounded-lg disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Gig Confirmation Modal */}
      {showEndGigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              End Gig Confirmation
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this gig? After ending, both parties
              will be asked to review each other.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEndGigModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={endGig}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                End Gig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gig Ended by Other Party Modal */}
      {showGigEndedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Gig Ended</h3>
            <p className="text-gray-300 mb-6">
              The gig has been ended by the other party. You will be redirected
              to the review page now.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => router.push("/review")}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
