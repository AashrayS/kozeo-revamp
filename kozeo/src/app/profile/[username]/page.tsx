"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import type { KeyboardEvent } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import TransactionModal from "@/components/common/TransactionModal";
import WithdrawalModal from "@/components/common/WithdrawalModal";
import {
  FiStar,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiFilter,
  FiX,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import {
  getUserByUsername,
  getUserWallet,
} from "../../../../utilities/kozeoApi";
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

  // Filter hosted gigs based on selected skills
  const filteredHostedGigs = useMemo(() => {
    if (selectedSkills.length === 0) return profile?.gigsHosted || [];

    return (profile?.gigsHosted || []).filter((gig) =>
      selectedSkills.some((skill) => gig.skills && gig.skills.includes(skill))
    );
  }, [profile?.gigsHosted, selectedSkills]);

  // Filter collaborated gigs based on selected skills
  const filteredCollaboratedGigs = useMemo(() => {
    if (selectedSkills.length === 0) return profile?.gigsCollaborated || [];

    return (profile?.gigsCollaborated || []).filter((gig) =>
      selectedSkills.some((skill) => gig.skills && gig.skills.includes(skill))
    );
  }, [profile?.gigsCollaborated, selectedSkills]);

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

  if (loading) {
    return (
      <>
        <Header logoText="Kozeo" />
        <div
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
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
                  className={`transition-colors duration-300 ${
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
          className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
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
  const totalEarnings = walletData?.amount || profile.wallet?.amount || 0;
  const avgRating = profile.rating || 0;

  // Function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      INR: "₹",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      SEK: "kr",
      NOK: "kr",
      MXN: "$",
      BRL: "R$",
      RUB: "₽",
      KRW: "₩",
      SGD: "S$",
      HKD: "HK$",
      NZD: "NZ$",
      TRY: "₺",
      ZAR: "R",
      PLN: "zł",
      CZK: "Kč",
      HUF: "Ft",
      ILS: "₪",
      CLP: "$",
      PHP: "₱",
      AED: "د.إ",
      SAR: "﷼",
      THB: "฿",
      MYR: "RM",
      IDR: "Rp",
      VND: "₫",
      EGP: "£",
      MAD: "د.م.",
      NGN: "₦",
      KES: "KSh",
      GHS: "GH₵",
      UGX: "USh",
      TZS: "TSh",
      ZMW: "ZK",
      BWP: "P",
      MWK: "MK",
      RWF: "RF",
      ETB: "Br",
      DZD: "د.ج",
      TND: "د.ت",
      LYD: "ل.د",
      SDG: "ج.س.",
      SSP: "£",
      SOS: "S",
      DJF: "Fdj",
      ERN: "Nfk",
      MRU: "UM",
      CVE: "$",
      SLL: "Le",
      LRD: "L$",
      GNF: "FG",
      SEN: "F",
      GMD: "D",
      GWP: "P",
      XOF: "F",
      XAF: "F",
      KMF: "CF",
      MGA: "Ar",
      MUR: "₨",
      SCR: "₨",
      MVR: ".ރ",
      NPR: "₨",
      BTN: "Nu.",
      LKR: "₨",
      BDT: "৳",
      MMK: "K",
      LAK: "₭",
      KHR: "៛",
      BND: "B$",
      TWD: "NT$",
      MNT: "₮",
      KZT: "₸",
      UZS: "лв",
      KGS: "лв",
      TJS: "SM",
      TMT: "T",
      AFN: "؋",
      PKR: "₨",
      IRR: "﷼",
      IQD: "ع.د",
      SYP: "£",
      LBP: "ل.ل",
      JOD: "د.ا",
      KWD: "د.ك",
      BHD: ".د.ب",
      QAR: "ر.ق",
      OMR: "ر.ع.",
      YER: "﷼",
      GEL: "₾",
      AMD: "֏",
      AZN: "₼",
      BAM: "KM",
      BGN: "лв",
      HRK: "kn",
      RSD: "дин",
      MKD: "ден",
      MDL: "L",
      RON: "lei",
      UAH: "₴",
      BYN: "Br",
      LTL: "Lt",
      LVL: "Ls",
      EEK: "kr",
      ISK: "kr",
      DKK: "kr",
      CRC: "₡",
      GTQ: "Q",
      HNL: "L",
      NIO: "C$",
      PAB: "B/.",
      PEN: "S/.",
      PYG: "Gs",
      UYU: "$U",
      VES: "Bs",
      BOB: "$b",
      COP: "$",
      ECU: "$",
      GYD: "$",
      SRD: "$",
      TTD: "TT$",
      BBD: "Bds$",
      BMD: "$",
      BSD: "$",
      BZD: "BZ$",
      KYD: "$",
      JMD: "J$",
      AWG: "ƒ",
      ANG: "ƒ",
      SVC: "$",
      DOP: "RD$",
      HTG: "G",
      CUP: "₱",
      CUC: "$",
      XCD: "$",
      FJD: "$",
      PGK: "K",
      SBD: "$",
      TOP: "T$",
      VUV: "VT",
      WST: "WS$",
      XPF: "₣",
      NCR: "₣",
      AOA: "Kz",
      CDF: "FC",
      // XAF: "FCFA",
      // XOF: "CFA",
      BIF: "FBu",
      // KMF: "CF",
      // MGA: "Ar",
      // MUR: "₨",
      // MWK: "MK",
      MZN: "MT",
      // RWF: "R₣",
      // SCR: "₨",
      STN: "Db",
      SZL: "E",
      // TZS: "TSh",
      // UGX: "USh",
      // ZMW: "ZK",
      ZWL: "Z$",
    };
    return currencySymbols[currency.toUpperCase()] || currency;
  };

  return (
    <>
      <Header logoText="Kozeo" />
      {/* Glows */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div
        className={`min-h-screen relative z-10 flex flex-row theme-transition ${
          theme === "light"
            ? "bg-gradient-light text-gray-900"
            : "bg-gradient-dark text-white"
        }`}
      >
        {/* Main Layout */}
        <Sidebar />
        <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-8 gap-0 lg:gap-8 justify-center items-start">
          {/* Main Content */}
          <main className="flex-1 flex flex-col gap-8 items-stretch justify-center w-full max-w-8xl px-4 sm:px-6 lg:pr-10 mx-auto py-8">
            {/* Profile Header */}
            <section
              className={`rounded-2xl sm:rounded-3xl p-6 md:p-8 border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <h2
                className={`text-3xl md:text-4xl font-light tracking-tight mb-8 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                User Profile
              </h2>

              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                {/* Avatar */}
                <ProfileImage
                  profilePic={profile.profile_Picture || ""}
                  username={profile.username}
                  size="lg"
                />

                {/* User Info */}
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center sm:justify-start gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-2xl lg:text-3xl font-light tracking-tight theme-transition ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {profile.first_name} {profile.last_name}
                      </h3>
                      {canViewSensitiveInfo && (
                        <button
                          onClick={() =>
                            router.push(`/profile/${username}/edit`)
                          }
                          className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-200"
                          type="button"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                    {/* Achievements beside username for lg+ screens */}
                    {profile.achievements &&
                      profile.achievements.length > 0 && (
                        <div className="hidden lg:flex flex-wrap gap-2 ml-6">
                          {profile.achievements.map((achievement, idx) => (
                            <div
                              key={achievement.id}
                              className="inline-block"
                              title={achievement.title}
                            >
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

                  <div
                    className={`text-lg font-medium mb-3 theme-transition ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    @{profile.username}
                  </div>

                  <p
                    className={`text-sm mb-4 leading-relaxed max-w-2xl theme-transition ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    {profile.bio}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium border theme-transition ${
                        theme === "light"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-green-950/50 border-green-800/50 text-green-300"
                      }`}
                    >
                      Active
                    </span>
                    <span
                      className={`text-sm theme-transition ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Member since 2024
                    </span>
                  </div>

                  {/* Links */}
                  {profile.links && profile.links.length > 0 && (
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      {profile.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm hover:scale-105 transition-all duration-200 theme-transition ${
                            theme === "light"
                              ? "text-cyan-600 hover:text-cyan-700"
                              : "text-cyan-400 hover:text-cyan-300"
                          }`}
                        >
                          {link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements Board for small screens */}
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-8 lg:hidden">
                  {profile.achievements.map((achievement, idx) => (
                    <div
                      key={achievement.id}
                      className="inline-block"
                      title={achievement.title}
                    >
                      <img
                        src={achievement.icon}
                        alt={achievement.title}
                        className="w-12 h-12 rounded-lg hover:scale-110 transition-transform object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Privacy Notice for non-owners */}
            {!canViewSensitiveInfo && userLoggedIn && (
              <section
                className={`rounded-2xl p-4 md:p-6 border backdrop-blur-md theme-transition ${
                  theme === "light"
                    ? "bg-blue-50/80 border-blue-200/50 text-blue-700"
                    : "bg-blue-950/30 border-blue-800/50 text-blue-300"
                }`}
              >
                <p className="text-sm flex items-center gap-2">
                  <FiUsers className="text-base" />
                  You are viewing {profile.first_name}'s public profile. Some
                  information like wallet details are private.
                </p>
              </section>
            )}

            {/* Login prompt for non-authenticated users */}
            {!userLoggedIn && (
              <section
                className={`rounded-2xl p-4 md:p-6 border backdrop-blur-md theme-transition ${
                  theme === "light"
                    ? "bg-amber-50/80 border-amber-200/50 text-amber-700"
                    : "bg-amber-950/30 border-amber-800/50 text-amber-300"
                }`}
              >
                <p className="text-sm flex items-center gap-2">
                  <FiUsers className="text-base" />
                  <button
                    onClick={() => router.push("/login")}
                    className="underline hover:opacity-80 transition"
                  >
                    Login
                  </button>{" "}
                  to view more details and interact with this profile.
                </p>
              </section>
            )}

            {/* Profile Stats Grid */}
            <section
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                theme === "light"
                  ? "bg-white/95 border-gray-200"
                  : "bg-neutral-900/80 border-neutral-800"
              }`}
            >
              {/* Section Header */}
              <div className="mb-6 sm:mb-8">
                <h3
                  className={`text-xl sm:text-2xl font-light tracking-tight mb-2 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Performance Overview
                </h3>
                <p
                  className={`text-xs sm:text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Key metrics and achievements
                </p>
              </div>

              {/* Stats Grid - Mobile-first responsive design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[
                  {
                    count: profile.gigsHosted.length,
                    label: "Gigs Hosted",
                    color: "text-cyan-400",
                    bgGradient:
                      theme === "light"
                        ? "from-cyan-50 via-blue-50 to-indigo-50"
                        : "from-cyan-950/50 via-blue-950/50 to-indigo-950/50",
                    borderGradient:
                      theme === "light"
                        ? "from-cyan-200 to-blue-200"
                        : "from-cyan-800/50 to-blue-800/50",
                    iconBg:
                      theme === "light"
                        ? "bg-gradient-to-br from-cyan-100 to-blue-100"
                        : "bg-gradient-to-br from-cyan-900/50 to-blue-900/50",
                    icon: <FiUsers className="text-lg text-cyan-400" />,
                    shadowColor: "hover:shadow-cyan-200/50",
                  },
                  {
                    count: avgRating.toFixed(1),
                    label: "Average Rating",
                    color: "text-yellow-400",
                    bgGradient:
                      theme === "light"
                        ? "from-yellow-50 via-orange-50 to-amber-50"
                        : "from-yellow-950/50 via-orange-950/50 to-amber-950/50",
                    borderGradient:
                      theme === "light"
                        ? "from-yellow-200 to-orange-200"
                        : "from-yellow-800/50 to-orange-800/50",
                    iconBg:
                      theme === "light"
                        ? "bg-gradient-to-br from-yellow-100 to-orange-100"
                        : "bg-gradient-to-br from-yellow-900/50 to-orange-900/50",
                    icon: (
                      <FiStar
                        className="text-lg text-yellow-400"
                        fill="currentColor"
                      />
                    ),
                    suffix: avgRating > 0 ? "/5.0" : "",
                    shadowColor: "hover:shadow-yellow-200/50",
                  },
                  {
                    count: profile.gigsCollaborated?.length || 0,
                    label: "Collaborations",
                    color: "text-purple-400",
                    bgGradient:
                      theme === "light"
                        ? "from-purple-50 via-violet-50 to-indigo-50"
                        : "from-purple-950/50 via-violet-950/50 to-indigo-950/50",
                    borderGradient:
                      theme === "light"
                        ? "from-purple-200 to-violet-200"
                        : "from-purple-800/50 to-violet-800/50",
                    iconBg:
                      theme === "light"
                        ? "bg-gradient-to-br from-purple-100 to-violet-100"
                        : "bg-gradient-to-br from-purple-900/50 to-violet-900/50 ",
                    icon: <FiUsers className="text-lg text-purple-400" />,
                    shadowColor: "hover:shadow-purple-200/50",
                  },

                  // Only show wallet info if user can view sensitive information
                  ...(canViewSensitiveInfo
                    ? [
                        {
                          count: walletLoading
                            ? "..."
                            : `${getCurrencySymbol(
                                walletCurrency
                              )}${totalEarnings}`,
                          label: "Earning",
                          color: "text-emerald-400",
                          bgGradient:
                            theme === "light"
                              ? "from-emerald-50 via-green-50 to-teal-50"
                              : "from-emerald-950/50 via-green-950/50 to-teal-950/50",
                          borderGradient:
                            theme === "light"
                              ? "from-emerald-200 to-green-200"
                              : "from-emerald-800/50 to-green-800/50",
                          iconBg:
                            theme === "light"
                              ? "bg-gradient-to-br from-emerald-100 to-green-100"
                              : "bg-gradient-to-br from-emerald-900/50 to-green-900/50",
                          icon: (
                            <FiDollarSign className="text-lg text-emerald-400" />
                          ),
                          isWallet: true,
                          shadowColor: "hover:shadow-emerald-200/50",
                        },
                      ]
                    : []),
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${
                      item.bgGradient
                    } border-0 bg-clip-padding theme-transition cursor-pointer ${
                      theme === "light"
                        ? "sm:shadow-sm hover:shadow-md backdrop-blur-sm"
                        : "sm:shadow-sm hover:shadow-lg backdrop-blur-sm"
                    }`}
                    style={{
                      backgroundImage:
                        theme === "light"
                          ? `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%), linear-gradient(to bottom right, var(--tw-gradient-stops))`
                          : `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%), linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      transform: "perspective(1000px)",
                      transition:
                        "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      border:
                        theme === "light"
                          ? "1px solid rgba(229, 231, 235, 0.6)"
                          : "1px solid rgba(55, 65, 81, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        theme === "light"
                          ? `0 12px 25px -8px ${
                              item.shadowColor
                                ?.replace("hover:", "")
                                .replace("/50", "/20") || "rgba(0,0,0,0.08)"
                            }, 0 0 0 1px rgba(255,255,255,0.05)`
                          : "0 12px 25px -8px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";
                      e.currentTarget.style.boxShadow =
                        theme === "light"
                          ? "0 4px 12px -3px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)"
                          : "0 4px 12px -3px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    {/* Professional Gradient Border with Glow */}
                    <div
                      className={`absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r ${item.borderGradient} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                      style={{
                        background: `linear-gradient(135deg, ${
                          item.borderGradient.includes("cyan")
                            ? "rgba(6, 182, 212, 0.3)"
                            : item.borderGradient.includes("yellow")
                            ? "rgba(245, 158, 11, 0.3)"
                            : item.borderGradient.includes("purple")
                            ? "rgba(147, 51, 234, 0.3)"
                            : "rgba(16, 185, 129, 0.3)"
                        } 0%, transparent 100%)`,
                        filter: "blur(0.5px)",
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-2xl bg-gradient-to-br ${item.bgGradient}`}
                      ></div>
                    </div>

                    {/* Subtle Shimmer Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{
                          transform: "translateX(-100%)",
                          animation: "shimmer 2s ease-in-out infinite",
                        }}
                      ></div>
                    </div>

                    {/* Enhanced Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]"></div>
                      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.1)_60deg,transparent_120deg)]"></div>
                    </div>

                    {/* Content with Enhanced Typography - Mobile Optimized */}
                    <div className="relative p-4 sm:p-5 group-hover:translate-y-[-2px] transition-transform duration-400">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1">
                          <div
                            className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${item.color} mb-1 flex items-baseline gap-1 group-hover:scale-105 transition-transform duration-300`}
                          >
                            {item.count}
                            {item.suffix && (
                              <span
                                className={`text-xs sm:text-sm font-normal transition-colors duration-300 ${
                                  theme === "light"
                                    ? "text-gray-400 group-hover:text-gray-500"
                                    : "text-gray-500 group-hover:text-gray-400"
                                }`}
                              >
                                {item.suffix}
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-xs font-semibold tracking-wide uppercase theme-transition group-hover:opacity-80 ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {item.label}
                          </h4>
                        </div>
                        <div
                          className={`p-2 sm:p-3 rounded-xl ${item.iconBg} backdrop-blur-sm sm:shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}
                        >
                          <div className="sm:group-hover:drop-shadow-lg transition-all duration-300">
                            {item.icon}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Wallet Actions - Mobile Optimized */}
                      {item.isWallet && (
                        <div className="space-y-2 sm:space-y-3 group-hover:translate-y-[-1px] transition-transform duration-300">
                          <button
                            onClick={handleWithdraw}
                            className="group/btn w-full relative overflow-hidden px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-green-600 hover:from-emerald-700 hover:via-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-emerald-500/40 transform hover:scale-[1.02] hover:translate-y-[-2px] active:scale-[0.98] active:translate-y-[0px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
                            style={{
                              background:
                                theme === "light"
                                  ? "linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)"
                                  : "linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)",
                              boxShadow:
                                "0 4px 15px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover/btn:translate-x-full group-hover/btn:duration-700"></div>

                            {/* Button Content */}
                            <div className="relative flex items-center justify-center gap-1 sm:gap-2">
                              <svg
                                className="w-3 sm:w-4 h-3 sm:h-4 transition-transform duration-300 group-hover/btn:scale-110"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                              </svg>
                              <span className="tracking-wide">Withdraw</span>
                            </div>

                            {/* Professional Border Highlight */}
                            <div className="absolute inset-0 rounded-xl border border-white/20 group-hover/btn:border-white/30 transition-colors duration-300"></div>
                          </button>

                          <button
                            onClick={() => setShowTransactionModal(true)}
                            className="group/btn w-full relative overflow-hidden px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 hover:from-cyan-700 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-cyan-500/40 transform hover:scale-[1.02] hover:translate-y-[-2px] active:scale-[0.98] active:translate-y-[0px] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
                            style={{
                              background:
                                theme === "light"
                                  ? "linear-gradient(135deg, #0891b2 0%, #1d4ed8 50%, #1e40af 100%)"
                                  : "linear-gradient(135deg, #0891b2 0%, #1d4ed8 50%, #1e40af 100%)",
                              boxShadow:
                                "0 4px 15px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover/btn:translate-x-full group-hover/btn:duration-700"></div>

                            {/* Button Content */}
                            <div className="relative flex items-center justify-center gap-1 sm:gap-2">
                              <FiEye className="text-xs sm:text-sm transition-transform duration-300 group-hover/btn:scale-110" />
                              <span className="tracking-wide">
                                Transactions
                              </span>
                            </div>

                            {/* Professional Border Highlight */}
                            <div className="absolute inset-0 rounded-xl border border-white/20 group-hover/btn:border-white/30 transition-colors duration-300"></div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Professional Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                      <div
                        className={`absolute inset-[-2px] rounded-2xl blur-md`}
                        style={{
                          background: `linear-gradient(135deg, ${
                            item.borderGradient.includes("cyan")
                              ? "rgba(6, 182, 212, 0.15)"
                              : item.borderGradient.includes("yellow")
                              ? "rgba(245, 158, 11, 0.15)"
                              : item.borderGradient.includes("purple")
                              ? "rgba(147, 51, 234, 0.15)"
                              : "rgba(16, 185, 129, 0.15)"
                          }, transparent)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gigs Hosted Section */}
            <section
              className={`rounded-2xl sm:rounded-3xl p-6 md:p-8 border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <h3
                className={`text-2xl font-light tracking-tight mb-6 flex items-center gap-3 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                <FiUsers className="text-cyan-400" />
                Gigs Hosted ({filteredHostedGigs.length}
                {selectedSkills.length > 0
                  ? ` of ${profile.gigsHosted.length}`
                  : ""}
                )
                {selectedSkills.length > 0 && (
                  <span
                    className={`text-sm font-normal ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    - Filtered by skills
                  </span>
                )}
              </h3>
              <div className="space-y-6">
                {displayedHostedGigs.map((gig, index) => (
                  <div
                    key={index}
                    className={`p-4 md:p-6 rounded-xl border backdrop-blur-sm theme-transition ${
                      theme === "light"
                        ? "bg-white/60 border-gray-200/50 hover:bg-white/80"
                        : "bg-neutral-800/30 border-neutral-700/50 hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4
                        className={`text-lg font-medium theme-transition ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {gig.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-sm text-yellow-400 font-medium">
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
                      className={`text-sm mb-3 leading-relaxed theme-transition ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {gig.description}
                    </p>
                    <div
                      className={`text-sm mb-4 theme-transition ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Looking for:{" "}
                      <span className="text-cyan-400 font-medium">
                        {gig.looking_For}
                      </span>
                    </div>
                    {/* Skills Tags */}
                    {gig.skills && gig.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {gig.skills.map((skill: string, skillIdx: number) => (
                            <span
                              key={skillIdx}
                              className={`px-2 py-1 text-xs rounded-full font-medium border theme-transition ${
                                selectedSkills.includes(skill)
                                  ? theme === "light"
                                    ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                                    : "bg-yellow-900/50 border-yellow-600/50 text-yellow-300"
                                  : theme === "light"
                                  ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                                  : "bg-cyan-950/50 border-cyan-800/50 text-cyan-300"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {gig.reviews && gig.reviews.length > 0 && (
                      <div
                        className={`p-4 border rounded-lg backdrop-blur-sm theme-transition ${
                          theme === "light"
                            ? "bg-gray-50/80 border-gray-200/50"
                            : "bg-neutral-900/50 border-neutral-700/50"
                        }`}
                      >
                        <div
                          className={`text-sm font-medium mb-2 theme-transition ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          "{gig.reviews[0].title}"
                        </div>
                        <div
                          className={`text-sm mb-2 theme-transition ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {gig.reviews[0].description}
                        </div>
                        <div className="text-sm text-cyan-400 font-medium">
                          - @{gig.reviews[0].author?.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More / Show Less button for Hosted Gigs */}
              {filteredHostedGigs.length > 5 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={toggleHostedGigs}
                    className={`px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      theme === "light"
                        ? "bg-white/60 border-gray-200/50 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300"
                        : "bg-neutral-800/50 border-neutral-700/50 text-cyan-400 hover:bg-cyan-950/30 hover:border-cyan-600/50"
                    }`}
                  >
                    {showAllHostedGigs
                      ? `Show Less (${filteredHostedGigs.length - 5} hidden)`
                      : `Load More Gigs (${
                          filteredHostedGigs.length - 5
                        } more)`}
                  </button>
                </div>
              )}
            </section>

            {/* Collaborations Section */}
            <section
              className={`rounded-2xl sm:rounded-3xl p-6 md:p-8 border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                theme === "light"
                  ? "bg-white/90 border-gray-200"
                  : "bg-neutral-900/70 border-neutral-800"
              }`}
            >
              <h3
                className={`text-2xl font-light tracking-tight mb-6 flex items-center gap-3 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                <FiUsers className="text-purple-400" />
                Collaborations ({filteredCollaboratedGigs.length}
                {selectedSkills.length > 0
                  ? ` of ${profile.gigsCollaborated?.length || 0}`
                  : ""}
                )
                {selectedSkills.length > 0 && (
                  <span
                    className={`text-sm font-normal ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    - Filtered by skills
                  </span>
                )}
              </h3>
              <div className="space-y-6">
                {displayedCollaboratedGigs.map((gig: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 md:p-6 rounded-xl border backdrop-blur-sm theme-transition ${
                      theme === "light"
                        ? "bg-white/60 border-gray-200/50 hover:bg-white/80"
                        : "bg-neutral-800/30 border-neutral-700/50 hover:bg-neutral-800/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4
                        className={`text-lg font-medium theme-transition ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {gig.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <FiStar
                          className="text-yellow-400 text-sm"
                          fill="currentColor"
                        />
                        <span className="text-sm text-yellow-400 font-medium">
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
                      className={`text-sm mb-3 leading-relaxed theme-transition ${
                        theme === "light" ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {gig.description}
                    </p>
                    <div
                      className={`text-sm mb-4 theme-transition ${
                        theme === "light" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Looking for:{" "}
                      <span className="text-purple-400 font-medium">
                        {gig.looking_For}
                      </span>
                    </div>
                    {/* Skills Tags */}
                    {gig.skills && gig.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {gig.skills.map((skill: string, skillIdx: number) => (
                            <span
                              key={skillIdx}
                              className={`px-2 py-1 text-xs rounded-full font-medium border theme-transition ${
                                selectedSkills.includes(skill)
                                  ? theme === "light"
                                    ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                                    : "bg-yellow-900/50 border-yellow-600/50 text-yellow-300"
                                  : theme === "light"
                                  ? "bg-purple-50 border-purple-200 text-purple-700"
                                  : "bg-purple-950/50 border-purple-800/50 text-purple-300"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {gig.reviews && gig.reviews.length > 0 && (
                      <div
                        className={`p-4 border rounded-lg backdrop-blur-sm theme-transition ${
                          theme === "light"
                            ? "bg-gray-50/80 border-gray-200/50"
                            : "bg-neutral-900/50 border-neutral-700/50"
                        }`}
                      >
                        <div
                          className={`text-sm font-medium mb-2 theme-transition ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          "{gig.reviews[0].title}"
                        </div>
                        <div
                          className={`text-sm mb-2 theme-transition ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {gig.reviews[0].description}
                        </div>
                        <div className="text-sm text-purple-400 font-medium">
                          - @{gig.reviews[0].author?.username}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More / Show Less button for Collaborated Gigs */}
              {filteredCollaboratedGigs.length > 5 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={toggleCollaboratedGigs}
                    className={`px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      theme === "light"
                        ? "bg-white/60 border-gray-200/50 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                        : "bg-neutral-800/50 border-neutral-700/50 text-purple-400 hover:bg-purple-950/30 hover:border-purple-600/50"
                    }`}
                  >
                    {showAllCollaboratedGigs
                      ? `Show Less (${
                          filteredCollaboratedGigs.length - 5
                        } hidden)`
                      : `Load More Gigs (${
                          filteredCollaboratedGigs.length - 5
                        } more)`}
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setShowSkillsFilter(!showSkillsFilter)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
                theme === "light"
                  ? "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  : "bg-neutral-800 text-gray-300 hover:bg-neutral-700 border border-neutral-700"
              }`}
            >
              <FiFilter className="text-lg" />
              <span className="text-sm font-medium">
                {showSkillsFilter ? "Hide Filters" : "Filter Skills"}
              </span>
              {selectedSkills.length > 0 && (
                <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {selectedSkills.length}
                </span>
              )}
            </button>
          </div>

          {/* Skills Filter Sidebar */}
          {allSkills.length > 0 && (
            <>
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-80 xl:w-96  right-10 py-8">
                <div className="sticky top-8">
                  <section
                    className={`rounded-2xl sm:rounded-3xl p-6 border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
                      theme === "light"
                        ? "bg-white/90 border-gray-200"
                        : "bg-neutral-900/70 border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3
                        className={`text-xl font-light tracking-tight flex items-center gap-3 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        <FiFilter className="text-cyan-400" />
                        Filter by Skills
                      </h3>
                      {selectedSkills.length > 0 && (
                        <button
                          onClick={clearSkillsFilter}
                          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                            theme === "light"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                          }`}
                        >
                          <FiX className="text-sm" />
                          Clear
                        </button>
                      )}
                    </div>

                    {tempSelectedSkills.length > 0 && (
                      <div className="mb-4">
                        <div
                          className={`text-sm mb-2 theme-transition ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          Selected skills ({tempSelectedSkills.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tempSelectedSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => handleSkillToggle(skill)}
                              className={`px-2 py-1 text-xs rounded-full font-medium border transition-all duration-200 flex items-center gap-1 ${
                                theme === "light"
                                  ? "bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200"
                                  : "bg-cyan-900/50 border-cyan-600/50 text-cyan-300 hover:bg-cyan-800/50"
                              }`}
                            >
                              {skill}
                              <FiX className="text-xs" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Input */}
                    <div className="mb-4">
                      <div className="relative">
                        <FiSearch
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                            theme === "light"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="Search skills..."
                          value={skillSearchQuery}
                          onChange={(e) => setSkillSearchQuery(e.target.value)}
                          onKeyDown={handleSearchKeyDown}
                          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                            theme === "light"
                              ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400"
                              : "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div
                      className={`text-sm mb-4 theme-transition ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Select skills to filter reviews ({filteredSkills.length}{" "}
                      {skillSearchQuery ? `of ${allSkills.length}` : "total"}):
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSkills.length > 0
                        ? filteredSkills.map((skill) => {
                            const isSelected =
                              tempSelectedSkills.includes(skill);
                            const gigCount =
                              (profile?.gigsHosted || []).filter(
                                (gig) =>
                                  gig.skills && gig.skills.includes(skill)
                              ).length +
                              (profile?.gigsCollaborated || []).filter(
                                (gig) =>
                                  gig.skills && gig.skills.includes(skill)
                              ).length;

                            return (
                              <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                                  isSelected
                                    ? theme === "light"
                                      ? "bg-cyan-50 border-cyan-300 text-cyan-900"
                                      : "bg-cyan-900/30 border-cyan-600/50 text-cyan-200"
                                    : theme === "light"
                                    ? "bg-white/60 border-gray-200/50 text-gray-700 hover:bg-gray-50"
                                    : "bg-neutral-800/30 border-neutral-700/50 text-gray-300 hover:bg-neutral-700/50"
                                }`}
                              >
                                <span className="font-medium">{skill}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      theme === "light"
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-neutral-700 text-gray-400"
                                    }`}
                                  >
                                    {gigCount} gigs
                                  </span>
                                  <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      isSelected
                                        ? "bg-cyan-500 border-cyan-500"
                                        : theme === "light"
                                        ? "border-gray-300"
                                        : "border-neutral-600"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        className="w-2.5 h-2.5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        : null}

                      {filteredSkills.length === 0 && (
                        <div
                          className={`text-center py-8 ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          <FiSearch className="mx-auto mb-2 text-2xl opacity-50" />
                          <p className="text-sm">
                            {skillSearchQuery
                              ? `No skills found matching "${skillSearchQuery}"`
                              : "No skills available"}
                          </p>
                          {skillSearchQuery && (
                            <button
                              onClick={() => setSkillSearchQuery("")}
                              className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors ${
                                theme === "light"
                                  ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                  : "bg-neutral-700 hover:bg-neutral-600 text-gray-300"
                              }`}
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Apply Filter Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200/50">
                      <button
                        onClick={applySkillsFilter}
                        disabled={tempSelectedSkills.length === 0}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                          tempSelectedSkills.length > 0
                            ? theme === "light"
                              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                              : "bg-cyan-600 hover:bg-cyan-700 text-white"
                            : theme === "light"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-neutral-800 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FiFilter className="text-sm" />
                        Apply Filter ({tempSelectedSkills.length} skills)
                      </button>
                    </div>
                  </section>
                </div>
              </aside>

              {/* Mobile Filter Modal */}

              {showSkillsFilter && (
                <div className="lg:hidden fixed inset-0 z-40 overflow-hidden">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleCloseSkillsFilter}
                  />

                  {/* Modal Content */}
                  <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden">
                    <section
                      className={`rounded-t-3xl p-6 border-0 relative backdrop-blur-md theme-transition ${
                        theme === "light"
                          ? "bg-white/95 border-gray-200"
                          : "bg-neutral-900/95 border-neutral-800"
                      }`}
                    >
                      {/* Header with close button */}
                      <div className="flex items-center justify-between mb-6">
                        <h3
                          className={`text-xl font-light tracking-tight flex items-center gap-3 ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          <FiFilter className="text-cyan-400" />
                          Filter by Skills
                        </h3>
                        <div className="flex items-center gap-2">
                          {selectedSkills.length > 0 && (
                            <button
                              onClick={clearSkillsFilter}
                              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                theme === "light"
                                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                              }`}
                            >
                              <FiX className="text-sm" />
                              Clear
                            </button>
                          )}

                          <button
                            onClick={handleCloseSkillsFilter}
                            className={`p-2 rounded-full transition-all duration-200 ${
                              theme === "light"
                                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                            }`}
                          >
                            <FiX className="text-lg" />
                            Close
                          </button>
                        </div>
                      </div>

                      {tempSelectedSkills.length > 0 && (
                        <div className="mb-4">
                          <div
                            className={`text-sm mb-2 theme-transition ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            Selected skills ({tempSelectedSkills.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tempSelectedSkills.map((skill) => (
                              <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-2 py-1 text-xs rounded-full font-medium border transition-all duration-200 flex items-center gap-1 ${
                                  theme === "light"
                                    ? "bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200"
                                    : "bg-cyan-900/50 border-cyan-600/50 text-cyan-300 hover:bg-cyan-800/50"
                                }`}
                              >
                                {skill}
                                <FiX className="text-xs" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Input */}
                      <div className="mb-4">
                        <div className="relative">
                          <FiSearch
                            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                              theme === "light"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Search skills..."
                            value={skillSearchQuery}
                            onChange={(e) =>
                              setSkillSearchQuery(e.target.value)
                            }
                            onKeyDown={handleSearchKeyDown}
                            className={`w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                              theme === "light"
                                ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400"
                                : "bg-neutral-800/50 border-neutral-700 text-white placeholder-gray-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div
                        className={`text-sm mb-4 theme-transition ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Select skills to filter reviews ({filteredSkills.length}{" "}
                        {skillSearchQuery ? `of ${allSkills.length}` : "total"}
                        ):
                      </div>

                      {/* Scrollable skills list */}
                      <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                        {filteredSkills.map((skill) => {
                          const isSelected = tempSelectedSkills.includes(skill);
                          const gigCount =
                            (profile?.gigsHosted || []).filter(
                              (gig) => gig.skills && gig.skills.includes(skill)
                            ).length +
                            (profile?.gigsCollaborated || []).filter(
                              (gig) => gig.skills && gig.skills.includes(skill)
                            ).length;

                          return (
                            <button
                              key={skill}
                              onClick={() => handleSkillToggle(skill)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                                isSelected
                                  ? theme === "light"
                                    ? "bg-cyan-50 border-cyan-300 text-cyan-900"
                                    : "bg-cyan-900/30 border-cyan-600/50 text-cyan-200"
                                  : theme === "light"
                                  ? "bg-white/60 border-gray-200/50 text-gray-700 hover:bg-gray-50"
                                  : "bg-neutral-800/30 border-neutral-700/50 text-gray-300 hover:bg-neutral-700/50"
                              }`}
                            >
                              <span className="font-medium">{skill}</span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    theme === "light"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-neutral-700 text-gray-400"
                                  }`}
                                >
                                  {gigCount} gigs
                                </span>
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-cyan-500 border-cyan-500"
                                      : theme === "light"
                                      ? "border-gray-300"
                                      : "border-neutral-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-2.5 h-2.5 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {filteredSkills.length === 0 && (
                          <div
                            className={`text-center py-8 ${
                              theme === "light"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            <FiSearch className="mx-auto mb-2 text-2xl opacity-50" />
                            <p className="text-sm">
                              {skillSearchQuery
                                ? `No skills found matching "${skillSearchQuery}"`
                                : "No skills available"}
                            </p>
                            {skillSearchQuery && (
                              <button
                                onClick={() => setSkillSearchQuery("")}
                                className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors ${
                                  theme === "light"
                                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                    : "bg-neutral-700 hover:bg-neutral-600 text-gray-300"
                                }`}
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom action buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleCloseSkillsFilter}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 border ${
                            theme === "light"
                              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "border-neutral-600 text-gray-300 hover:bg-neutral-800"
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            applySkillsFilter();
                            handleCloseSkillsFilter();
                          }}
                          disabled={tempSelectedSkills.length === 0}
                          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                            tempSelectedSkills.length > 0
                              ? theme === "light"
                                ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                                : "bg-cyan-600 hover:bg-cyan-700 text-white"
                              : theme === "light"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-neutral-800 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FiFilter className="text-sm" />
                          Apply ({tempSelectedSkills.length})
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        walletData={walletData}
        currency={walletCurrency}
      />

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        walletAmount={totalEarnings}
        currency={walletCurrency}
        getCurrencySymbol={getCurrencySymbol}
      />
    </>
  );
}
