"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { FaRegSmile, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { useMemo, useState, useRef, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../../store/hooks";
import {
  getDiscussionRoom,
  getDiscussionRoomChats,
  sendDiscussionMessage,
} from "../../../../utilities/kozeoApi";

import { io } from "socket.io-client";
import { WEBSOCKET_URL } from "@/config";

interface Props {
  params: {
    roomId: string;
  };
}

type Socket = ReturnType<typeof io>;

export default function DiscussionRoomPage({
  params: paramsPromise,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(paramsPromise);
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();

  // State for room data and loading
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [draggedMessage, setDraggedMessage] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragThreshold] = useState(100); // Minimum pixels to drag right for reply
  const [currentUser] = useState(
    user
      ? user.username || `User_${user.id}`
      : "Guest_" + Math.random().toString(36).substr(2, 9)
  );

  const emojiRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch room data and messages
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room details
        const roomData = await getDiscussionRoom(roomId);
        if (!roomData) {
          setError("Discussion room not found");
          return;
        }

        setRoom(roomData);

        // Fetch existing messages
        const messagesData = await getDiscussionRoomChats(roomId);
        const formattedMessages = messagesData.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString(),
          timestamp: msg.timestamp,
          type: "user",
          replyTo: msg.replyTo,
        }));

        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching room data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load room data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = io(WEBSOCKET_URL, {
      query: { roomType: "discussion", roomId: roomId },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to discussion room:", socket.id);
      socket.emit("join-discussion-room", { roomId, username: currentUser });
    });

    socket.on("chat-message", (msg) => {
      // Format incoming socket messages to match our format
      const formattedMsg = {
        ...msg,
        id: msg.id || Date.now() + Math.random(), // Ensure each message has an ID
        type: msg.type || "user",
      };
      setMessages((prev) => [...prev, formattedMsg]);
      console.log("Received chat message:", formattedMsg);
    });

    socket.on("user-joined-discussion", (data) => {
      console.log("User joined discussion:", data);
      setConnectedUsers((prev) => [...prev, data.username]);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `${data.username} joined the discussion`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    socket.on("user-left-discussion", (data) => {
      console.log("User left discussion:", data);
      setConnectedUsers((prev) =>
        prev.filter((user) => user !== data.username)
      );
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `${data.username} left the discussion`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    socket.on("users-in-room", (users) => {
      console.log("Users in room:", users);
      setConnectedUsers(users);
    });

    return () => {
      socket.emit("leave-discussion-room", { roomId, username: currentUser });
      socket.disconnect();
    };
  }, [roomId, currentUser]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const messageData = {
      id: Date.now() + Math.random(), // Unique ID for local message
      sender: currentUser,
      time: new Date().toLocaleTimeString(),
      message: input,
      roomId: roomId,
      type: "user",
      replyTo: replyTo || null,
    };

    // Add message to local state immediately for responsiveness
    setMessages((prev) => [...prev, messageData]);

    try {
      // Send message to API
      await sendDiscussionMessage({
        discussionRoom: roomId,
        content: input,
        replyTo: replyTo || undefined,
      });

      // Send via websocket for real-time updates to other users
      socketRef.current?.emit("discussion-message", messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg !== messageData));
    }

    setInput("");
    setShowEmoji(false);
    setReplyTo(null); // Clear reply after sending
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape" && replyTo) {
      setReplyTo(null);
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-discussion-room", {
        roomId,
        username: currentUser,
      });
    }
    router.push("/Atrium/discussion");
  };

  // Drag and drop handlers for reply functionality with horizontal drag detection
  const handleDragStart = (e: React.DragEvent, message: any) => {
    if (message.type === "system") return; // Don't allow dragging system messages
    setDraggedMessage(message);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    e.dataTransfer.effectAllowed = "copy";
    // Create a transparent drag image to hide default drag preview
    const dragImage = new Image();
    dragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (!dragStartPos || !draggedMessage || e.clientX === 0) return;

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = Math.abs(e.clientY - dragStartPos.y);

    // Check if dragging horizontally to the right with minimal vertical movement
    const isHorizontalRightDrag = deltaX > dragThreshold && deltaY < 50;

    if (isHorizontalRightDrag !== isDragOver) {
      setIsDragOver(isHorizontalRightDrag);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!dragStartPos || !draggedMessage) {
      setDraggedMessage(null);
      setIsDragOver(false);
      setDragStartPos(null);
      return;
    }

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = Math.abs(e.clientY - dragStartPos.y);

    // If dragged right beyond threshold with minimal vertical movement, set reply
    if (
      deltaX > dragThreshold &&
      deltaY < 50 &&
      draggedMessage.type !== "system"
    ) {
      setReplyTo(draggedMessage.id);
    }

    setDraggedMessage(null);
    setIsDragOver(false);
    setDragStartPos(null);
  };

  // Helper function to find the original message for a reply
  const findReplyMessage = (replyId: string) => {
    return messages.find((msg) => msg.id === replyId);
  };

  if (loading) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl mb-2">Loading discussion room...</div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Please wait...
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !room) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <h1
            className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {error
              ? "Error Loading Discussion Room"
              : "Discussion Room Not Found"}
          </h1>
          {error && (
            <p
              className={`mb-4 text-sm ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`}
            >
              {error}
            </p>
          )}
          <button
            onClick={() => router.push("/Atrium/discussion")}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-white"
          >
            Back to Discussion Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Glows */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        </>
      )}
      <div className="flex flex-col h-screen">
        <Header logoText="Kozeo" />
        <div
          className={`relative z-10 flex flex-1 flex-row transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
          }`}
        >
          <Sidebar />

          <main className="flex-1 p-0 flex flex-col overflow-hidden">
            {/* Room Header */}
            <div
              className={`p-3 md:p-4 border-b transition-all duration-300 ${
                theme === "dark"
                  ? "border-neutral-700 bg-neutral-900/50"
                  : "border-gray-200 bg-white/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h1
                    className={`text-lg md:text-xl font-bold truncate transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {room.title}
                  </h1>
                  <p
                    className={`text-xs md:text-sm truncate transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {room.description}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
                  <button
                    onClick={() => setShowMobileUsers(!showMobileUsers)}
                    className={`md:hidden flex items-center gap-1 text-xs transition-colors duration-300 ${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FaUsers />
                    <span>{connectedUsers.length}</span>
                  </button>
                  <div
                    className={`hidden md:flex items-center gap-1 md:gap-2 text-xs md:text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <FaUsers />
                    <span className="hidden xs:inline">
                      {connectedUsers.length} online
                    </span>
                    <span className="xs:hidden">{connectedUsers.length}</span>
                  </div>
                  <ProfessionalButton
                    onClick={leaveRoom}
                    variant="danger"
                    size="sm"
                    className="text-xs md:text-sm"
                    icon={<FaSignOutAlt className="w-3 h-3" />}
                  >
                    <span className="hidden sm:inline">Leave Room</span>
                    <span className="sm:hidden">Leave</span>
                  </ProfessionalButton>
                </div>
              </div>
            </div>

            {/* Mobile Users List */}
            {showMobileUsers && (
              <div
                className={`md:hidden border-b max-h-32 overflow-y-auto transition-all duration-300 ${
                  theme === "dark"
                    ? "border-neutral-700 bg-neutral-900/50"
                    : "border-gray-200 bg-white/80"
                }`}
              >
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {connectedUsers.map((user, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded text-xs transition-colors duration-300 ${
                          user === currentUser
                            ? "bg-cyan-900/50 border border-cyan-500/30"
                            : theme === "dark"
                            ? "bg-neutral-800/50"
                            : "bg-gray-100/80"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span
                          className={`truncate transition-colors duration-300 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user} {user === currentUser && "(You)"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {connectedUsers.length === 0 && (
                    <div
                      className={`text-xs text-center py-2 transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      No users online
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-1 overflow-hidden">
              {/* Global drag indicator */}
              {draggedMessage && (
                <div
                  className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                    isDragOver
                      ? theme === "dark"
                        ? "bg-cyan-900 text-cyan-300 border border-cyan-500"
                        : "bg-cyan-100 text-cyan-700 border border-cyan-400"
                      : theme === "dark"
                      ? "bg-neutral-800 text-gray-300 border border-neutral-600"
                      : "bg-gray-200 text-gray-700 border border-gray-400"
                  }`}
                >
                  <div className="text-sm font-medium flex items-center gap-2">
                    {isDragOver
                      ? "✓ Release to reply"
                      : "← Drag right to reply"}
                  </div>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Messages */}
                <div className="h-screen overflow-y-scroll p-2 md:p-4 space-y-2 md:space-y-3 text-sm">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.type === "system" ? (
                        <div
                          className={`text-center text-xs italic py-1 transition-colors duration-300 cursor-text select-text ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {msg.message}
                        </div>
                      ) : (
                        <div
                          className={`flex gap-2 items-start ${
                            msg.sender === currentUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* User Avatar - Only show for other users (left side) */}
                          {msg.sender !== currentUser && (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 ${
                                theme === "dark"
                                  ? "bg-neutral-600 text-white"
                                  : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {msg.sender.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`relative max-w-[85%] sm:max-w-xs lg:max-w-md p-2 md:p-3 rounded-lg break-words whitespace-pre-wrap transition-all duration-200 border select-text ${
                              msg.type !== "system" ? "hover:shadow-md" : ""
                            } ${
                              msg.sender === currentUser
                                ? "bg-neutral-700/30 border-neutral-600/30 text-neutral-100"
                                : "bg-neutral-800/30 border-neutral-700/30 text-neutral-100"
                            } ${
                              draggedMessage?.id === msg.id
                                ? isDragOver
                                  ? "opacity-75 transform translate-x-4 shadow-lg ring-2 ring-cyan-400"
                                  : "opacity-50 transform translate-x-1"
                                : ""
                            }`}
                            draggable={false}
                          >
                            {/* ...existing code... */}
                            {msg.replyTo && (
                              <div
                                className={`text-xs mb-2 p-2 rounded border-l-2 max-w-full overflow-hidden cursor-text select-text ${
                                  theme === "dark"
                                    ? "bg-neutral-700/50 border-cyan-400 text-gray-300"
                                    : "bg-gray-100/80 border-cyan-600 text-gray-600"
                                }`}
                              >
                                <div className="font-semibold text-cyan-400 text-[10px] mb-1 truncate cursor-text select-text">
                                  Replying to{" "}
                                  {findReplyMessage(msg.replyTo)?.sender ||
                                    "Unknown"}
                                  :
                                </div>
                                <div className="text-[10px] line-clamp-2 break-words cursor-text select-text">
                                  {findReplyMessage(msg.replyTo)?.message ||
                                    "Message not found"}
                                </div>
                              </div>
                            )}

                            {/* Drag handle area */}
                            <div
                              className="absolute left-0 top-0 w-2 h-full cursor-grab active:cursor-grabbing opacity-0 hover:opacity-30 bg-gray-500 transition-opacity"
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, msg)}
                              onDrag={handleDrag}
                              onDragEnd={handleDragEnd}
                              title="Drag to reply"
                            />

                            {msg.sender !== currentUser && (
                              <div
                                className={`text-xs mb-1 font-semibold truncate cursor-text select-text ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {msg.sender}
                              </div>
                            )}
                            <div className="text-sm whitespace-pre-wrap break-words cursor-text select-text">
                              {msg.message}
                            </div>
                            <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                              <span className="cursor-text select-text">
                                {msg.time}
                              </span>
                              <div className="flex items-center gap-2">
                                {draggedMessage?.id === msg.id &&
                                  isDragOver && (
                                    <span className="text-cyan-400 animate-pulse">
                                      →
                                    </span>
                                  )}
                                <button
                                  onClick={() => setReplyTo(msg.id)}
                                  className={`text-[10px] opacity-50 hover:opacity-100 mx-2 transition-opacity ${
                                    theme === "dark"
                                      ? "hover:text-cyan-400"
                                      : "hover:text-cyan-600"
                                  }`}
                                  title="Reply to this message"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* User Avatar - Only show for current user (right side) */}
                          {msg.sender === currentUser && (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 bg-cyan-700 text-white`}
                            >
                              {msg.sender.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div
                  className={`border-t p-2 md:p-4 relative transition-colors duration-300 ${
                    theme === "dark" ? "border-neutral-700" : "border-gray-200"
                  } ${
                    isDragOver
                      ? theme === "dark"
                        ? "bg-cyan-900/20 border-cyan-500"
                        : "bg-cyan-50 border-cyan-300"
                      : ""
                  }`}
                >
                  {/* Reply Preview */}
                  {replyTo && (
                    <div
                      className={`mb-3 p-2 rounded border-l-4 max-w-full overflow-hidden ${
                        theme === "dark"
                          ? "bg-neutral-800/50 border-cyan-400 text-gray-300"
                          : "bg-gray-100/80 border-cyan-600 text-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-cyan-400 text-xs mb-1 truncate">
                            Replying to{" "}
                            {findReplyMessage(replyTo)?.sender || "Unknown"}:
                          </div>
                          <div className="text-sm line-clamp-2 break-words">
                            {findReplyMessage(replyTo)?.message ||
                              "Message not found"}
                          </div>
                        </div>
                        <button
                          onClick={() => setReplyTo(null)}
                          className={`flex-shrink-0 p-1 rounded hover:bg-red-500/20 transition-colors ${
                            theme === "dark"
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-500"
                          }`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag Drop Indicator */}
                  {isDragOver && (
                    <div
                      className={`mb-3 p-4 rounded-lg border-2 border-dashed text-center transition-colors ${
                        theme === "dark"
                          ? "border-cyan-400 bg-cyan-900/20 text-cyan-400"
                          : "border-cyan-600 bg-cyan-50 text-cyan-600"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        ✓ Reply mode activated
                      </div>
                      <div className="text-xs opacity-70">
                        Release to set as reply target
                      </div>
                    </div>
                  )}

                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-12 md:bottom-16 left-2 md:left-4 z-10"
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
                    {user && (
                      <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className={`text-lg md:text-xl p-1 transition-colors duration-300 ${
                          theme === "dark"
                            ? "text-gray-400 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <FaRegSmile />
                      </button>
                    )}
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={!user}
                      rows={Math.min(Math.max(input.split("\n").length, 1), 5)}
                      className={`flex-1 border p-2 md:p-3 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 resize-none ${
                        !user ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        theme === "dark"
                          ? "bg-neutral-800 border-neutral-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder={
                        replyTo
                          ? `Replying to ${
                              findReplyMessage(replyTo)?.sender || "Unknown"
                            }...`
                          : user
                          ? "Type a message..."
                          : "Please login to send messages..."
                      }
                      maxLength={1000}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || !user}
                      className="px-2 md:px-4 py-2 md:py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 rounded-md text-white font-semibold transition-colors text-sm md:text-base"
                    >
                      <span className="hidden sm:inline">Send</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Sidebar */}
              <div
                className={`hidden md:block w-48 lg:w-64 border-l transition-colors duration-300 ${
                  theme === "dark"
                    ? "border-neutral-700 bg-neutral-900/30"
                    : "border-gray-200 bg-white/50"
                }`}
              >
                <div
                  className={`p-3 lg:p-4 border-b transition-colors duration-300 ${
                    theme === "dark" ? "border-neutral-700" : "border-gray-200"
                  }`}
                >
                  <h3
                    className={`font-semibold flex items-center gap-2 text-sm lg:text-base transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <FaUsers className="text-cyan-400" />
                    <span className="hidden lg:inline">
                      Online Users ({connectedUsers.length})
                    </span>
                    <span className="lg:hidden">
                      Users ({connectedUsers.length})
                    </span>
                  </h3>
                </div>
                <div className="p-2 lg:p-4 space-y-1 lg:space-y-2 max-h-96 overflow-y-auto">
                  {connectedUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 lg:gap-2 p-1 lg:p-2 rounded-lg transition-colors duration-300 ${
                        user === currentUser
                          ? "bg-cyan-900/50 border border-cyan-500/30"
                          : theme === "dark"
                          ? "bg-neutral-800/50"
                          : "bg-gray-100/80"
                      }`}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span
                        className={`text-xs lg:text-sm truncate transition-colors duration-300 ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user} {user === currentUser && "(You)"}
                      </span>
                    </div>
                  ))}
                  {connectedUsers.length === 0 && (
                    <div
                      className={`text-xs lg:text-sm text-center py-4 transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      No users online
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
