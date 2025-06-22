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

interface Props {
  params: {
    gigId: string;
  };
}

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
  const [messages, setMessages] = useState(chatData);
  const [callControls, setCallControls] = useState(false);
  const [screenShareUI, setScreenShareUI] = useState(false);

  const emojiRef = useRef(null);

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

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { sender: "Bob", time: new Date().toLocaleTimeString(), message: input },
    ]);
    setInput("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const initiateCall = (type: "audio" | "video") => {
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
  Collab and Calling features are not available on small screens. Please rotate your
  device or use a larger screen.
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
                {screenShareUI && (
                  <>
                    <div style={{ height: topHeight }} className=" p-4">
                      <span className="font-bold text-lg">
                        Screen Share area
                      </span>
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
                  <TldrawWrapper />
                </div>
              </div>

              {/* Call Column */}
              {callControls && (
                <>
                  <div className="w-80 border-l border-neutral-700 p-4 flex flex-col gap-4 hidden md:flex">
                    <div className="flex flex-col gap-2 h-8/9 ">
                      <div className="bg-neutral-800 h-1/2 rounded-md flex items-center justify-center text-gray-400 text-sm">
                        User Video 1
                      </div>
                      <div className="bg-neutral-800 h-1/2 rounded-md flex items-center justify-center text-gray-400 text-sm">
                        User Video 2
                      </div>
                    </div>

                    <div className="flex justify-around py-4 border-t border-b border-neutral-700">
                      <FaMicrophone className="text-xl cursor-pointer hover:text-white text-gray-400" />
                      <FaVideo className="text-xl cursor-pointer hover:text-white text-gray-400" />
                      <FaDesktop
                        onClick={() => setScreenShareUI(!screenShareUI)}
                        className="text-xl cursor-pointer hover:text-white text-gray-400"
                      />
                    </div>

                    <button
                      onClick={() => setCallControls(false)}
                      className="mt-auto flex items-center justify-center gap-2 border border-neutral-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all duration-200
                           hover:bg-gradient-to-r hover:from-pink-500 hover:via-fuchsia-600 hover:to-pink-500 "
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
