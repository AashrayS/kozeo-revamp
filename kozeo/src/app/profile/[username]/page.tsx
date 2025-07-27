"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { FiStar, FiCalendar, FiDollarSign, FiUsers } from "react-icons/fi";
import { getUserByUsername } from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";
import { isAuthenticated } from "../../../../utilities/api";
import { useTheme } from "@/contexts/ThemeContext";

interface ProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_Picture: string;
  bio: string;
  links: string[];
  rating: number;
  role: string;
  phone?: string;
  country_Code?: string;
  resume?: string;
  wallet?: {
    amount: number;
    currency: string;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
  }[];
  gigsHosted: {
    id: string;
    title: string;
    looking_For: string;
    description: string;
    skills: string[];
    currency: string;
    amount: number;
    isActive: boolean;
    host: any;
    guest: any;
    reviews: any[];
  }[];
  gigsCollaborated: {
    id: string;
    title: string;
    looking_For: string;
    description: string;
    skills: string[];
    currency: string;
    amount: number;
    isActive: boolean;
    host: any;
    guest: any;
    reviews: any[];
  }[];
  workedWith: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_Picture: string;
    rating: number;
  }[];
  reviewsGiven: {
    id: string;
    title: string;
    description: string;
    rating: number;
    receiver: any;
    gig: any;
    createdAt: string;
  }[];
  activeGig?: {
    id: string;
    title: string;
    status: string;
    amount: number;
    currency: string;
  };
  requestSent: {
    id: string;
    gigId: string;
    status: string;
    createdAt: string;
  }[];
  notifications: {
    id: string;
    type: string;
    content: string;
    action: string;
    read: boolean;
    createdAt: string;
    sender: any;
  }[];
  unreadNotificationCount: number;
  createdAt: string;
  updatedAt: string;
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
          className={`w-full h-full object-cover ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <span
        className={`text-white ${textSizeClasses[size]} font-bold ${
          shouldShowImage && imageLoaded ? "absolute opacity-0" : "flex"
        } items-center justify-center w-full h-full`}
      >
        {getInitials(username)}
      </span>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  // Decode the username parameter to handle special characters like @ in emails
  const username = decodeURIComponent(params.username as string);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get current user data for authentication checks
  const { user: currentUser, isAuthenticated: userLoggedIn } = useUser();

  // Check if user is viewing their own profile
  const isOwnProfile = userLoggedIn && currentUser?.username === username;
  const canViewSensitiveInfo = isOwnProfile;

  console.log("Profile access check:", {
    username,
    currentUser: currentUser?.username,
    isOwnProfile,
    userLoggedIn,
    canViewSensitiveInfo,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching profile for username:", username);
        const userData = await getUserByUsername(username);

        if (userData) {
          setProfile(userData as ProfileData);
        } else {
          setError("User not found");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <div className="flex flex-1">
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-center items-center py-20">
                <div
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading profile...
                </div>
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
        <div
          className={`min-h-screen relative z-10 flex flex-row ${
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
              : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
          }`}
        >
          <Sidebar />
          <div className="flex flex-1">
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-center items-center py-20">
                <div className="text-red-400">{error}</div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return <div className="text-white">No profile data available</div>;
  }

  // Calculate stats from available data
  const totalEarnings = profile.wallet?.amount || 0;
  const avgRating = profile.rating || 0;

  return (
    <>
      <Header logoText="Kozeo" />
      {/* Glows - only show in dark mode */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        </>
      )}
      <div
        className={`min-h-screen relative z-10 flex flex-row ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
        }`}
      >
        {/* Main Layout */}
        <Sidebar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="mb-8">
              <h2
                className={`text-2xl font-bold mb-6 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                User Profile
              </h2>

              {/* Profile Card */}
              <div
                className={`relative flex flex-col justify-between rounded-lg p-6 shadow-md mb-6 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#111] to-[#1a1a1a]"
                    : "bg-white/90 border border-gray-200 shadow-lg"
                }`}
              >
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
                        <h3
                          className={`text-xl lg:text-2xl font-semibold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {profile.first_name} {profile.last_name} (@
                          {profile.username})
                        </h3>
                        {canViewSensitiveInfo && (
                          <ProfessionalButton
                            onClick={() =>
                              router.push(`/profile/${username}/edit`)
                            }
                            variant="primary"
                            size="sm"
                            className="ml-2 text-xs"
                          >
                            Edit
                          </ProfessionalButton>
                        )}
                      </div>
                      {/* Achievements beside username for lg+ screens */}
                      {profile.achievements &&
                        profile.achievements.length > 0 && (
                          <div className="hidden lg:flex flex-wrap gap-2 ml-4">
                            {profile.achievements.map((achievement, idx) => (
                              <div
                                key={achievement.id}
                                className="inline-block"
                                title={achievement.title}
                              >
                                <img
                                  src={achievement.icon}
                                  alt={achievement.title}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    <p
                      className={`text-sm mb-3 leading-relaxed ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {profile.bio}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 lg:gap-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-md text-emerald-400 ${
                          theme === "dark"
                            ? "bg-neutral-800 border border-neutral-600"
                            : "bg-emerald-50 border border-emerald-200"
                        }`}
                      >
                        Active
                      </span>
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
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
                            className="text-xs text-cyan-700 underline"
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
                      <div
                        key={achievement.id}
                        className="inline-block"
                        title={achievement.title}
                      >
                        <img
                          src={achievement.icon}
                          alt={achievement.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice for non-owners */}
            {!canViewSensitiveInfo && userLoggedIn && (
              <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
                <p className="text-sm text-blue-300">
                  <FiUsers className="inline mr-2" />
                  You are viewing {profile.first_name}'s public profile. Some
                  information like wallet details are private.
                </p>
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!userLoggedIn && (
              <div className="mb-6 p-4 bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg">
                <p className="text-sm text-amber-300">
                  <FiUsers className="inline mr-2" />
                  <ProfessionalButton
                    onClick={() => router.push("/login")}
                    variant="neutral"
                    size="sm"
                    className="underline hover:text-amber-100 transition text-sm inline-block bg-transparent border-none shadow-none p-0"
                  >
                    Login
                  </ProfessionalButton>{" "}
                  to view more details and interact with this profile.
                </p>
              </div>
            )}

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

                // Only show wallet info if user can view sensitive information
                ...(canViewSensitiveInfo
                  ? [
                      {
                        count: `${totalEarnings} ${
                          profile.wallet?.currency || "USD"
                        }`,
                        label: "Wallet Balance",
                        extra: (
                          <ProfessionalButton
                            onClick={() => {
                              // Add withdraw functionality here
                              console.log("Withdraw clicked");
                            }}
                            variant="primary"
                            size="sm"
                            className="text-sm font-semibold"
                          >
                            Withdraw
                          </ProfessionalButton>
                        ),
                        color: "text-emerald-400",
                      },
                    ]
                  : []),
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex-1 relative flex flex-col md:flex-row items-center justify-center rounded-lg p-5 shadow-md ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-[#111] to-[#1a1a1a]"
                      : "bg-white/90 border border-gray-200 shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${item.color} mb-2 flex items-center justify-center gap-1`}
                    >
                      {item.count} {item.icon}
                    </div>
                    <div
                      className={`text-sm mb-1 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </div>
                    {item.extra && <div className="mt-2">{item.extra}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Gigs Hosted Section */}
            <div
              className={`relative flex flex-col justify-between rounded-lg p-4 lg:p-6 shadow-md mb-6 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[#111] to-[#1a1a1a]"
                  : "bg-white/90 border border-gray-200 shadow-lg"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                <FiUsers className="text-cyan-400" />
                Gigs Hosted ({profile.gigsHosted.length})
              </h3>{" "}
              <div className="space-y-4">
                {profile.gigsHosted.map((gig, index) => (
                  <div
                    key={index}
                    className={`border-l-1 border-cyan-700 pl-4 py-3 bg-opacity-10 rounded-r-lg ${
                      theme === "dark" ? "" : "bg-cyan-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {gig.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-sm text-yellow-400">
                          {gig.reviews && gig.reviews.length > 0
                            ? (
                                gig.reviews.reduce(
                                  (sum: number, review: any) =>
                                    sum + review.rating,
                                  0
                                ) / gig.reviews.length
                              ).toFixed(1)
                            : "No rating"}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {gig.description}
                    </p>
                    <div
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Looking for:{" "}
                      <span className="text-cyan-400">{gig.looking_For}</span>
                    </div>
                    {gig.reviews && gig.reviews.length > 0 && (
                      <div
                        className={`mt-3 p-3 border rounded-lg bg-opacity-50 transition-colors duration-300 ${
                          theme === "dark"
                            ? "bg-neutral-900 border-neutral-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          "{gig.reviews[0].title}"
                        </div>
                        <div
                          className={`text-xs mb-1 transition-colors duration-300 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {gig.reviews[0].description}
                        </div>
                        <div className="text-xs text-cyan-400">
                          - @{gig.reviews[0].author?.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Collaborations Section */}
            <div
              className={`relative flex flex-col justify-between rounded-lg p-4 lg:p-6 shadow-md mb-6 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[#111] to-[#1a1a1a]"
                  : "bg-white/90 border border-gray-200 shadow-lg"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                <FiUsers className="text-purple-400" />
                Collaborations ({profile.gigsCollaborated?.length || 0})
              </h3>
              <div className="space-y-4">
                {(profile.gigsCollaborated || []).map(
                  (gig: any, index: number) => (
                    <div
                      key={index}
                      className={`border-l-1 border-purple-700 pl-4 py-3 bg-opacity-10 rounded-r-lg ${
                        theme === "dark" ? "" : "bg-purple-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h4
                          className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {gig.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <FiStar
                            className="text-yellow-400 text-sm"
                            fill="currentColor"
                          />
                          <span className="text-sm text-yellow-400">
                            {gig.reviews && gig.reviews.length > 0
                              ? (
                                  gig.reviews.reduce(
                                    (sum: number, review: any) =>
                                      sum + review.rating,
                                    0
                                  ) / gig.reviews.length
                                ).toFixed(1)
                              : "No rating"}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {gig.description}
                      </p>
                      <div
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Looking for:{" "}
                        <span className="text-purple-400">
                          {gig.looking_For}
                        </span>
                      </div>
                      {gig.reviews && gig.reviews.length > 0 && (
                        <div
                          className={`mt-3 p-3 border rounded-lg bg-opacity-50 ${
                            theme === "dark"
                              ? "bg-neutral-900 border-neutral-700"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            "{gig.reviews[0].title}"
                          </div>
                          <div
                            className={`text-xs mb-1 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            {gig.reviews[0].description}
                          </div>
                          <div className="text-xs text-purple-400">
                            - @{gig.reviews[0].author?.username}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {/* <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-4 lg:p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiStar className="text-yellow-400" />
                Reviews Given ({profile.reviewsGiven?.length || 0})
              </h3>
              <div className="space-y-3">
                {(profile.reviewsGiven || [])
                  .slice(0, 5)
                  .map((review: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-neutral-800 bg-opacity-30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">
                          {review.title || "Review"}
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          {review.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-yellow-400 font-semibold">
                          {review.rating || 0}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div> */}
          </main>
        </div>
      </div>
    </>
  );
}
