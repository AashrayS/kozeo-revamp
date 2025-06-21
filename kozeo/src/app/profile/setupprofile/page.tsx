"use client";

import { useState, useRef, useEffect } from "react";
import { theme } from "../../../theme";
import InputField from "../../../components/common/InputField";
import Header from "@/components/common/Header";

export default function ProfileSetupPage() {
  const isDark = true;
  const currentTheme = isDark ? theme.dark : theme.light;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "a@demo.com",
    username: "",
    phone: "",
    country_code: "",
    resume: "",
    links: [{ website: "", url: "" }],
  });

  const [otp, setOtp] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+81", name: "Japan" },
    { code: "+61", name: "Australia" },
  ];

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (showOtpStep && otpRef.current) otpRef.current.focus();
  }, [showOtpStep]);

  return (
    <>
      <Header logoText="Kozeo" />
      <div
        className="min-h-screen w-full flex items-center justify-center px-6 py-10 bg-[radial-gradient(circle_at_center,_#111,_#000)]"
        style={{ fontFamily: currentTheme.fonts.base }}
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-3xl space-y-8 rounded-lg shadow-lg p-8  border border-gray-700"
        >
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            Profile Setup
          </h1>

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
              <InputField
                type="email"
                placeholder="Email"
                value={form.email}
                readOnly
                style={baseInputStyle(currentTheme)}
              />
              <InputField
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={baseInputStyle(currentTheme)}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 border-b border-gray-600 pb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={baseInputStyle(currentTheme)}
              />
              <select
                value={form.country_code}
                onChange={(e) =>
                  setForm({ ...form, country_code: e.target.value })
                }
                className="p-3 rounded-md border sm:col-span-1"
                style={baseInputStyle(currentTheme)}
              >
                <option value="">Code</option>
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
              {!showOtpStep ? (
                <button
                  type="button"
                  disabled={isSendingOtp}
                  onClick={() => {
                    if (form.phone.length < 4) return;
                    setShowOtpStep(true);
                    setIsSendingOtp(true);
                    setTimeout(() => {
                      setIsSendingOtp(false);
                      setResendCooldown(30);
                    }, 1500);
                  }}
                  className="w-full py-3 px-4 text-white rounded-md transition-all"
                  style={{ background: currentTheme.colors.primary }}
                >
                  {isSendingOtp ? "Sending OTP..." : "Verify Phone"}
                </button>
              ) : (
                <>
                  <InputField
                    ref={otpRef}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={baseInputStyle(currentTheme)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (otp.trim().length >= 4) setShowOtpStep(false);
                    }}
                    className="w-full py-3 text-white rounded-md"
                    style={{ background: currentTheme.colors.primary }}
                  >
                    Confirm OTP
                  </button>
                  <p className="text-sm text-gray-400 text-center">
                    Didn’t receive it?{" "}
                    {resendCooldown === 0 ? (
                      <button
                        className="underline text-blue-400"
                        onClick={() => {
                          setIsSendingOtp(true);
                          setTimeout(() => {
                            setIsSendingOtp(false);
                            setResendCooldown(30);
                          }, 1500);
                        }}
                      >
                        Resend OTP
                      </button>
                    ) : (
                      `Wait ${resendCooldown}s`
                    )}
                  </p>
                </>
              )}
            </div>
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
              onChange={(e) => setForm({ ...form, resume: e.target.value })}
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
              <button
                type="button"
                className="w-full py-2 text-white rounded-md"
                style={{ background: currentTheme.colors.primary }}
                onClick={() =>
                  setForm({
                    ...form,
                    links: [...form.links, { website: "", url: "" }],
                  })
                }
              >
                + Add Link
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 py-3 text-lg font-semibold rounded-md transition-all duration-200 shadow-md border hover:shadow-lg"
            style={{
              background: "#1f1f1f", // Default: dark
              color: "#f5f5f5", // Default: light text
              border: "1px solid #333",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5"; // Light background
              e.currentTarget.style.color = "#000"; // Dark text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1f1f1f"; // Revert to dark
              e.currentTarget.style.color = "#f5f5f5"; // Revert to light text
            }}
          >
            Save & Continue
          </button>
        </form>
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
