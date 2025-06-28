"use client";

import { useParams } from "next/navigation";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      {/* Main Layout */}
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">User Profile</h2>

              {/* Profile Card */}
              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-6 shadow-md mb-6">
                <div className="flex items-center space-x-6 mb-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {username ? username.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {username || "Unknown User"}
                    </h3>
                    <div className="text-sm text-cyan-400 font-medium mb-2">
                      @{username || "unknown"}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-0.5 text-xs bg-neutral-800 border border-neutral-600 text-emerald-400 rounded-md">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Member since 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">12</div>
                  <div className="text-sm text-gray-300">
                    Projects Completed
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">4.8</div>
                  <div className="text-sm text-gray-300">Average Rating</div>
                </div>
              </div>

              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">156</div>
                  <div className="text-sm text-gray-300">Hours Worked</div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <p className="text-sm text-gray-300 mb-6">
                Welcome to {username}'s profile! This user is an active member
                of the Kozeo community, participating in various projects and
                contributing to the platform's growth.
              </p>

              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  "JavaScript",
                  "React",
                  "Node.js",
                  "Python",
                  "UI/UX Design",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-xs bg-neutral-800 border border-neutral-600 text-gray-300 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      Completed project "E-commerce Dashboard"
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      Joined discussion on "React Best Practices"
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">5 days ago</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      Started new project "Mobile App Design"
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
