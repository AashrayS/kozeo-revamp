"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { theme } from "../../../../theme";
import InputField from "../../../../components/common/InputField";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import ProfessionalButton from "@/components/common/ProfessionalButton";
import { FaCamera, FaUpload, FaTimes, FaLock, FaUnlock } from "react-icons/fa";
import {
  getUserByUsername,
  updateUserProfile,
  changePassword,
} from "../../../../../utilities/kozeoApi";
import { useUser } from "../../../../../store/hooks";
import { selectUser } from "../../../../../store/userSlice";

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const isDark = true;
  const currentTheme = isDark ? theme.dark : theme.light;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redux
  const { user: currentUser, isAuthenticated } = useUser();
  const reduxUser = useSelector(selectUser);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    country_code: "",
    bio: "",
    resume: "",
    links: [{ website: "", url: "" }],
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+81", name: "Japan" },
    { code: "+61", name: "Australia" },
  ];

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);

        // Check if user is editing their own profile
        if (!isAuthenticated || currentUser?.username !== username) {
          router.push(`/profile/${username}`);
          return;
        }

        const profileData = (await getUserByUsername(username)) as any;

        if (profileData) {
          setForm({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            phone: profileData.phone || "",
            country_code: profileData.country_Code || "",
            bio: profileData.bio || "",
            resume: profileData.resume || "",
            links:
              profileData.links && profileData.links.length > 0
                ? profileData.links.map((link: string) => ({
                    website: "Website",
                    url: link,
                  }))
                : [{ website: "", url: "" }],
          });

          if (profileData.profile_Picture) {
            setProfileImage(profileData.profile_Picture);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username, isAuthenticated, currentUser, router]);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Prepare update data (excluding password)
      const updateData = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        country_code: form.country_code,
        bio: form.bio,
        resume: form.resume,
        links: form.links.filter((link) => link.url).map((link) => link.url),
        ...(profileImage && { profile_Picture: profileImage }),
      };

      // Update profile via API
      if (currentUser?.id) {
        await updateUserProfile(currentUser.id, updateData);
        alert("Profile updated successfully!");
        router.push(`/profile/${username}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.password || !passwordForm.confirmPassword) {
      alert("Please fill in both password fields!");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      // Use dedicated changePassword function
      if (currentUser?.id) {
        await changePassword(currentUser.id, passwordForm.password);
        alert("Password updated successfully!");
        // Clear password fields
        setPasswordForm({ password: "", confirmPassword: "" });
        // Hide password section
        setShowPasswordSection(false);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

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
            <div className="w-full max-w-3xl mx-auto">
              {loadingProfile ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-white">Loading profile data...</div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8 rounded-lg shadow-lg p-8 border border-gray-700"
                >
                  <h1 className="text-4xl font-bold text-white text-center mb-6">
                    Edit Profile
                  </h1>

                  {/* Profile Picture Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">
                      Profile Picture
                    </h2>

                    <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
                      {/* Avatar Display */}
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-4xl font-bold">
                              {username
                                ? username.charAt(0).toUpperCase()
                                : "U"}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors border-2 border-neutral-600"
                        >
                          <FaCamera className="text-white text-sm" />
                        </button>
                      </div>

                      {/* Upload Section */}
                      <div className="flex-1 w-full">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragging
                              ? "border-cyan-400 bg-cyan-400/10"
                              : "border-neutral-600 hover:border-neutral-500"
                          }`}
                        >
                          <FaUpload className="mx-auto text-gray-400 text-2xl mb-3" />
                          <p className="text-gray-300 mb-2">
                            Drag and drop your image here
                          </p>
                          <p className="text-gray-500 text-sm mb-4">or</p>
                          <ProfessionalButton
                            onClick={() => fileInputRef.current?.click()}
                            variant="primary"
                            size="sm"
                          >
                            Browse Files
                          </ProfessionalButton>
                        </div>

                        {profileImage && (
                          <div className="flex gap-3 mt-4">
                            <ProfessionalButton
                              onClick={() => fileInputRef.current?.click()}
                              variant="neutral"
                              size="sm"
                            >
                              Change Photo
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => setProfileImage(null)}
                              variant="danger"
                              size="sm"
                              icon={<FaTimes className="text-xs" />}
                            >
                              Remove Photo
                            </ProfessionalButton>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">
                      Personal Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={(e) =>
                          setForm({ ...form, first_name: e.target.value })
                        }
                        style={baseInputStyle(currentTheme)}
                      />
                      <InputField
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={(e) =>
                          setForm({ ...form, last_name: e.target.value })
                        }
                        style={baseInputStyle(currentTheme)}
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Bio"
                        value={form.bio}
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                        rows={4}
                        className="w-full p-3 rounded-md border resize-none"
                        style={baseInputStyle(currentTheme)}
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        style={baseInputStyle(currentTheme)}
                      />
                      <select
                        value={form.country_code}
                        onChange={(e) =>
                          setForm({ ...form, country_code: e.target.value })
                        }
                        className="p-3 rounded-md border"
                        style={baseInputStyle(currentTheme)}
                      >
                        <option value="">Select Country Code</option>
                        {countryCodes.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.name} ({item.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-600 pb-2">
                      <h2 className="text-xl font-semibold text-gray-300">
                        Security
                      </h2>
                      <ProfessionalButton
                        onClick={() =>
                          setShowPasswordSection(!showPasswordSection)
                        }
                        variant="neutral"
                        size="sm"
                        icon={showPasswordSection ? <FaLock /> : <FaUnlock />}
                      >
                        {showPasswordSection
                          ? "Hide Password"
                          : "Change Password"}
                      </ProfessionalButton>
                    </div>

                    {showPasswordSection && (
                      <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4 space-y-4">
                        <form
                          onSubmit={handlePasswordSubmit}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                              type="password"
                              placeholder="New Password"
                              value={passwordForm.password}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  password: e.target.value,
                                })
                              }
                              style={baseInputStyle(currentTheme)}
                            />
                            <InputField
                              type="password"
                              placeholder="Confirm New Password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              style={baseInputStyle(currentTheme)}
                            />
                          </div>
                          <p className="text-sm text-gray-400">
                            Enter your new password in both fields above.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <ProfessionalButton
                              onClick={() => {
                                setPasswordForm({
                                  password: "",
                                  confirmPassword: "",
                                });
                                setShowPasswordSection(false);
                              }}
                              variant="neutral"
                              size="sm"
                            >
                              Cancel
                            </ProfessionalButton>
                            <ProfessionalButton
                              onClick={() => {}} // Form submission is handled by onSubmit
                              variant="primary"
                              size="sm"
                              loading={isSubmittingPassword}
                              loadingText="Updating..."
                              disabled={
                                isSubmittingPassword ||
                                !passwordForm.password ||
                                !passwordForm.confirmPassword
                              }
                              type="submit"
                            >
                              Update Password
                            </ProfessionalButton>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">
                      Professional Details
                    </h2>

                    <InputField
                      type="url"
                      placeholder="Resume Link"
                      value={form.resume}
                      onChange={(e) =>
                        setForm({ ...form, resume: e.target.value })
                      }
                      style={baseInputStyle(currentTheme)}
                    />

                    <div className="space-y-3">
                      <label className="text-white block">Relevant Links</label>
                      {form.links.map((link, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <InputField
                            placeholder="Website"
                            value={link.website}
                            onChange={(e) => {
                              const updated = [...form.links];
                              updated[idx].website = e.target.value;
                              setForm({ ...form, links: updated });
                            }}
                            className="w-[40%]"
                            style={baseInputStyle(currentTheme)}
                          />
                          <InputField
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...form.links];
                              updated[idx].url = e.target.value;
                              setForm({ ...form, links: updated });
                            }}
                            className="w-[50%]"
                            style={baseInputStyle(currentTheme)}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...form.links];
                              updated.splice(idx, 1);
                              setForm({ ...form, links: updated });
                            }}
                            className="text-red-400 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <ProfessionalButton
                        onClick={() =>
                          setForm({
                            ...form,
                            links: [...form.links, { website: "", url: "" }],
                          })
                        }
                        variant="primary"
                        size="md"
                        className="w-full"
                      >
                        + Add Link
                      </ProfessionalButton>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <ProfessionalButton
                      onClick={() => router.push(`/profile/${username}`)}
                      variant="neutral"
                      size="md"
                    >
                      Cancel
                    </ProfessionalButton>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// Helper style generator
function baseInputStyle(currentTheme: any) {
  return {
    background: currentTheme.colors.input,
    borderColor: currentTheme.colors.border,
    color: currentTheme.colors.text,
  };
}
