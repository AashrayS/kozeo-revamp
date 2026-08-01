"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, [userAuthenticated, currentUser, router]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>

      {/* Background glows */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
        </>
      )}

      <div
        className={`min-h-screen relative z-10 flex transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-text-1"
            : "bg-container-1    text-text-1"
        }`}
      >

        <main className="flex-1 p-6 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1
                className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                  theme === "dark" ? "text-text-1" : "text-text-1"
                }`}
              >
                Admin Settings
              </h1>
              <p
                className={`transition-colors duration-300 ${
                  theme === "dark" ? "text-text-3" : "text-text-3"
                }`}
              >
                Manage platform settings and configurations
              </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Withdraw Requests Card */}
              <div
                className={`p-6 rounded-sm border transition-all duration-300 hover:scale-105 cursor-pointer ${
                  theme === "dark"
                    ? "bg-forge-bg-raised/50 border-container-3 hover:border-forge-line"
                    : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:border-forge-line"
                }`}
                onClick={() => router.push("/admin/withdraw-requests")}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-forge-ember-low/10 rounded-sm">
                    <FiDollarSign className="text-2xl text-forge-ember" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-text-1" : "text-text-1"
                      }`}
                    >
                      Withdraw Requests
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-text-3" : "text-text-3"
                      }`}
                    >
                      Manage user withdrawal requests
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-text-3" : "text-text-3"
                  }`}
                >
                  View and update the status of pending withdrawal requests from
                  users.
                </p>
              </div>

              {/* User Management Card */}
              <div
                className={`p-6 rounded-sm border transition-all duration-300 opacity-50 ${
                  theme === "dark"
                    ? "bg-forge-bg-raised/50 border-container-3"
                    : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-forge-ember-low rounded-sm">
                    <FiUsers className="text-2xl text-forge-ember" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-text-1" : "text-text-1"
                      }`}
                    >
                      User Management
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-text-3" : "text-text-3"
                      }`}
                    >
                      Coming Soon
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-text-3" : "text-text-3"
                  }`}
                >
                  Manage user accounts, roles, and permissions across the
                  platform.
                </p>
              </div>

              {/* Discussion Rooms Card */}
              <div
                onClick={() => router.push("/admin/discussion-rooms")}
                className={`p-6 rounded-sm border transition-all duration-300 cursor-pointer hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] ${
                  theme === "dark"
                    ? "bg-container-2 border-container-3 hover:border-forge-line"
                    : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:border-forge-line"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-forge-ember-low/10 rounded-sm">
                    <FiMessageSquare className="text-2xl text-text-3" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-text-1" : "text-text-1"
                      }`}
                    >
                      Discussion Rooms
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-text-3" : "text-text-3"
                      }`}
                    >
                      Manage community discussions
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-text-3" : "text-text-3"
                  }`}
                >
                  Create and manage discussion rooms for community engagement.
                </p>
              </div>

              {/* Platform Settings Card */}
              <div
                className={`p-6 rounded-sm border transition-all duration-300 opacity-50 ${
                  theme === "dark"
                    ? "bg-forge-bg-raised/50 border-container-3"
                    : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-forge-ember-low/30 rounded-sm">
                    <FiSettings className="text-2xl text-forge-ember" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        theme === "dark" ? "text-text-1" : "text-text-1"
                      }`}
                    >
                      Platform Settings
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        theme === "dark" ? "text-text-3" : "text-text-3"
                      }`}
                    >
                      Coming Soon
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm transition-colors duration-300 ${
                    theme === "dark" ? "text-text-3" : "text-text-3"
                  }`}
                >
                  Configure platform-wide settings, fees, and policies.
                </p>
              </div>
            </div>

            {/* Admin Info */}
            <div
              className={`mt-8 p-6 rounded-sm border transition-all duration-300 ${
                theme === "dark"
                  ? "bg-forge-bg-raised/50 border-container-3"
                  : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-container-1 bg-forge-ember rounded-full flex items-center justify-center">
                  <span className="text-text-1 text-lg font-bold">
                    {currentUser?.first_name?.charAt(0) || "A"}
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      theme === "dark" ? "text-text-1" : "text-text-1"
                    }`}
                  >
                    Welcome, {currentUser?.first_name} {currentUser?.last_name}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-text-3" : "text-text-3"
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
