"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import gigs from "../../../../data/gig.json";
import { FiStar, FiVideo, FiPhone } from "react-icons/fi";
import { FaMicrophone, FaVideo, FaDesktop, FaPhoneSlash } from "react-icons/fa";
import { useMemo, useState, useRef, useEffect } from "react";
import { use } from "react";
import TldrawWrapper from "@/components/common/TldrawWrapper";
import EmojiPicker from "emoji-picker-react";
import chatData from "../../../../data/chat.json";
import { FaRegSmile } from "react-icons/fa";
// import { createTLStore, defaultShapeUtils } from "tldraw";/

import { io } from "socket.io-client";

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
  const numericGigId = parseInt(gigId);
  const gig = useMemo(
    () => gigs.find((g) => g.gigId === numericGigId),
    [numericGigId]
  );

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [width, setWidth] = useState(400);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [callControls, setCallControls] = useState(false);
  const [screenShareUI, setScreenShareUI] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
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
    const socket = io("http://localhost:3001", {
      query: { gigID: "1" },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", "1");
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
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
  }, []);

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

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { sender: "Bob", time: new Date().toLocaleTimeString(), message: input },
    ]);
    socketRef.current?.emit("chat-message", {
      sender: "bob",
      time: new Date().toLocaleTimeString(),
      message: input,
    });

    setInput("");
    setShowEmoji(false);
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

  if (!gig) return <div className="text-white p-10">Gig not found</div>;

  return (
    <>
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="flex flex-col h-screen">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />

          <main
            className="flex-1 p-0 flex flex-col overflow-hidden overflow-x-hidden"
            ref={containerRef}
          >
            <div className="block md:hidden bg-neutral-900  text-fuchsia-200 p-3 text-center text-sm font-medium rounded-md shadow-sm">
              Collab and Calling features are not available on small screens.
              Please rotate your device or use a larger screen.
            </div>

            {/* Row containing all three columns */}
            <div className=" md:flex flex-1 flex-row h-full">
              {/* Chat Column */}
              <div
                className="flex flex-col h-full overflow-x-hidden border-neutral-700"
                style={{ width }}
              >
                <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                  <span className="font-bold text-lg">@username</span>

                  <div className="flex gap-4">
                    <FiVideo
                      onClick={() => initiateCall("video")}
                      className="text-xl cursor-pointer"
                    />
                    <FiPhone
                      onClick={() => initiateCall("audio")}
                      className="text-xl cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-md max-w-xs break-words whitespace-pre-wrap ${
                        msg.sender === "Bob"
                          ? "bg-emerald-600 self-end ml-auto"
                          : "bg-neutral-800"
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-700 p-3 relative">
                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-16 left-3 z-10"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setInput((prev) => prev + emojiData.emoji)
                        }
                        height={500}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="text-xl text-gray-400 hover:text-white"
                    >
                      <FaRegSmile />
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-neutral-800 border border-neutral-600 p-2 rounded-md text-white"
                      placeholder="Type a message..."
                    />
                  </div>
                </div>
              </div>
              {/* Resizer */}
              <div
                ref={resizerRef}
                onMouseDown={startResize}
                className="w-2 cursor-col-resize bg-neutral-800 hover:bg-neutral-600 transition-colors"
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
                  <TldrawWrapper gigId="canvas-memories-001" />{" "}
                </div>
              </div>

              {/* Call Column */}
              {callControls && (
                <>
                  <div className="w-80 border-l border-neutral-700 p-4 flex flex-col gap-4 hidden md:flex">
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
    </>
  );
}
