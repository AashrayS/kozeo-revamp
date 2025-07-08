"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { FiStar, FiCalendar, FiDollarSign, FiUsers } from "react-icons/fi";
import {
  getUserByUsername,
  getCurrentUser,
} from "../../../../utilities/kozeoApi";
import { isAuthenticated } from "../../../../utilities/api";

interface ProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_Picture: string;
  bio: string;
  links: string[];
  achievements: any[];
  wallet?: {
    amount: number;
    currency: string;
  };
  gigsCollaborated: any[];
  gigsHosted: any[];
  rating: number;
  workedWith?: any[];
  collaboratedGigs?: any[];
  transactions?: any[];
  previouslyWorkedWith?: any[];
  reviewsReceived: any[];
  role: string;
  email?: string;
  phone?: string;
  country_Code?: string;
}

// ProfileImage component with fallback handling
interface ProfileImageProps {
  profilePic: string;
  username: string;
  size: "sm" | "md" | "lg";
}

function ProfileImage({ profilePic, username, size }: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20 lg:w-24 lg:h-24",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-lg lg:text-2xl",
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const shouldShowImage =
    profilePic && !imageError && profilePic.startsWith("http");

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative`}
    >
      {shouldShowImage && (
        <img
          src={profilePic}
          alt={`${username}'s profile`}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <span
        className={`text-white ${textSizeClasses[size]} font-bold ${
          shouldShowImage && imageLoaded ? "absolute opacity-0" : "flex"
        } items-center justify-center w-full h-full transition-opacity duration-200`}
      >
        {getInitials(username)}
      </span>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Get current user first to check if this is their own profile
        const currentUser = await getCurrentUser();
        const isOwn = (currentUser as any).username === username;
        setIsOwnProfile(isOwn);

        // Fetch the profile data
        console.log("Fetching profile for username:", username);
        const profileData = await getUserByUsername(username);
        console.log("Profile data received:", profileData);

        if (profileData) {
          setProfile(profileData as any);
        } else {
          console.log("No profile data returned");
          setError("User not found");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        setError(`Failed to load profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, router]);

  // Add a test button for debugging (only in development)
  const testGetUserByUsername = async () => {
    try {
      console.log("Testing getUserByUsername...");
      const result = await getUserByUsername(username as string);
      console.log("Test result:", result);
      alert("Test successful! Check console for details.");
    } catch (error: any) {
      console.error("Test failed:", error);
      alert(`Test failed: ${error.message}`);
    }
  };

  const testConnection = async () => {
    try {
      console.log("Testing connection...");
      const { testGraphQLSchema, testConnection } = await import("../../../../utilities/kozeoApi");
      const connected = await testConnection();
      console.log("Connection test:", connected);
      
      if (connected) {
        const schema = await testGraphQLSchema();
        console.log("Schema test result:", schema);
      }
      
      alert("Connection test completed! Check console for details.");
    } catch (error: any) {
      console.error("Connection test failed:", error);
      alert(`Connection test failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />
          <div className="flex flex-1">
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-center items-center py-20">
                <div className="text-gray-400">Loading profile...</div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
          <Sidebar />
          <div className="flex flex-1">
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="flex flex-col justify-center items-center py-20">
                <div className="text-red-400 mb-4">{error}</div>
                
                {/* Debug Panel - Only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-800 p-4 rounded-lg mt-4">
                    <h3 className="text-white mb-2">Debug Options</h3>
                    <div className="space-x-2">
                      <button
                        onClick={testGetUserByUsername}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Test getUserByUsername
                      </button>
                      <button
                        onClick={testConnection}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Test Connection
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Username: {username} | Check browser console for detailed logs
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return <div className="text-white">Loading...</div>;
  }

  // Calculate stats from the API data
  const totalEarnings = profile.wallet?.amount || 0;
  const avgRating = profile.rating || 0;

  return (
    <>
      <Header logoText="Kozeo" />
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        {/* Main Layout */}
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">User Profile</h2>

              {/* Profile Card */}
              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-6 shadow-md mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                  {/* Avatar */}
                  <ProfileImage
                    profilePic={profile.profile_Picture || ""}
                    username={profile.username}
                    size="lg"
                  />

                  {/* User Info */}
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center sm:justify-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl lg:text-2xl font-semibold text-white">
                          {profile.first_name} {profile.last_name} (@
                          {profile.username})
                        </h3>
                        {isOwnProfile && (
                          <button
                            onClick={() =>
                              router.push(`/profile/${username}/edit`)
                            }
                            className="ml-2 px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
                            type="button"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {/* Achievements beside username for lg+ screens */}
                      {profile.achievements &&
                        profile.achievements.length > 0 && (
                          <div className="hidden lg:flex flex-wrap gap-2 ml-4">
                            {profile.achievements.map((achievement, idx) => (
                              <a
                                key={idx}
                                href={achievement}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <img
                                  src={achievement}
                                  alt={`Achievement ${idx + 1}`}
                                  className="w-8 h-8 rounded-lg  hover:border-cyan-500 transition-colors object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      {profile.bio}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 lg:gap-4">
                      <span className="px-2 py-0.5 text-xs bg-neutral-800 border border-neutral-600 text-emerald-400 rounded-md">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Member since 2024
                      </span>
                    </div>
                    {/* Links */}
                    {profile.links && profile.links.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                        {profile.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-700 underline hover:text-cyan-300 transition"
                          >
                            {link
                              .replace(/^https?:\/\//, "")
                              .replace(/\/$/, "")}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Achievements Board for small screens */}
                {profile.achievements && profile.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-2 lg:hidden">
                    {profile.achievements.map((achievement, idx) => (
                      <a
                        key={idx}
                        href={achievement}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={achievement}
                          alt={`Achievement ${idx + 1}`}
                          className="w-12 h-12 rounded-lg  hover:border-cyan-500 transition-colors object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Stats Grid */}
            <div className="flex flex-col md:flex-row w-full justify-between gap-4 mb-8">
              {[
                {
                  count: profile.gigsHosted.length,
                  label: "Gigs Hosted",
                  color: "text-white",
                },
                {
                  count: avgRating.toFixed(1),
                  label: "Average Rating",
                  icon: (
                    <FiStar
                      className="text-yellow-400 text-sm"
                      fill="currentColor"
                    />
                  ),
                  color: "text-white",
                },
                {
                  count: profile.gigsCollaborated?.length || 0,
                  label: "Collaborations",
                  color: "text-white",
                },
                {
                  count: `${totalEarnings} ${profile.wallet?.currency || 'USD'}`,
                  label: "Wallet Balance",
                  extra: (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition text-sm font-semibold">
                      Withdraw
                    </button>
                  ),
                  color: "text-emerald-400",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 relative flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-5 shadow-md"
                >
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${item.color} mb-2 flex items-center justify-center gap-1`}
                    >
                      {item.count} {item.icon}
                    </div>
                    <div className="text-sm text-gray-300 mb-1">
                      {item.label}
                    </div>
                    {item.extra && <div className="mt-2">{item.extra}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Gigs Hosted Section */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-4 lg:p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiUsers className="text-cyan-400" />
                Gigs Hosted ({profile.gigsHosted.length})
              </h3>
              <div className="space-y-4">
                {profile.gigsHosted.map((gig, index) => (
                  <div
                    key={index}
                    className="border-l-1 border-cyan-700 pl-4 py-3  bg-opacity-10 rounded-r-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="text-white font-medium">{gig.title}</h4>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-sm text-yellow-400">
                          {gig.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {gig.description}
                    </p>
                    <div className="text-xs text-gray-400">
                      Looking for:{" "}
                      <span className="text-cyan-400">{gig.lookingFor}</span>
                    </div>
                    {gig.review && (
                      <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 bg-opacity-50 rounded-lg">
                        <div className="text-sm text-white font-medium mb-1">
                          "{gig.review.title}"
                        </div>
                        <div className="text-xs text-gray-300 mb-1">
                          {gig.review.description}
                        </div>
                        <div className="text-xs text-cyan-400">
                          - @{gig.review.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Collaborations Section */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-4 lg:p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Collaborations
              </h3>
              <div className="space-y-4">
                {(profile.collaboratedGigs || profile.gigsCollaborated || []).map((gig: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-1 border-purple-700 pl-4 py-3 bg-opacity-30 rounded-r-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="text-white font-medium">{gig.title}</h4>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-sm text-yellow-400">
                          {gig.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {gig.description}
                    </p>
                    {gig.review && (
                      <div className="mt-3 p-3 bg-neutral-900 border border-neutral-700 bg-opacity-50 rounded-lg">
                        <div className="text-sm text-white font-medium mb-1">
                          "{gig.review.title}"
                        </div>
                        <div className="text-xs text-gray-300 mb-1">
                          {gig.review.description}
                        </div>
                        <div className="text-xs text-purple-400">
                          - @{gig.review.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction History */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-4 lg:p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiDollarSign className="text-emerald-400" />
                Recent Transactions
              </h3>
              <div className="space-y-3">
                {(profile.transactions || []).slice(0, 5).map((transaction: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-neutral-800 bg-opacity-30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">
                        {transaction.gigTitle}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <FiCalendar className="text-xs" />
                        {new Date(
                          transaction.dateOfTransaction
                        ).toLocaleDateString()}
                        <span className="text-gray-500">
                          #{transaction.confirmationNumber}
                        </span>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-semibold self-start sm:self-center">
                      +{profile.wallet?.currency || 'USD'} {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previously Worked With */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-4 lg:p-6 shadow-md">
              <h3 className="text-lg font-semibold text-white mb-4">
                Previously Worked With
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(profile.previouslyWorkedWith || []).map((collaborator: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <ProfileImage
                        profilePic={collaborator.profilePic || ""}
                        username={collaborator.username}
                        size="md"
                      />
                    </div>
                    <div className="text-xs lg:text-sm text-gray-300 break-words">
                      @{collaborator.username}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
