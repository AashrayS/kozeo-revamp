"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { PageLoader } from "@/components/common/PageLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../../store/hooks";
import { isAuthenticated } from "../../../../utilities/api";
import {
  FiSettings,
  FiUsers,
  FiDollarSign,
  FiMessageSquare,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user: currentUser, isAuthenticated: userAuthenticated } = useUser();
  const [loading, setLoading] = useState(true);

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated() || !userAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user is admin
    if (currentUser?.role !== "admin") {
      router.push("/Atrium");
      return;
    }

    setLoading(false);
  }, [userAuthenticated, currentUser, router]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <Header logoText="Kozeo Admin" />

      {/* Background glows */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        </>
      )}

      <div
        className={`min-h-screen relative z-10 flex transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900"
        }`}
      >
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1
                className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Admin Settings
              </h1>
              <p
                className={`transition-colors duration-300 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage platform settings and configurations
              </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Withdraw Requests Card */}
              <div
                className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                  theme === "dark"
                    ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                }`}
                onClick={() => router.push("/admin/withdraw-requests")}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FiDollarSign className="text-2xl text-green-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Withdraw Requests
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Manage user withdrawal requests
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  View and update the status of pending withdrawal requests from
                  users.
                </p>
              </div>

              {/* User Management Card */}
              <div
                className={`p-6 rounded-xl border transition-all duration-300 opacity-50 ${
                  theme === "dark"
                    ? "bg-neutral-900/50 border-neutral-800"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FiUsers className="text-2xl text-blue-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      User Management
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Coming Soon
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Manage user accounts, roles, and permissions across the
                  platform.
                </p>
              </div>

              {/* Discussion Rooms Card */}
              <div
                onClick={() => router.push("/admin/discussion-rooms")}
                className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                    : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <FiMessageSquare className="text-2xl text-purple-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Discussion Rooms
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Manage community discussions
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Create and manage discussion rooms for community engagement.
                </p>
              </div>

              {/* Platform Settings Card */}
              <div
                className={`p-6 rounded-xl border transition-all duration-300 opacity-50 ${
                  theme === "dark"
                    ? "bg-neutral-900/50 border-neutral-800"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <FiSettings className="text-2xl text-orange-500" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Platform Settings
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Coming Soon
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Configure platform-wide settings, fees, and policies.
                </p>
              </div>
            </div>

            {/* Admin Info */}
            <div
              className={`mt-8 p-6 rounded-xl border transition-all duration-300 ${
                theme === "dark"
                  ? "bg-neutral-900/50 border-neutral-800"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {currentUser?.first_name?.charAt(0) || "A"}
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Welcome, {currentUser?.first_name} {currentUser?.last_name}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Platform Administrator • @{currentUser?.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
