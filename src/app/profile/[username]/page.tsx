"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import type { KeyboardEvent } from "react";
import TransactionModal from "@/components/common/TransactionModal";
import WithdrawalModal from "@/components/common/WithdrawalModal";
import { PageLoader } from "@/components/common/PageLoader";
import {
  FiStar,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiFilter,
  FiX,
  FiSearch,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import {
  getUserByUsername,
  getUserWallet,
} from "../../../../utilities/kozeoApi";
import { useUser } from "../../../../store/hooks";
import { isAuthenticated } from "../../../../utilities/api";
import { useTheme } from "@/contexts/ThemeContext";
import { identifyWebsite } from "../../../../utilities/helper";
import { getCurrencySymbol } from "@/utilities/currency";
import ImagePreviewModal from "@/components/common/ImagePreviewModal";

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

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
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
      className={`${sizeClasses[size]} bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm`}
    >
      {shouldShowImage && (
        <img
          src={profilePic}
          alt={`${username}'s profile`}
          className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            minWidth: "100%",
            minHeight: "100%",
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      {!shouldShowImage && (
        <FiUser className={`${iconSizeClasses[size]} text-gray-400`} />
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  // Decode the username parameter to handle special characters like @ in emails
  const username = decodeURIComponent(params.username as string);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [tempSelectedSkills, setTempSelectedSkills] = useState<string[]>([]);
  const [showSkillsFilter, setShowSkillsFilter] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [showAllHostedGigs, setShowAllHostedGigs] = useState(false);
  const [showAllCollaboratedGigs, setShowAllCollaboratedGigs] = useState(false);
  const [showAllOngoingProjects, setShowAllOngoingProjects] = useState(false);
  const [reviewImageModal, setReviewImageModal] = useState<string | null>(null);
  const [reviewImageUrl, setReviewImageUrl] = useState("");

  // Collapse state for sections
  const [isHostedSectionCollapsed, setIsHostedSectionCollapsed] =
    useState(false);
  const [
    isCollaborationsSectionCollapsed,
    setIsCollaborationsSectionCollapsed,
  ] = useState(false);
  const [isOngoingSectionCollapsed, setIsOngoingSectionCollapsed] =
    useState(false);

  // Wallet-related state
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [walletCurrency, setWalletCurrency] = useState<string>("INR"); // Default to INR

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

  const handleImageClick = (imageUrl: string) => {
  setReviewImageModal(imageUrl);
};

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
        // Check if it's specifically a "user not found" error
        if (
          err.message &&
          (err.message.includes("User not found") ||
            err.message.includes("not found"))
        ) {
          setError("User not found");
        } else {
          setError(err.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Fetch wallet data if user can view sensitive information
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!canViewSensitiveInfo || !profile?.id) return;

      try {
        setWalletLoading(true);
        // Use INR as default currency for initial API call
        const wallet = await getUserWallet(profile.id, "INR");
        setWalletData(wallet);

        // Update the wallet currency state with the actual currency from API
        if ((wallet as any)?.currency) {
          setWalletCurrency((wallet as any).currency);
          console.log("Wallet currency updated to:", (wallet as any).currency);
        }
      } catch (err: any) {
        console.error("Error fetching wallet data:", err);
        // Don't show error for wallet, just log it
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletData();
  }, [canViewSensitiveInfo, profile?.id]);

  // Initialize temp selected skills when profile loads
  useEffect(() => {
    setTempSelectedSkills(selectedSkills);
  }, [selectedSkills]);

  // Handle withdrawal function
  const handleWithdraw = async () => {
    if (!profile?.id || !walletData?.amount) {
      alert("No funds available for withdrawal");
      return;
    }

    // Open the withdrawal modal
    setShowWithdrawalModal(true);
  };

  // Extract all unique skills from user's gigs
  const allSkills = useMemo(() => {
    if (!profile) return [];

    const skillsSet = new Set<string>();

    // Extract skills from hosted gigs
    profile.gigsHosted.forEach((gig) => {
      if (gig.skills && Array.isArray(gig.skills)) {
        gig.skills.forEach((skill) => skillsSet.add(skill));
      }
    });

    // Extract skills from collaborated gigs
    profile.gigsCollaborated?.forEach((gig) => {
      if (gig.skills && Array.isArray(gig.skills)) {
        gig.skills.forEach((skill) => skillsSet.add(skill));
      }
    });

    return Array.from(skillsSet).sort();
  }, [profile]);

  // Filter skills based on search query
  const filteredSkills = useMemo(() => {
    if (!skillSearchQuery.trim()) return allSkills;

    return allSkills.filter((skill) =>
      skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
    );
  }, [allSkills, skillSearchQuery]);

  // Get all reviews from both hosted and collaborated gigs
  const allReviews = useMemo(() => {
    if (!profile) return [];

    const reviews: any[] = [];

    // Reviews from hosted gigs
    profile.gigsHosted.forEach((gig) => {
      if (gig.reviews && Array.isArray(gig.reviews)) {
        gig.reviews.forEach((review) => {
          reviews.push({
            ...review,
            gigTitle: gig.title,
            gigSkills: gig.skills || [],
            gigType: "hosted",
          });
        });
      }
    });

    // Reviews from collaborated gigs
    profile.gigsCollaborated?.forEach((gig) => {
      if (gig.reviews && Array.isArray(gig.reviews)) {
        gig.reviews.forEach((review) => {
          reviews.push({
            ...review,
            gigTitle: gig.title,
            gigSkills: gig.skills || [],
            gigType: "collaborated",
          });
        });
      }
    });

    return reviews;
  }, [profile]);

  // Filter reviews based on selected skills
  const filteredReviews = useMemo(() => {
    if (selectedSkills.length === 0) return allReviews;

    return allReviews.filter((review) => {
      return selectedSkills.some(
        (skill) => review.gigSkills && review.gigSkills.includes(skill)
      );
    });
  }, [allReviews, selectedSkills]);

  const handleSkillToggle = (skill: string) => {
    setTempSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const applySkillsFilter = () => {
    setSelectedSkills(tempSelectedSkills);
  };

  const clearSkillsFilter = () => {
    setSelectedSkills([]);
    setTempSelectedSkills([]);
    setSkillSearchQuery("");
  };

  const handleCloseSkillsFilter = () => {
    setShowSkillsFilter(false);
    // Reset search when closing modal
    setSkillSearchQuery("");
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSkillSearchQuery("");
    }
  };

  const toggleHostedGigs = () => {
    setShowAllHostedGigs((prev) => !prev);
  };

  const toggleCollaboratedGigs = () => {
    setShowAllCollaboratedGigs((prev) => !prev);
  };

  const toggleOngoingProjects = () => {
    setShowAllOngoingProjects((prev) => !prev);
  };

  // Filter hosted gigs based on selected skills and exclude gigs with no reviews
  const filteredHostedGigs = useMemo(() => {
    let gigs = profile?.gigsHosted || [];

    // Filter out gigs with no reviews
    gigs = gigs.filter((gig) => gig.reviews && gig.reviews.length > 0);

    // Apply skills filter if any skills are selected
    if (selectedSkills.length === 0) return gigs;

    return gigs.filter((gig) =>
      selectedSkills.some((skill) => gig.skills && gig.skills.includes(skill))
    );
  }, [profile?.gigsHosted, selectedSkills]);

  // Filter collaborated gigs based on selected skills and exclude gigs with no reviews
  const filteredCollaboratedGigs = useMemo(() => {
    let gigs = profile?.gigsCollaborated || [];

    // Filter out gigs with no reviews
    gigs = gigs.filter((gig) => gig.reviews && gig.reviews.length > 0);

    // Apply skills filter if any skills are selected
    if (selectedSkills.length === 0) return gigs;

    return gigs.filter((gig) =>
      selectedSkills.some((skill) => gig.skills && gig.skills.includes(skill))
    );
  }, [profile?.gigsCollaborated, selectedSkills]);

  // Filter ongoing projects (gigs with no reviews) based on selected skills
  const filteredOngoingProjects = useMemo(() => {
    // Combine both hosted and collaborated gigs
    const allGigs = [
      ...(profile?.gigsHosted || []).map((gig) => ({ ...gig, type: "hosted" })),
      ...(profile?.gigsCollaborated || []).map((gig) => ({
        ...gig,
        type: "collaborated",
      })),
    ];

    // Filter to only include gigs with no reviews
    let ongoingGigs = allGigs.filter(
      (gig) => !gig.reviews || gig.reviews.length === 0
    );

    // Apply skills filter if any skills are selected
    if (selectedSkills.length === 0) return ongoingGigs;

    return ongoingGigs.filter((gig) =>
      selectedSkills.some((skill) => gig.skills && gig.skills.includes(skill))
    );
  }, [profile?.gigsHosted, profile?.gigsCollaborated, selectedSkills]);

  // Display arrays that limit to 5 gigs when collapsed
  const displayedHostedGigs = useMemo(() => {
    return showAllHostedGigs
      ? filteredHostedGigs
      : filteredHostedGigs.slice(0, 5);
  }, [filteredHostedGigs, showAllHostedGigs]);

  const displayedCollaboratedGigs = useMemo(() => {
    return showAllCollaboratedGigs
      ? filteredCollaboratedGigs
      : filteredCollaboratedGigs.slice(0, 5);
  }, [filteredCollaboratedGigs, showAllCollaboratedGigs]);

  const displayedOngoingProjects = useMemo(() => {
    return showAllOngoingProjects
      ? filteredOngoingProjects
      : filteredOngoingProjects.slice(0, 5);
  }, [filteredOngoingProjects, showAllOngoingProjects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div
          className={`transition-colors duration-300 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl mb-6 animate-bounce">🤖</div>
          <h2
            className={`text-4xl font-bold mb-4 bg-gradient-to-r from-black via-black/80 to-black/60 dark:from-white dark:via-white/80 dark:to-white/60 bg-clip-text text-transparent ${
              theme === "dark" ? "drop-shadow-lg" : ""
            }`}
          >
            Oops! Profile not found
          </h2>
          <p
            className={`text-xl mb-6 font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Even our best developers can't find this page! 🕵️‍♂️
          </p>
          <p
            className={`text-lg mb-8 leading-relaxed ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            It seems this profile has mastered the ancient art of
            digital hide-and-seek. Maybe try refreshing, or check if
            you've got the right username? 🎭
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
               className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Try Again 🔄
            </button>
            <button
              onClick={() => router.push("/gigs")}
              className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-200 hover:scale-105 ${
                theme === "dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="text-white text-xl">No profile data available</div>
      </div>
    );
  }

  // Calculate stats from available data
  const totalEarnings = walletData?.amount || profile.wallet?.amount || 0;
  const avgRating = profile.rating || 0;

  return (
    <div className="flex-1 flex flex-col gap-8 items-stretch w-full max-w-8xl mx-auto py-8">
      {/* Profile Header */}
      <section className="premium-card p-6 md:p-8">
        <h2 className="premium-section-title">User Profile</h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
          <ProfileImage
            profilePic={profile.profile_Picture || ""}
            username={profile.username}
            size="lg"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="premium-section-title !mb-0">
                  {profile.first_name} {profile.last_name}
                </h3>
                {canViewSensitiveInfo && (
                  <button
                    onClick={() => router.push(`/profile/${username}/edit`)}
                    className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-all duration-300 shadow-sm"
                    type="button"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="hidden lg:flex flex-wrap gap-2 ml-6">
                  {profile.achievements.map((achievement) => (
                    <div key={achievement.id} className="inline-block" title={achievement.title}>
                      <img
                        src={achievement.icon}
                        alt={achievement.title}
                        className="w-8 h-8 rounded-lg hover:scale-110 transition-transform object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`text-lg font-medium mb-3 theme-transition ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              @{profile.username}
            </div>
            <p className={`text-sm mb-4 leading-relaxed max-w-2xl theme-transition ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
              {profile.bio}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs rounded-full font-bold tracking-widest uppercase border transition-all duration-300 ${theme === "light" ? "bg-black/5 border-black/10 text-black/40" : "bg-white/5 border-white/10 text-white/40"}`}>
                Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="premium-card p-6 md:p-8">
        <h2 className="premium-section-title">Kozeo Ledger</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Total Earnings</div>
            <div className="text-2xl font-bold">{getCurrencySymbol(walletCurrency)} {totalEarnings.toLocaleString()}</div>
            {canViewSensitiveInfo && (
              <button onClick={() => setShowWithdrawalModal(true)} className="mt-4 w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
                Claim Rewards
              </button>
            )}
          </div>
          <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Gig Rating</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="flex text-black/10 dark:text-white/10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} className={s <= Math.round(avgRating) ? "text-stone-400 fill-stone-400" : ""} />
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Projects Hosted</div>
            <div className="text-2xl font-bold">{profile.gigsHosted.length || 0}</div>
          </div>
          <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Collaborations</div>
            <div className="text-2xl font-bold">{profile.gigsCollaborated?.length || 0}</div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 mt-12 pb-20">
        <div className="flex-1 space-y-12">
          {/* Projects Hosted Section */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="premium-section-title !mb-0 flex items-center gap-3">
                <FiUsers className="opacity-40" />
                Projects Hosted ({filteredHostedGigs.length})
              </h3>
              <button
                onClick={() => setIsHostedSectionCollapsed(!isHostedSectionCollapsed)}
                className="p-2 rounded-lg opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                {isHostedSectionCollapsed ? <FiChevronDown /> : <FiChevronUp />}
              </button>
            </div>
            {!isHostedSectionCollapsed && (
              <div className="space-y-6">
                {filteredHostedGigs.length === 0 ? (
                  <div className="text-center py-12 opacity-40">
                    <FiUsers className="text-4xl mx-auto mb-3" />
                    <div className="text-sm">No hosted projects matching filters.</div>
                  </div>
                ) : (
                  displayedHostedGigs.map((gig, index) => (
                    <div key={index} className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h4 className="text-lg font-bold tracking-tight">{gig.title}</h4>
                        <div className="flex items-center gap-1 opacity-60">
                          <FiStar className="text-stone-400" />
                          <span className="text-sm font-bold">
                            {gig.reviews?.length > 0
                              ? (gig.reviews.reduce((s: number, r: any) => s + r.rating, 0) / gig.reviews.length).toFixed(1)
                              : "N/A"
                            }
                          </span>
                        </div>
                      </div>
                      <p className="text-sm opacity-60 mb-4 leading-relaxed">{gig.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {gig.skills?.map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="premium-glass px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {gig.reviews?.[0] && (
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 italic text-sm opacity-60">
                          \"{gig.reviews[0].description}\"
                          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                            — @{gig.reviews[0].author?.username}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {filteredHostedGigs.length > 5 && (
                  <div className="mt-6 flex justify-center">
                    <button onClick={toggleHostedGigs} className="px-6 py-2 text-xs font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                      {showAllHostedGigs ? "Show Less" : "Load More"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Collaborations Section */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="premium-section-title !mb-0 flex items-center gap-3">
                <FiUsers className="opacity-40" />
                Collaborations ({filteredCollaboratedGigs.length})
              </h3>
            </div>
            <div className="space-y-6">
              {filteredCollaboratedGigs.length === 0 ? (
                <div className="text-center py-12 opacity-40">
                  <FiUsers className="text-4xl mx-auto mb-3" />
                  <div className="text-sm">No collaborations matching filters.</div>
                </div>
              ) : (
                displayedCollaboratedGigs.map((gig: any, index: number) => (
                  <div key={index} className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h4 className="text-lg font-bold tracking-tight">{gig.title}</h4>
                      <div className="flex items-center gap-1 opacity-60">
                        <FiStar className="text-stone-400" />
                        <span className="text-sm font-bold">
                          {gig.reviews?.length > 0
                            ? (gig.reviews.reduce((s: number, r: any) => s + r.rating, 0) / gig.reviews.length).toFixed(1)
                            : "N/A"
                          }
                        </span>
                      </div>
                    </div>
                    <p className="text-sm opacity-60 mb-4 leading-relaxed">{gig.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {gig.skills?.map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="premium-glass px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Ongoing Projects Section */}
          <section className="premium-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="premium-section-title !mb-0 flex items-center gap-3">
                <FiCalendar className="opacity-40" />
                Ongoing Projects ({filteredOngoingProjects.length})
              </h3>
            </div>
            <div className="space-y-6">
              {filteredOngoingProjects.length === 0 ? (
                <div className="text-center py-12 opacity-40">
                  <FiCalendar className="text-4xl mx-auto mb-3" />
                  <div className="text-sm">No active projects.</div>
                </div>
              ) : (
                displayedOngoingProjects.map((gig: any, index: number) => (
                  <div key={index} className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold tracking-tight">{gig.title}</h4>
                      <div className="px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest">
                        In Progress
                      </div>
                    </div>
                    <p className="text-sm opacity-60 mb-4">{gig.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold opacity-40 uppercase tracking-widest">
                        {gig.amount === 0 ? "Skill Forge" : `${gig.currency} ${gig.amount?.toLocaleString()}`}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        {gig.type === "hosted" ? "Hosting" : "Collaborating"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sticky Sidebar */}
        <aside className="hidden lg:block w-80 xl:w-96">
          <div className="sticky top-24">
            <section className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold tracking-widest uppercase opacity-40 flex items-center gap-2">
                  <FiFilter /> Skill Filter
                </h3>
                {selectedSkills.length > 0 && (
                  <button onClick={clearSkillsFilter} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1">
                    <FiX /> Clear
                  </button>
                )}
              </div>
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-40" />
                  <input
                    type="text"
                    placeholder="SEARCH SKILLS..."
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-all placeholder:opacity-20"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSkills.map((skill) => {
                  const isSelected = tempSelectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                          : "bg-transparent border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">{skill}</span>
                      {isSelected && <div className="w-1 h-1 rounded-full bg-white dark:bg-black" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={applySkillsFilter}
                disabled={tempSelectedSkills.length === 0 && selectedSkills.length === 0}
                className="w-full mt-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-20"
              >
                Apply Filter
              </button>
            </section>
          </div>
        </aside>
      </div>

      <ImagePreviewModal
        imgUrl={reviewImageModal}
        onClose={() => setReviewImageModal(null)}
        title="Review Image"
        altText="Customer review image"
        showActions={true}
      />

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        walletData={walletData}
        currency={walletCurrency}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        walletAmount={totalEarnings}
        currency={walletCurrency}
        getCurrencySymbol={getCurrencySymbol}
        onWithdrawSuccess={async () => {
          if (profile?.id) {
            try {
              const wallet = await getUserWallet(profile.id, walletCurrency);
              setWalletData(wallet);
            } catch (err) {
              console.error("Error refreshing wallet data:", err);
            }
          }
        }}
      />
    </div>
  );
}
