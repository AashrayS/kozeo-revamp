"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FaRegSmile, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { useMemo, useState, useRef, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import EmojiPicker from "emoji-picker-react";
import discussionRooms from "../../../../data/discussionRooms.json";

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
  const room = useMemo(
    () => discussionRooms.find((r) => r.id.toString() === roomId),
    [roomId]
  );

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [currentUser] = useState(
    "User_" + Math.random().toString(36).substr(2, 9)
  ); // Generate random username

  const emojiRef = useRef(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      setMessages((prev) => [...prev, msg]);
      console.log("Received chat message:", msg);
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

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: currentUser,
      time: new Date().toLocaleTimeString(),
      message: input,
      roomId: roomId,
    };

    setMessages((prev) => [...prev, messageData]);
    socketRef.current?.emit("discussion-message", messageData);

    setInput("");
    setShowEmoji(false);
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

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-discussion-room", {
        roomId,
        username: currentUser,
      });
    }
    router.push("/Atrium/discussion");
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Discussion Room Not Found</h1>
          <button
            onClick={() => router.push("/Atrium/discussion")}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Back to Discussion Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="flex flex-col h-screen">
        <Header logoText="Kozeo" />
        <div className="relative z-10 flex flex-1 flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />

          <main className="flex-1 p-0 flex flex-col overflow-hidden">
            {/* Room Header */}
            <div className="p-4 border-b border-neutral-700 bg-neutral-900/50">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-white">{room.name}</h1>
                  <p className="text-sm text-gray-400">{room.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FaUsers />
                    <span>{connectedUsers.length} online</span>
                  </div>
                  <button
                    onClick={leaveRoom}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                  >
                    <FaSignOutAlt />
                    Leave Room
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.type === "system" ? (
                        <div className="text-center text-gray-500 text-xs italic py-1">
                          {msg.message}
                        </div>
                      ) : (
                        <div
                          className={`flex ${
                            msg.sender === currentUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md p-3 rounded-lg break-words whitespace-pre-wrap ${
                              msg.sender === currentUser
                                ? "bg-cyan-600 text-white"
                                : "bg-neutral-800 text-white"
                            }`}
                          >
                            {msg.sender !== currentUser && (
                              <div className="text-xs text-gray-400 mb-1 font-semibold">
                                {msg.sender}
                              </div>
                            )}
                            <div>{msg.message}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-neutral-700 p-4 relative">
                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-16 left-4 z-10"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) =>
                          setInput((prev) => prev + emojiData.emoji)
                        }
                        height={400}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="text-xl text-gray-400 hover:text-white transition-colors"
                    >
                      <FaRegSmile />
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-neutral-800 border border-neutral-600 p-3 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Type a message..."
                      maxLength={500}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 rounded-md text-white font-semibold transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Users Sidebar */}
              <div className="w-64 border-l border-neutral-700 bg-neutral-900/30">
                <div className="p-4 border-b border-neutral-700">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FaUsers className="text-cyan-400" />
                    Online Users ({connectedUsers.length})
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {connectedUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        user === currentUser
                          ? "bg-cyan-900/50 border border-cyan-500/30"
                          : "bg-neutral-800/50"
                      }`}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">
                        {user} {user === currentUser && "(You)"}
                      </span>
                    </div>
                  ))}
                  {connectedUsers.length === 0 && (
                    <div className="text-gray-500 text-sm text-center py-4">
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
