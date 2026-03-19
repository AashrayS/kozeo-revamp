"use client";

import { useState, useMemo } from "react";
import { theme } from "../../theme";
import { useRef, useEffect } from "react";
import { useNavigationLoader } from "../../components/common/useNavigationLoader";
import {
  loginUser,
  registerUser,
  verifyEmail,
  verifyOtp,
} from "../../../utilities/kozeoApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/userSlice";
import { useTheme } from "../../contexts/ThemeContext";
import { PageLoader } from "../../components/common/PageLoader";
import Image from "next/image";
import Link from "next/link";

import { useSearchParams } from "next/navigation";

// Navbar Component - Same as landing page but simplified for login
// Navbar Component - Refined minimalist version
const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-black/5">
      <nav className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image
            src="/kozeoLogo.png"
            alt="Kozeo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-semibold text-[15px] tracking-tight text-black">
            Kozeo
          </span>
        </Link>
        <Link href="/" className="text-sm text-black/60 hover:text-black transition-colors font-medium">
          Back to Home
        </Link>
      </nav>
    </header>
  );
};

export default function LoginSignupPage() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode");
  const [showLogin, setShowLogin] = useState(initialMode !== "signup");
  const [isLoading, setIsLoading] = useState(true);
  const { navigateWithLoader } = useNavigationLoader();
  const dispatch = useDispatch();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup state
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirmPassword: "",
    country_Code: "US",
    role: "freelancer",
  });
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs for autofocus
  const otpRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Countdown for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (signupStep === 2 && otpRef.current) otpRef.current.focus();
    if (signupStep === 3 && nameRef.current) nameRef.current.focus();
  }, [signupStep]);

  return (
    <>
      {isLoading && (
        <PageLoader
          duration={2000}
          onComplete={() => setIsLoading(false)}
          useSlideAnimation={true}
        />
      )}

      <Navbar />

      <div className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
        {/* Subtle Blue Radial Glow */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md px-6">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-10 text-center space-y-4">
             <Image
                src="/kozeoLogo.png"
                alt="Kozeo"
                width={48}
                height={48}
                className="rounded-full shadow-sm"
                priority
              />
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-black">
                  {showLogin ? "Welcome back" : "Create an account"}
                </h1>
                <p className="text-black/50 text-sm">
                  {showLogin 
                    ? "Log in to continue your verifiable career journey." 
                    : "Join the proof-first era of professional work."}
                </p>
              </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            {/* Toggle tabs */}
            <div className="flex p-1 bg-black/5 rounded-full mb-8">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  showLogin ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  !showLogin ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/60"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Sliding Form Container */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${showLogin ? "0%" : "-50%"})`,
                  width: "200%",
                }}
              >
                {/* Login Form */}
                <div className="w-1/2 pr-4">
                  <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1.5">
                      <label htmlFor="login-email" className="text-xs font-semibold text-black/50 uppercase tracking-wider ml-1">
                        Email Address
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="name@company.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label htmlFor="login-password" className="text-xs font-semibold text-black/50 uppercase tracking-wider">
                          Password
                        </label>
                        <Link href="/login" className="text-xs text-blue-600 font-medium hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    {loginError && <p className="text-red-500 text-xs mt-1 text-center font-medium">{loginError}</p>}

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!loginEmail || !loginPassword) {
                          setLoginError("Please fill in all fields");
                          return;
                        }
                        setIsLoggingIn(true);
                        setLoginError("");
                        try {
                          const res = await loginUser({ email: loginEmail, password: loginPassword });
                          dispatch(setUser({ user: { ...(res as any).user, email: loginEmail }, token: (res as any).token }));
                          navigateWithLoader("/Atrium");
                        } catch (err: any) {
                          setLoginError(err?.message || "Login failed. Please try again.");
                        } finally {
                          setIsLoggingIn(false);
                        }
                      }}
                      className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 mt-2"
                    >
                      {isLoggingIn ? "Signing in..." : "Sign In"}
                    </button>
                  </form>
                </div>

                {/* Sign Up Form */}
                <div className="w-1/2 pl-4">
                  <div className="space-y-5">
                    {signupStep === 1 && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-black/50 uppercase tracking-wider ml-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="name@company.com"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                        {emailError && <p className="text-red-500 text-xs text-center font-medium">{emailError}</p>}
                        <button
                          type="button"
                          disabled={isSendingOtp}
                          onClick={async () => {
                            if (!/\S+@\S+\.\S+/.test(signupData.email)) {
                              setEmailError("Please enter a valid email.");
                              return;
                            }
                            setIsSendingOtp(true);
                            setEmailError("");
                            try {
                              const res = await verifyEmail(signupData.email);
                              const result = Array.isArray(res) ? res[0] : res;
                              if (result && result.success) {
                                setSignupStep(2);
                                setResendCooldown(30);
                              } else {
                                setEmailError(result?.message || "Failed to send OTP.");
                              }
                            } catch (err: any) {
                              setEmailError(err?.message || "Failed to send OTP.");
                            } finally {
                              setIsSendingOtp(false);
                            }
                          }}
                          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50"
                        >
                          {isSendingOtp ? "Sending OTP..." : "Get Started"}
                        </button>
                      </>
                    )}

                    {signupStep === 2 && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-black/50 uppercase tracking-wider ml-1">
                            Enter OTP
                          </label>
                          <input
                            ref={otpRef}
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                        {otpError && <p className="text-red-500 text-xs text-center font-medium">{otpError}</p>}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!otp) {
                              setOtpError("Enter the OTP from your email.");
                              return;
                            }
                            try {
                            const res = await verifyOtp(signupData.email, otp);
                            const result = Array.isArray(res) ? res[0] : res;
                            if (result && result.success) setSignupStep(3);
                            else setOtpError(result?.message || "Invalid OTP.");
                            } catch (err: any) {
                              setOtpError(err?.message || "Verification failed.");
                            }
                          }}
                          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300"
                        >
                          Verify OTP
                        </button>
                        <div className="text-center">
                          <button
                            type="button"
                            className="text-xs text-blue-600 font-medium hover:underline disabled:opacity-40"
                            disabled={isSendingOtp || resendCooldown > 0}
                            onClick={async () => {
                              setIsSendingOtp(true);
                              try {
                                const res = await verifyEmail(signupData.email);
                                const result = Array.isArray(res) ? res[0] : res;
                                if (result && result.success) setResendCooldown(30);
                              } catch (err: any) {
                                setOtpError("Failed to resend.");
                              } finally {
                                setIsSendingOtp(false);
                              }
                            }}
                          >
                            Resend OTP {resendCooldown > 0 && `(${resendCooldown}s)`}
                          </button>
                        </div>
                      </>
                    )}

                    {signupStep === 3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">First Name</label>
                            <input
                              ref={nameRef}
                              type="text"
                              value={signupData.first_name}
                              onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Last Name</label>
                            <input
                              type="text"
                              value={signupData.last_name}
                              onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Username</label>
                          <input
                            type="text"
                            value={signupData.username}
                            onChange={(e) => setSignupData({ ...signupData, username: e.target.value.replace(/\s/g, "") })}
                            className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider ml-1">Password</label>
                          <input
                            type="password"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm"
                          />
                        </div>
                        {signupError && <p className="text-red-500 text-xs text-center">{signupError}</p>}
                        <button
                          type="button"
                          disabled={isSigningUp}
                          onClick={async () => {
                            if (!signupData.first_name || !signupData.password) {
                              setSignupError("Fill in all fields.");
                              return;
                            }
                            setIsSigningUp(true);
                            try {
                              const res = await registerUser({
                                first_name: signupData.first_name,
                                last_name: signupData.last_name,
                                email: signupData.email,
                                username: signupData.username,
                                password: signupData.password,
                                country_Code: signupData.country_Code,
                                role: signupData.role,
                              });
                              dispatch(setUser({ user: { ...(res as any).user, email: signupData.email }, token: (res as any).token }));
                              navigateWithLoader("/profile/setupprofile");
                            } catch (err: any) {
                              setSignupError(err?.message || "Registration failed.");
                            } finally {
                              setIsSigningUp(false);
                            }
                          }}
                          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300"
                        >
                          {isSigningUp ? "Creating..." : "Complete Setup"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-black/40 text-xs">
            By continuing, you agree to Kozeo&apos;s <Link href="/login" className="underline hover:text-black transition-colors">Terms of Service</Link> and <Link href="/login" className="underline hover:text-black transition-colors">Privacy Policy</Link>.
          </div>
        </div>
      </div>

      <footer className="w-full bg-white border-t border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-black/40 text-xs gap-4">
          <span>© {new Date().getFullYear()} Kozeo. Inspired by Antigravity.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-black transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
