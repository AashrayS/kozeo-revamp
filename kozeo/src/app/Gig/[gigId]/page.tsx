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
import {
  getGigById,
  getGigChats,
  sendGigMessage,
} from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";
import { useTheme } from "../../../contexts/ThemeContext";

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
  const { theme } = useTheme();

  // Redux state for current user
  const { user, username, email, isAuthenticated } = useUser();

  // Gig state management
  const [gig, setGig] = useState<any>(null);
  const [gigLoading, setGigLoading] = useState(true);
  const [gigError, setGigError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(true);
  const [isGigInfoMinimized, setIsGigInfoMinimized] = useState(false);
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
  // Typing status states
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

          // Fetch chat messages after gig is loaded
          await fetchChatMessages();

          // Start periodic chat sync
          // startChatSync();
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

    const fetchChatMessages = async () => {
      try {
        console.log("Fetching chat messages for gig:", gigId);
        const chatMessages = await getGigChats(gigId);

        // Transform API messages to match our current message format
        const transformedMessages = chatMessages.map((msg: any) => {
          // Determine display name for sender based on email
          let senderDisplayName = "Unknown";

          // Get current user email for comparison
          const currentUserEmail = getCurrentUserEmail();

          // If sender email matches current user email, use current username
          if (msg.sender === currentUserEmail) {
            senderDisplayName = getCurrentUserEmail();
          } else {
            // If sender email matches gig host email, use host username
            if (gig?.host?.email === msg.sender) {
              senderDisplayName = gig.host.email;
            }
            // If sender email matches gig guest email, use guest username
            else if (gig?.guest?.email === msg.sender) {
              senderDisplayName = gig.guest.email;
            }
            // Fallback: extract username from email
            else {
              senderDisplayName = msg.sender.split("@")[0];
            }
          }

          // Determine message type based on messageType and attachments
          let messageType = "text";
          if (
            msg.messageType === "payment" &&
            msg.attachments &&
            msg.attachments.length > 0
          ) {
            const description = msg.attachments[0].description;
            if (description === "request-made") {
              messageType = "payment-request";
            } else if (description === "accepted") {
              messageType = "payment-accepted";
            } else if (description === "rejected") {
              messageType = "payment-rejected";
            } else {
              messageType = "payment-request"; // fallback
            }
          }

          return {
            sender: senderDisplayName,
            senderEmail: msg.sender, // Keep original email for reference
            message: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString(),
            timestamp: msg.timestamp,
            id: msg.id,
            type: messageType,
            messageType: msg.messageType,
            isRead: msg.isRead,
            attachments: msg.attachments || [],
          };
        });

        setMessages(transformedMessages);
        console.log("Chat messages loaded:", transformedMessages);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        // Don't show error for chat loading failure, just log it
      }
    };

    const syncChatMessages = async () => {
      try {
        const chatMessages = await getGigChats(gigId);
        const transformedMessages = chatMessages.map((msg: any) => {
          // Determine display name for sender based on email
          let senderDisplayName = "Unknown";

          // Get current user email for comparison
          const currentUserEmail = getCurrentUserEmail();

          // If sender email matches current user email, use current username
          if (msg.sender === currentUserEmail) {
            senderDisplayName = getCurrentUserEmail();
          } else {
            // If sender email matches gig host email, use host username
            if (gig?.host?.email === msg.sender) {
              senderDisplayName = gig.host.email;
            }
            // If sender email matches gig guest email, use guest username
            else if (gig?.guest?.email === msg.sender) {
              senderDisplayName = gig.guest.email;
            }
            // Fallback: extract username from email
            else {
              senderDisplayName = msg.sender.split("@")[0];
            }
          }

          // Determine message type based on messageType and attachments
          let messageType = "text";
          if (
            msg.messageType === "payment" &&
            msg.attachments &&
            msg.attachments.length > 0
          ) {
            const description = msg.attachments[0].description;
            if (description === "request-made") {
              messageType = "payment-request";
            } else if (description === "accepted") {
              messageType = "payment-accepted";
            } else if (description === "rejected") {
              messageType = "payment-rejected";
            } else {
              messageType = "payment-request"; // fallback
            }
          }

          return {
            sender: senderDisplayName,
            senderEmail: msg.sender, // Keep original email for reference
            message: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString(),
            timestamp: msg.timestamp,
            id: msg.id,
            type: messageType,
            messageType: msg.messageType,
            isRead: msg.isRead,
            attachments: msg.attachments || [],
          };
        });

        // Only update if messages are different (avoid unnecessary re-renders)
        setMessages((prev) => {
          if (prev.length !== transformedMessages.length) {
            return transformedMessages;
          }

          // Check if last message is different
          const lastPrev = prev[prev.length - 1];
          const lastNew = transformedMessages[transformedMessages.length - 1];

          if (!lastPrev || !lastNew || lastPrev.id !== lastNew.id) {
            return transformedMessages;
          }

          return prev;
        });
      } catch (error) {
        console.error("Error syncing chat messages:", error);
      }
    };

    // Set up periodic chat sync (every 10 seconds)
    const startChatSync = () => {
      if (chatSyncIntervalRef.current) {
        clearInterval(chatSyncIntervalRef.current);
      }

      chatSyncIntervalRef.current = setInterval(syncChatMessages, 10000);
    };

    fetchGig();
  }, [gigId, username, user, email]);

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

  const getCurrentUserEmail = () => {
    console.log("Getting current user email:", email, user);
    return email || user?.email || "unknown@example.com";
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Limit message to 1500 characters
    const trimmedInput = input.trim().slice(0, 1500);

    try {
      // Prepare message data for API with current user's email as sender
      const messageData = {
        gig: gigId,
        content: trimmedInput,
        messageType: "text",
      };

      // Send message via API
      const sentMessage = (await sendGigMessage(messageData)) as any;

      // Transform API response to match our current message format
      const newMessage = {
        sender: getCurrentUserEmail(), // Display current user's username
        senderEmail: getCurrentUserEmail(), // Keep email for reference
        message: sentMessage?.content || trimmedInput,
        time: sentMessage?.timestamp
          ? new Date(sentMessage.timestamp).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        timestamp: sentMessage?.timestamp || new Date().toISOString(),
        id: sentMessage?.id || Date.now().toString(),
        type: "text",
        messageType: sentMessage?.messageType || "text",
      };

      // Add to local messages
      setMessages((prev) => [...prev, newMessage]);

      // Also emit via socket for real-time updates to other user
      if (socketRef.current) {
        socketRef.current.emit("chat-message", {
          gigId,
          sender: getCurrentUsername(), // For socket, still use username for compatibility
          senderEmail: getCurrentUserEmail(), // Include email for future compatibility
          message: trimmedInput,
          time: newMessage.time,
          timestamp: newMessage.timestamp,
          id: newMessage.id,
        });
      }

      console.log("Message sent successfully:", sentMessage);
    } catch (error) {
      console.error("Error sending message:", error);

      // Fallback to socket-only if API fails
      if (socketRef.current) {
        const fallbackMessage = {
          gigId,
          sender: getCurrentUsername(),
          senderEmail: getCurrentUserEmail(),
          message: trimmedInput,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          id: Date.now().toString(), // Temporary ID
        };

        socketRef.current.emit("chat-message", fallbackMessage);
        setMessages((prev) => [
          ...prev,
          {
            sender: fallbackMessage.sender,
            senderEmail: fallbackMessage.senderEmail,
            message: fallbackMessage.message,
            time: fallbackMessage.time,
            timestamp: fallbackMessage.timestamp,
            id: fallbackMessage.id,
            type: "text",
          },
        ]);
      }

      // Show user feedback for error
      console.error("Failed to send message via API, fell back to socket only");
    }

    // Clear input and stop typing
    setInput("");
    stopTyping();
  };

  // Typing functionality
  const startTyping = () => {
    if (!socketRef.current || isTyping) return;

    setIsTyping(true);
    socketRef.current.emit("typing-start", {
      gigId,
      username: getCurrentUsername(),
    });
  };

  const stopTyping = () => {
    if (!socketRef.current || !isTyping) return;

    setIsTyping(false);
    socketRef.current.emit("typing-stop", {
      gigId,
      username: getCurrentUsername(),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 1500);
    setInput(value);

    // Handle typing status
    if (value.trim() && !isTyping) {
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        stopTyping();
      }
    }, 2000);
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
      // Transform socket message to match our current message format
      let senderDisplayName = msg.sender;

      // If the message has senderEmail, use email-based logic for display name
      if (msg.senderEmail) {
        const currentUserEmail = getCurrentUserEmail();

        // If sender email matches current user email, use current username
        if (msg.senderEmail === currentUserEmail) {
          senderDisplayName = getCurrentUsername();
        } else {
          // If sender email matches gig host email, use host username
          if (gig?.host?.email === msg.senderEmail) {
            senderDisplayName = gig.host.username;
          }
          // If sender email matches gig guest email, use guest username
          else if (gig?.guest?.email === msg.senderEmail) {
            senderDisplayName = gig.guest.username;
          }
          // Fallback: extract username from email or use provided sender
          else {
            senderDisplayName = msg.senderEmail.split("@")[0] || msg.sender;
          }
        }
      }

      const transformedMessage = {
        sender: senderDisplayName,
        senderEmail: msg.senderEmail || null, // Keep email if available
        message: msg.message,
        time: msg.time,
        timestamp: msg.timestamp,
        id: msg.id || Date.now().toString(),
        type: "text",
      };

      setMessages((prev) => [...prev, transformedMessage]);
      console.log("Received chat message:", transformedMessage);
    });

    // Typing status events
    socket.on("typing-start", (data) => {
      if (data.username !== getCurrentUsername()) {
        setOtherUserTyping(true);
      }
    });

    socket.on("typing-stop", (data) => {
      if (data.username !== getCurrentUsername()) {
        setOtherUserTyping(false);
      }
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

      // Determine display name for payment sender
      let senderDisplayName = paymentData.from;

      // If paymentData has fromEmail, use email-based logic
      if (paymentData.fromEmail) {
        const currentUserEmail = getCurrentUserEmail();

        if (paymentData.fromEmail === currentUserEmail) {
          senderDisplayName = getCurrentUsername();
        } else if (gig?.host?.email === paymentData.fromEmail) {
          senderDisplayName = gig.host.username;
        } else if (gig?.guest?.email === paymentData.fromEmail) {
          senderDisplayName = gig.guest.username;
        } else {
          senderDisplayName =
            paymentData.fromEmail.split("@")[0] || paymentData.from;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: senderDisplayName,
          senderEmail: paymentData.fromEmail || null,
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
      // Clean up typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Clean up chat sync interval
      if (chatSyncIntervalRef.current) {
        clearInterval(chatSyncIntervalRef.current);
      }

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

  // Cleanup typing on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (chatSyncIntervalRef.current) {
        clearInterval(chatSyncIntervalRef.current);
      }

      if (isTyping && socketRef.current) {
        socketRef.current.emit("typing-stop", {
          gigId,
          username: getCurrentUsername(),
        });
      }
    };
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

      // Determine the other user to review
      let receiverUsername = "";
      if (gig && user) {
        // If current user is the host, review the guest; if guest, review the host
        if (gig.host && gig.host.id === user.id && gig.guest) {
          receiverUsername = gig.guest.username;
        } else if (gig.host && gig.host.username) {
          receiverUsername = gig.host.username;
        }
      }

      // Wait 1 second before redirecting to review page with proper parameters
      setTimeout(() => {
        if (receiverUsername) {
          router.push(`/review?gigId=${gigId}&receiver=${receiverUsername}`);
        } else {
          // Fallback - redirect to gigs page if we can't determine the other user
          console.error("Could not determine receiver for review");
          router.push("/gigs");
        }
      }, 1000);

      console.log("Gig ended successfully");
    } catch (error) {
      console.error("Error ending gig:", error);
      alert("Failed to end gig. Please try again.");
      return;
    }
  };

  const handlePaymentRequest = async () => {
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
    const currentUserEmail = getCurrentUserEmail();
    const otherUser = getOtherPartyUsername();

    // Get other user's email based on current user role
    const getCurrentUserRole = () => {
      if (gig?.host?.email === currentUserEmail) return "host";
      if (gig?.guest?.email === currentUserEmail) return "guest";
      return null;
    };

    const getOtherUserEmail = () => {
      const role = getCurrentUserRole();
      if (role === "host") return gig?.guest?.email || "unknown@example.com";
      if (role === "guest") return gig?.host?.email || "unknown@example.com";
      return "unknown@example.com";
    };

    const paymentDescription = `Payment request for ${gig.currency} ${paymentAmount}`;
    const paymentId = Date.now().toString();

    try {
      // Prepare payment message data for API
      const messageData = {
        gig: gigId,
        content: paymentAmount, // Amount as content
        messageType: "payment",
        attachments: [{ description: "request-made" }], // Description in attachments
      };

      // Send payment message via API
      const sentMessage = (await sendGigMessage(messageData)) as any;
      console.log("Payment message sent via API:", sentMessage);

      // Prepare payment data for socket
      const paymentData = {
        gigId,
        from: currentUser,
        fromEmail: currentUserEmail,
        to: otherUser,
        toEmail: getOtherUserEmail(),
        amount: parseFloat(paymentAmount),
        description: paymentDescription,
        paymentId: sentMessage?.id || paymentId,
        timestamp: sentMessage?.timestamp || new Date().toISOString(),
      };

      // Send to other user via socket for real-time notification
      socketRef.current?.emit("payment-request", paymentData);

      // Add to local messages as sent
      setMessages((prev) => [
        ...prev,
        {
          sender: currentUserEmail,
          senderEmail: currentUserEmail,
          time: sentMessage?.timestamp
            ? new Date(sentMessage.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
          message: paymentAmount, // Use amount as message content to match API format
          type: "payment-request", // Use consistent type
          amount: paymentData.amount,
          paymentId: paymentData.paymentId,
          id: sentMessage?.id || paymentId,
          timestamp: sentMessage?.timestamp || new Date().toISOString(),
          messageType: "payment",
          attachments: [{ description: "request-made" }], // Include attachments for consistency
        },
      ]);

      console.log("Payment request sent successfully");
    } catch (error) {
      console.error("Error sending payment request via API:", error);

      // Fallback to socket-only if API fails
      const fallbackPaymentData = {
        gigId,
        from: currentUser,
        fromEmail: currentUserEmail,
        to: otherUser,
        toEmail: getOtherUserEmail(),
        amount: parseFloat(paymentAmount),
        description: paymentDescription,
        paymentId: paymentId,
        timestamp: new Date().toISOString(),
      };

      // Send to other user via socket
      socketRef.current?.emit("payment-request", fallbackPaymentData);

      // Add to local messages as sent
      setMessages((prev) => [
        ...prev,
        {
          sender: currentUser,
          senderEmail: currentUserEmail,
          time: new Date().toLocaleTimeString(),
          message: paymentAmount, // Use amount as message content to match API format
          type: "payment-request", // Use consistent type
          amount: fallbackPaymentData.amount,
          paymentId: fallbackPaymentData.paymentId,
          id: paymentId,
          timestamp: new Date().toISOString(),
          messageType: "payment",
          attachments: [{ description: "request-made" }], // Include attachments for consistency
        },
      ]);

      console.error(
        "Failed to send payment request via API, fell back to socket only"
      );
    }

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
        <div
          className={`relative z-10 flex flex-1 flex-row theme-transition ${
            theme === "light"
              ? "bg-gradient-light text-gray-900"
              : "bg-gradient-dark text-white"
          }`}
        >
          <Sidebar />

          <main
            className="flex-1 p-0 flex flex-col overflow-hidden overflow-x-hidden"
            ref={containerRef}
          >
            <div
              className={`block md:hidden border p-3 text-center text-xs font-medium m-3 rounded-lg ${
                theme === "light"
                  ? "bg-gray-100/40 border-gray-300/30 text-gray-700"
                  : "bg-neutral-800/40 border-neutral-700/30 text-neutral-300"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className={`w-4 h-4 ${
                    theme === "light" ? "text-blue-500/70" : "text-blue-400/70"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Mobile workspace - Video calls available on desktop</span>
              </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <div
              className={`md:hidden flex border-b backdrop-blur-sm ${
                theme === "light"
                  ? "bg-white/80 border-gray-200/50"
                  : "bg-neutral-900/80 border-neutral-700/50"
              }`}
            >
              <button
                onClick={() => setShowMobileChat(true)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${
                  showMobileChat
                    ? theme === "light"
                      ? "text-gray-900 bg-gray-100/60"
                      : "text-white bg-neutral-800/60"
                    : theme === "light"
                    ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100/30"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Chat</span>
                </div>
                {showMobileChat && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400/80"></div>
                )}
              </button>
              <button
                onClick={() => setShowMobileChat(false)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${
                  !showMobileChat
                    ? "text-white bg-neutral-800/60"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Canvas</span>
                </div>
                {!showMobileChat && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400/80"></div>
                )}
              </button>
            </div>

            {/* Gig Info Bar */}
            <div className="bg-transparent border-b border-neutral-800 px-4 md:px-6 py-2.5 md:py-2.5 transition-all duration-300 ease-in-out overflow-hidden">
              {/* Mobile Toggle Button */}
              <div className="md:hidden flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-neutral-300">
                  Gig Details
                </h2>
                <button
                  onClick={() => setIsGigInfoMinimized(!isGigInfoMinimized)}
                  className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-600/50 text-neutral-400 hover:text-white transition-all duration-200"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isGigInfoMinimized ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isGigInfoMinimized
                    ? "md:block hidden opacity-0 max-h-0"
                    : "opacity-100 max-h-[200px]"
                }`}
              >
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
                    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-md p-3  border-blue-500/20">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-blue-300/80 uppercase tracking-wide mb-0.5">
                            Total
                          </p>
                          <p className="text-base font-semibold text-white">
                            {gig.currency} {gig.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-green-300/80 uppercase tracking-wide mb-0.5">
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
                          <span className="text-xs text-neutral-400">
                            Progress
                          </span>
                          <span className="text-xs text-blue-300/90 font-medium">
                            {Math.round(
                              ((gig.paidAmount || 0) / gig.amount) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-neutral-700/60 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full transition-all duration-300"
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
            </div>

            {/* Row containing all three columns */}
            <div
              className="flex flex-1 flex-col md:flex-row min-h-0 transition-all duration-300 ease-in-out"
              style={{
                height: isGigInfoMinimized
                  ? "calc(100vh - 140px)"
                  : "calc(100vh - 100px)",
              }}
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
                      {/* Only show End Gig button if gig is not completed */}
                      {gig?.status !== "completed" && (
                        <button
                          onClick={() => setShowEndGigModal(true)}
                          className="group relative px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-red-500/20 border border-neutral-600 hover:border-red-400/50 text-neutral-200 hover:text-red-300 text-xs font-medium transition-all duration-200 ease-in-out shadow-sm"
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
                      )}
                      <div className="text-xs text-gray-400">
                        Audio calls available on desktop
                      </div>
                    </div>
                  </div>

                  <div
                    ref={mobileMessagesRef}
                    className="overflow-y-auto overflow-x-auto p-2 space-y-2 text-sm min-h-0 chat-scrollbar transition-all duration-300 ease-in-out"
                    style={{
                      height: isGigInfoMinimized
                        ? "calc(100vh - 280px)"
                        : "calc(100vh - 400px)",
                    }}
                  >
                    {messages.map((msg, i) => (
                      <div key={i} className="min-w-0">
                        {msg.type === "payment-request" ||
                        msg.type === "payment-accepted" ||
                        msg.type === "payment-rejected" ? (
                          // Payment Message
                          <div
                            className={`p-2 rounded-lg border max-w-[90%] min-w-[200px] ${
                              msg.type === "payment-accepted"
                                ? "bg-green-500/10 border-green-500/30"
                                : msg.type === "payment-rejected"
                                ? "bg-red-500/10 border-red-500/30"
                                : msg.sender === getCurrentUserEmail()
                                ? "bg-neutral-800/40 border-neutral-600 self-end ml-auto"
                                : "bg-neutral-800/40 border-neutral-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-2">
                              <FaDollarSign className="text-sm text-neutral-400" />
                              <span className="font-semibold text-white text-xs">
                                {msg.type === "payment-accepted"
                                  ? "✅ Payment Accepted"
                                  : msg.type === "payment-rejected"
                                  ? "❌ Payment Rejected"
                                  : msg.sender === getCurrentUserEmail()
                                  ? "Payment request sent"
                                  : "Payment Request"}
                              </span>
                            </div>
                            <div className="text-base font-bold mb-1 text-white">
                              ${msg.amount || msg.message}
                            </div>
                            <div className="text-neutral-300 text-xs mb-2">
                              {msg.type === "payment-accepted"
                                ? "Payment has been accepted and processed"
                                : msg.type === "payment-rejected"
                                ? "Payment request was declined"
                                : `Payment request for $${
                                    msg.amount || msg.message
                                  }`}
                            </div>
                            {/* Show action buttons only for pending payment requests to other party */}
                            {msg.type === "payment-request" && (
                              <>
                                {msg.sender === getCurrentUserEmail() ? (
                                  // Show waiting message for sender
                                  <div className="mt-2 px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                      <span className="text-xs text-neutral-300 font-medium">
                                        Waiting for response...
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  // Show action buttons for receiver
                                  <div className="flex flex-col gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        handlePaymentResponse(
                                          msg.paymentId || msg.id,
                                          "completed"
                                        )
                                      }
                                      className="px-2 py-1 rounded bg-green-600/80 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                                    >
                                      Accept & Pay
                                    </button>
                                    <button
                                      onClick={() =>
                                        handlePaymentResponse(
                                          msg.paymentId || msg.id,
                                          "declined"
                                        )
                                      }
                                      className="px-2 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold transition-colors"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="text-xs text-neutral-500 mt-1">
                              {msg.time}
                            </div>
                          </div>
                        ) : (
                          // Regular Message
                          <div
                            className={`p-3 rounded-lg border max-w-[85%] min-w-[120px] break-words ${
                              msg.sender === getCurrentUserEmail()
                                ? "bg-neutral-700/30 border-neutral-600/30 self-end ml-auto"
                                : "bg-neutral-800/30 border-neutral-700/30"
                            }`}
                          >
                            {msg.sender !== getCurrentUserEmail() && (
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
                                className="text-xs text-blue-400/90 hover:text-blue-300 mt-1 font-medium transition-colors"
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

                  <div className=" border-t border-neutral-700 p-2 relative flex-shrink-0">
                    {/* Typing Indicator - Absolutely positioned */}
                    {otherUserTyping && (
                      <div className="absolute -top-8 left-0 right-0 px-2 py-1  border-neutral-700/50 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-100"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                          </div>
                          <span>{getOtherPartyUsername()} is typing...</span>
                        </div>
                      </div>
                    )}
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
                        className="text-lg text-gray-400 hover:text-orange-300 p-1 transition-colors"
                      >
                        <FaRegSmile />
                      </button>
                      <div className="relative group">
                        <button
                          onClick={
                            getCurrentUserRole() === "host" ||
                            gig?.status === "completed"
                              ? undefined
                              : () => setShowPaymentModal(true)
                          }
                          disabled={
                            getCurrentUserRole() === "host" ||
                            gig?.status === "completed"
                          }
                          className={`text-lg p-1 transition-colors ${
                            getCurrentUserRole() === "host" ||
                            gig?.status === "completed"
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-green-400 cursor-pointer"
                          }`}
                          title={
                            getCurrentUserRole() === "host"
                              ? ""
                              : gig?.status === "completed"
                              ? "Gig completed - payment requests disabled"
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
                        {gig?.status === "completed" &&
                          getCurrentUserRole() !== "host" && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Gig completed - payment requests disabled
                            </div>
                          )}
                      </div>
                      <input
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={gig?.status === "completed"}
                        className={`flex-1 border p-2 rounded-md text-sm transition-all ${
                          gig?.status === "completed"
                            ? "bg-neutral-800/40 border-neutral-700 text-gray-500 placeholder-gray-600 cursor-not-allowed"
                            : "bg-neutral-800/80 border-neutral-600 focus:border-blue-400/50 text-white placeholder-gray-400"
                        }`}
                        placeholder={
                          gig?.status === "completed"
                            ? "Gig completed - messaging disabled"
                            : "Type a message..."
                        }
                      />
                      {input.length > 1400 && (
                        <div className="absolute -top-6 right-0 text-xs text-neutral-400">
                          {input.length}/1500
                        </div>
                      )}
                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || gig?.status === "completed"}
                        className={`group relative px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm disabled:cursor-not-allowed ${
                          gig?.status === "completed"
                            ? "bg-neutral-800/30 text-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-neutral-700/60 to-neutral-600/60 hover:from-blue-600/40 hover:to-blue-500/40 disabled:from-neutral-800/30 disabled:to-neutral-700/30 disabled:opacity-40 text-white hover:shadow-blue-500/15"
                        }`}
                      >
                        <span className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 rotate-90 transition-transform duration-200 group-hover:scale-110 group-disabled:scale-100"
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
                        </span>
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

                  <div className="flex gap-2 md:gap-4 justify-between sm:justify-end flex-shrink-0 items-center">
                    {/* Only show End Gig button if gig is not completed */}
                    {gig?.status !== "completed" && (
                      <button
                        onClick={() => setShowEndGigModal(true)}
                        className="group relative px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-transparent hover:bg-red-500/20 border border-neutral-600 hover:border-red-400/50 text-neutral-200 hover:text-red-300 text-xs md:text-sm font-medium transition-all duration-200 ease-in-out shadow-sm"
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
                    )}
                    <button
                      onClick={() => initiateCall("audio")}
                      disabled={gig?.status === "completed"}
                      className={`hidden md:flex items-center justify-center px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-transparent border transition-all duration-200 ease-in-out ${
                        gig?.status === "completed"
                          ? "border-neutral-700 text-gray-600 cursor-not-allowed"
                          : "hover:bg-blue-500/20 border-neutral-600 hover:border-blue-400/50 text-gray-400 hover:text-blue-300"
                      }`}
                    >
                      <FiPhone className="text-lg md:text-xl" />
                    </button>
                    <div className="md:hidden text-xs text-gray-400">
                      Audio calls available on desktop
                    </div>
                  </div>
                </div>

                <div
                  ref={desktopMessagesRef}
                  className=" overflow-y-auto overflow-x-auto p-2 md:p-4 space-y-2 md:space-y-3 text-sm min-h-0 chat-scrollbar transition-all duration-300 ease-in-out"
                  style={{
                    height: isGigInfoMinimized
                      ? "calc(100vh - 160px)"
                      : "calc(100vh - 220px)",
                  }}
                >
                  {messages.map((msg, i) => (
                    <div key={i} className="min-w-0">
                      {msg.type === "payment-request" ||
                      msg.type === "payment-accepted" ||
                      msg.type === "payment-rejected" ? (
                        // Payment Message
                        <div
                          className={`p-2 md:p-3 rounded-lg border max-w-[90%] sm:max-w-xs min-w-[200px] ${
                            msg.type === "payment-accepted"
                              ? "bg-green-500/10 border-green-500/30"
                              : msg.type === "payment-rejected"
                              ? "bg-red-500/10 border-red-500/30"
                              : msg.sender === getCurrentUserEmail()
                              ? "bg-neutral-800/40 border-neutral-600 self-end ml-auto"
                              : "bg-neutral-800/40 border-neutral-600"
                          }`}
                        >
                          <div className="flex items-center gap-1 md:gap-2 mb-2">
                            <FaDollarSign className="text-sm text-neutral-400" />
                            <span className="font-semibold text-white text-xs md:text-sm">
                              {msg.type === "payment-accepted"
                                ? "✅ Payment Accepted"
                                : msg.type === "payment-rejected"
                                ? "❌ Payment Rejected"
                                : msg.sender === getCurrentUserEmail()
                                ? "Payment request Sent"
                                : "Payment Request"}
                            </span>
                          </div>
                          <div className="text-base md:text-lg font-bold mb-1 text-white">
                            ${msg.amount || msg.message}
                          </div>
                          <div className="text-neutral-300 text-xs mb-2">
                            {msg.type === "payment-accepted"
                              ? "Payment has been accepted and processed"
                              : msg.type === "payment-rejected"
                              ? "Payment request was declined"
                              : `Payment request for $${
                                  msg.amount || msg.message
                                }`}
                          </div>
                          {/* Show action buttons only for pending payment requests to other party */}
                          {msg.type === "payment-request" && (
                            <>
                              {msg.sender === getCurrentUserEmail() ? (
                                // Show waiting message for sender
                                <div className="mt-2 px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-neutral-300 font-medium">
                                      Waiting for response...
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                // Show action buttons for receiver
                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handlePaymentResponse(
                                        msg.paymentId || msg.id,
                                        "completed"
                                      )
                                    }
                                    className="px-2 md:px-3 py-1 rounded bg-green-600/80 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                                  >
                                    Accept & Pay
                                  </button>
                                  <button
                                    onClick={() =>
                                      handlePaymentResponse(
                                        msg.paymentId || msg.id,
                                        "declined"
                                      )
                                    }
                                    className="px-2 md:px-3 py-1 rounded bg-neutral-600 hover:bg-neutral-500 text-white text-xs font-semibold transition-colors"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          <div className="text-xs text-neutral-500 mt-1">
                            {msg.time}
                          </div>
                        </div>
                      ) : (
                        // Regular Message
                        <div
                          className={`p-3 rounded-lg border max-w-[85%] sm:max-w-xs min-w-[120px] break-words ${
                            msg.sender === getCurrentUserEmail()
                              ? "bg-neutral-700/30 border-neutral-600/30 self-end ml-auto"
                              : "bg-neutral-800/30 border-neutral-700/30"
                          }`}
                        >
                          {msg.sender !== getCurrentUserEmail() && (
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
                              className="text-xs text-blue-400/90 hover:text-blue-300 mt-1 font-medium transition-colors"
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
                  {/* Typing Indicator - Absolutely positioned */}
                  {otherUserTyping && (
                    <div className="absolute -top-8 left-0 right-0 px-2 py-1  border-neutral-700/50 backdrop-blur-sm z-10">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-100"></div>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                        </div>
                        <span>{getOtherPartyUsername()} is typing...</span>
                      </div>
                    </div>
                  )}
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
                      className="text-lg md:text-xl text-gray-400 hover:text-orange-300 p-1 transition-colors"
                    >
                      <FaRegSmile />
                    </button>
                    <div className="relative group">
                      <button
                        onClick={
                          getCurrentUserRole() === "host" ||
                          gig?.status === "completed"
                            ? undefined
                            : () => setShowPaymentModal(true)
                        }
                        disabled={
                          getCurrentUserRole() === "host" ||
                          gig?.status === "completed"
                        }
                        className={`text-lg md:text-xl p-1 transition-colors ${
                          getCurrentUserRole() === "host" ||
                          gig?.status === "completed"
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-green-400 cursor-pointer"
                        }`}
                        title={
                          getCurrentUserRole() === "host"
                            ? ""
                            : gig?.status === "completed"
                            ? "Gig completed - payment requests disabled"
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
                      {gig?.status === "completed" &&
                        getCurrentUserRole() !== "host" && (
                          <div className="absolute bottom-full left-16 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Gig completed - payment requests disabled
                          </div>
                        )}
                    </div>
                    <input
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={gig?.status === "completed"}
                      className={`flex-1 border p-2 rounded-md text-sm md:text-base transition-all ${
                        gig?.status === "completed"
                          ? "bg-neutral-800/40 border-neutral-700 text-gray-500 placeholder-gray-600 cursor-not-allowed"
                          : "bg-neutral-800/80 border-neutral-600 focus:border-blue-400/50 text-white placeholder-gray-400"
                      }`}
                      placeholder={
                        gig?.status === "completed"
                          ? "Gig completed - messaging disabled"
                          : "Type a message..."
                      }
                    />
                    {input.length > 1400 && (
                      <div className="absolute -top-6 right-0 text-xs text-neutral-400">
                        {input.length}/1500
                      </div>
                    )}
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || gig?.status === "completed"}
                      className={`group relative px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm disabled:cursor-not-allowed ${
                        gig?.status === "completed"
                          ? "bg-neutral-800/30 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-neutral-700/60 to-neutral-600/60 hover:from-blue-600/40 hover:to-blue-500/40 disabled:from-neutral-800/40 disabled:to-neutral-700/40 disabled:opacity-50 text-white hover:shadow-blue-500/15 disabled:shadow-none"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 rotate-90 transition-transform duration-200 group-hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* Resizer */}
              <div
                ref={resizerRef}
                onMouseDown={startResize}
                className="hidden md:block w-2 cursor-col-resize bg-transparent hover:bg-neutral-700 from-blue-500/40 hover:to-purple-500/40 transition-all duration-200"
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
                      className="h-2 cursor-row-resize bg-gradient-to-r from-orange-500/20 to-purple-500/20 hover:from-orange-500/40 hover:to-purple-500/40 transition-all duration-200"
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

                    <div className="flex justify-around py-4 border-t border-b border-neutral-700/50">
                      <FaDesktop
                        onClick={startScreenShare}
                        className="text-xl cursor-pointer hover:text-orange-300 text-gray-400 transition-colors"
                      />
                      <FaMicrophone
                        onClick={toggleAudio}
                        className={`text-xl cursor-pointer transition-colors ${
                          isAudioEnabled
                            ? "text-green-400 hover:text-green-300"
                            : "text-red-400 hover:text-red-300"
                        }`}
                      />
                      <FaVideo
                        onClick={toggleVideo}
                        className={`text-xl cursor-pointer transition-colors ${
                          isVideoEnabled
                            ? "text-green-400 hover:text-green-300"
                            : "text-red-400 hover:text-red-300"
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
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-blue-500/20 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-green-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <FaDollarSign className="text-green-300 text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Request Payment
                  </h3>
                  <p className="text-sm text-blue-200/80">
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
                    <span className="text-xs text-blue-300/80">
                      Payment Progress
                    </span>
                    <span className="text-xs text-green-300/90 font-medium">
                      {Math.round(((gig.paidAmount || 0) / gig.amount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700/60 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-green-400 h-1.5 rounded-full transition-all duration-300"
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
                  className="w-full pl-16 pr-4 py-3 bg-neutral-900/50 border border-blue-500/30 rounded-lg text-white text-lg font-medium placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
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
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-red-500/20 rounded-lg p-6 max-w-md w-full mx-4">
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
                className="px-4 py-2 rounded bg-neutral-600 hover:bg-neutral-500 text-white transition-colors border border-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={endGig}
                className="px-4 py-2 rounded bg-red-600/80 hover:bg-red-500 text-white transition-colors border border-red-500/50"
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
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-blue-500/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Gig Ended</h3>
            <p className="text-gray-300 mb-6">
              The gig has been ended by the other party. You will be redirected
              to the review page now.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Determine the other user to review
                  let receiverUsername = "";
                  if (gig && user) {
                    // If current user is the host, review the guest; if guest, review the host
                    if (gig.host && gig.host.id === user.id && gig.guest) {
                      receiverUsername = gig.guest.username;
                    } else if (gig.host && gig.host.username) {
                      receiverUsername = gig.host.username;
                    }
                  }

                  if (receiverUsername) {
                    router.push(
                      `/review?gigId=${gigId}&receiver=${receiverUsername}`
                    );
                  } else {
                    // Fallback - redirect to gigs page if we can't determine the other user
                    console.error("Could not determine receiver for review");
                    router.push("/gigs");
                  }
                }}
                className="px-4 py-2 rounded bg-blue-600/80 hover:bg-blue-500 text-white transition-colors border border-blue-500/50"
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
