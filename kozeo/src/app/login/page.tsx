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

// Navbar Component - Same as landing page but simplified for login
const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black">
      <nav
        className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-6 relative"
        aria-label="Global"
      >
        {/* Home Icon */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-white transition-all duration-300 hover:scale-110 hover:text-gray-300"
            title="Go to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Home</span>
          </Link>
        </div>

        {/* Center Logo */}
        <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 font-bold text-xl sm:text-2xl tracking-tight text-white transition-all duration-300 hover:scale-105"
          >
            <Image
              src="/kozeoLogo.png"
              alt="Kozeo Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </Link>
        </div>

        {/* Right side spacer for balance */}
        <div className="w-6 sm:w-7"></div>
      </nav>
    </header>
  );
};

type SignupData = {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  confirmPassword: string;
  country_Code: string;
  role: string;
};

export default function LoginSignupPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { navigateWithLoader } = useNavigationLoader();
  const dispatch = useDispatch();
  const { theme: currentAppTheme } = useTheme();

  const isDark = currentAppTheme === "dark";
  const currentTheme = isDark ? theme.dark : theme.light;

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

  // Memoize star positions to prevent glitching during re-renders
  const starPositions = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      animationDuration: 15 + Math.random() * 25,
    }));
  }, []); // Empty dependency array means this only runs once

  // Refs for autofocus
  const otpRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Countdown for resend
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
    if (signupStep === 2 && otpRef.current) otpRef.current.focus();
    if (signupStep === 3 && nameRef.current) nameRef.current.focus();
  }, [signupStep]);

  return (
    <>
      {isLoading && (
        <PageLoader
          duration={2000}
          onComplete={() => setIsLoading(false)}
          useSlideAnimation={false}
        />
      )}

      {/* Navbar Component */}
      <Navbar />

      <div
        className="flex w-full h-screen overflow-hidden md:flex-row transition-opacity duration-1000 relative bg-black pt-16 sm:pt-20"
        style={{
          fontFamily: currentTheme.fonts.base,
        }}
      >
        {/* Space Background - Same as Landing Page */}
        {/* Glow Effects */}
        <div className="fixed top-1/4 right-8 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
        <div className="fixed bottom-1/4 left-8 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        <div className="fixed top-2/3 right-1/3 w-2 h-0 rounded-full opacity-70 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />

        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Static visible stars for immediate feedback */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>

          {/* Twinkling Stars */}
          <div className="absolute inset-0">
            {/* Large Stars */}
            <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse opacity-80"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse opacity-70"></div>
            <div className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse opacity-90"></div>
            <div className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-75"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-85"></div>

            {/* Medium Stars */}
            <div className="absolute top-32 right-40 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-52 left-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-50"></div>
            <div className="absolute bottom-32 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-70"></div>
            <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-55"></div>
            <div className="absolute top-1/2 left-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-65"></div>

            {/* Small Stars */}
            <div className="absolute top-24 left-1/2 w-px h-px bg-white opacity-40 animate-pulse"></div>
            <div className="absolute top-48 right-16 w-px h-px bg-white opacity-30 animate-pulse"></div>
            <div className="absolute bottom-48 left-40 w-px h-px bg-white opacity-45 animate-pulse"></div>
            <div className="absolute bottom-24 right-1/2 w-px h-px bg-white opacity-35 animate-pulse"></div>
            <div className="absolute top-2/3 right-8 w-px h-px bg-white opacity-40 animate-pulse"></div>
          </div>

          {/* Moving Stars */}
          <div className="absolute inset-0 overflow-hidden">
            {starPositions.map((star, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.width}px`,
                  height: `${star.height}px`,
                  opacity: star.opacity,
                  animation: `moveStars ${star.animationDuration}s linear infinite`,
                }}
              />
            ))}
          </div>

          {/* Animated Lines */}
          <div className="absolute inset-0">
            {/* Horizontal Lines */}
            {/* <div
              className="absolute top-1/4 left-1/4 w-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30 max-w-md"
              style={{
                animation: "slideRight 4s infinite linear",
                animationDelay: "0s",
              }}
            ></div>
            <div
              className="absolute top-3/4 right-1/4 w-0 h-px bg-gradient-to-l from-transparent via-white to-transparent opacity-25 max-w-md"
              style={{
                animation: "slideLeft 5s infinite linear",
                animationDelay: "2s",
              }}
            ></div> */}
          </div>
        </div>

        <div className="md:w-full w-full flex flex-col  items-center justify-center p-6 md:p-10 text-center relative z-10 text-white">
          {/* <p className="mb-4 md:mb-6 text-sm md:text-base" style={{}}>
            Get your hands dirty with real life projects
          </p> */}

          {/* Kozeo Logo positioned right above the container */}

          <div className="w-full sm:w-[90%] md:w-4/10 h-full relative flex flex-col items-center justify-center px-6 py-10 overflow-hidden bg-transparent  rounded-2xl ">
            <div className="mb-8 md:mb-12">
              <Image
                src="/logoFial.svg"
                alt="Kozeo Full Logo"
                width={625}
                height={147}
                className="w-72 sm:w-80 md:w-96 lg:w-[400px] xl:w-[450px] 2xl:w-[500px] h-auto brightness-0 invert max-w-[90vw] -ml-16"
                priority
              />
            </div>
            <div className="flex mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className={`px-4 md:px-6 py-2 rounded-l-full font-medium transition text-sm md:text-base ${
                  showLogin ? "text-white" : "bg-gray-200 text-black"
                }`}
                style={showLogin ? { backgroundColor: "#10B981" } : {}}
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`px-4 md:px-6 py-2 rounded-r-full font-medium transition text-sm md:text-base ${
                  !showLogin ? "text-white" : "bg-gray-200 text-black"
                }`}
                style={!showLogin ? { backgroundColor: "#10B981" } : {}}
              >
                Sign Up
              </button>
            </div>

            {/* Sliding Form Container */}
            <div className="relative w-full overflow-x-hidden sm:h-auto">
              <div
                className="w-full h-full flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${showLogin ? "0%" : "-50%"})`,
                  width: "200%",
                }}
              >
                {/* Login Form */}
                <form className="w-full space-y-4 px-2 md:px-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block w-full text-left mb-1 text-sm font-medium text-white"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block w-full text-left mb-1 text-sm font-medium text-white"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                    />
                  </div>

                  {loginError && (
                    <p className="text-red-500 text-sm mb-4">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    onClick={async (e) => {
                      e.preventDefault();
                      setLoginError("");

                      if (!loginEmail || !loginPassword) {
                        setLoginError("Please fill in all fields");
                        return;
                      }

                      setIsLoggingIn(true);

                      try {
                        const response = await loginUser({
                          email: loginEmail,
                          password: loginPassword,
                        });

                        dispatch(
                          setUser({
                            user: {
                              ...(response as any).user,
                              email: loginEmail,
                            },
                            token: (response as any).token,
                          })
                        );

                        navigateWithLoader("/Atrium");
                      } catch (error: any) {
                        setLoginError(
                          error?.message || "Login failed. Please try again."
                        );
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    className="w-full py-3 rounded-md text-white"
                    style={{ background: currentTheme.colors.primary }}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* Sign Up Form */}
                <form
                  className="w-full space-y-4 px-2 md:px-4"
                  onSubmit={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                >
                  {signupStep === 1 && (
                    <>
                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>
                      {emailError && (
                        <p className="text-red-500 text-sm">{emailError}</p>
                      )}
                      <button
                        type="button"
                        disabled={isSendingOtp}
                        className="w-full py-3 rounded-md text-white flex items-center justify-center"
                        style={{ background: currentTheme.colors.primary }}
                        onClick={async () => {
                          const valid = /\S+@\S+\.\S+/.test(signupData.email);
                          if (!valid) {
                            setEmailError("Please enter a valid email.");
                            return;
                          }
                          setEmailError("");
                          setIsSendingOtp(true);
                          try {
                            const res = await verifyEmail(signupData.email);
                            const result = Array.isArray(res) ? res[0] : res;
                            if (result && result.success) {
                              setSignupStep(2);
                              setResendCooldown(30);
                            } else {
                              setEmailError(
                                result?.message || "Failed to send OTP."
                              );
                            }
                          } catch (err) {
                            const errorMessage =
                              typeof err === "object" &&
                              err !== null &&
                              "message" in err
                                ? (err as any).message
                                : "Failed to send OTP.";
                            setEmailError(errorMessage);
                          } finally {
                            setIsSendingOtp(false);
                          }
                        }}
                      >
                        {isSendingOtp ? "Processing..." : "Continue"}
                      </button>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <div>
                        <label
                          className="block w-full text-left mb-1 text-sm font-medium"
                          style={{ color: currentTheme.colors.text }}
                        >
                          Enter OTP
                        </label>
                        <input
                          ref={otpRef}
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value);
                            setOtpError("");
                          }}
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>
                      {otpError && (
                        <p className="text-red-500 text-sm">{otpError}</p>
                      )}
                      <button
                        type="button"
                        className="w-full py-3 rounded-md text-white"
                        style={{ background: currentTheme.colors.primary }}
                        onClick={async () => {
                          setOtpError("");
                          if (!otp) {
                            setOtpError(
                              "Please enter the OTP sent to your email."
                            );
                            return;
                          }
                          try {
                            const res = await verifyOtp(signupData.email, otp);
                            if (res.success) {
                              setSignupStep(3);
                              setOtpError("");
                            } else {
                              setOtpError(res.message || "Invalid OTP.");
                            }
                          } catch (err) {
                            setOtpError(
                              typeof err === "object" &&
                                err !== null &&
                                "message" in err
                                ? (err as any).message
                                : "OTP verification failed."
                            );
                          }
                        }}
                      >
                        Verify OTP
                      </button>

                      <div className="mt-2 text-center">
                        <button
                          type="button"
                          className="underline text-blue-400"
                          disabled={isSendingOtp || resendCooldown > 0}
                          onClick={async () => {
                            setIsSendingOtp(true);
                            try {
                              const res = await verifyEmail(signupData.email);
                              const result = Array.isArray(res) ? res[0] : res;
                              if (result && result.success) {
                                setResendCooldown(30);
                              } else {
                                setOtpError(
                                  result?.message || "Failed to resend OTP."
                                );
                              }
                            } catch (err) {
                              setOtpError(
                                typeof err === "object" &&
                                  err !== null &&
                                  "message" in err
                                  ? (err as any).message
                                  : "Failed to resend OTP."
                              );
                            } finally {
                              setIsSendingOtp(false);
                            }
                          }}
                        >
                          Resend OTP
                        </button>
                        {resendCooldown > 0 && (
                          <span className="ml-2 text-gray-400">
                            Wait {resendCooldown}s
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {signupStep === 3 && (
                    <>
                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          First Name
                        </label>
                        <input
                          ref={nameRef}
                          type="text"
                          placeholder="First Name"
                          value={signupData.first_name}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={signupData.last_name}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          Username
                        </label>
                        <input
                          type="text"
                          placeholder="Username"
                          value={signupData.username}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              username: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter your password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block w-full text-left mb-1 text-sm font-medium text-white">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-300"
                        />
                      </div>

                      {signupError && (
                        <p className="text-red-500 text-sm">{signupError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSigningUp}
                        onClick={async (e) => {
                          e.preventDefault();
                          setSignupError("");

                          if (
                            !signupData.first_name ||
                            !signupData.last_name ||
                            !signupData.username ||
                            !signupData.password
                          ) {
                            setSignupError("Please fill in all fields");
                            return;
                          }

                          if (
                            signupData.password !== signupData.confirmPassword
                          ) {
                            setSignupError("Passwords do not match");
                            return;
                          }

                          if (signupData.password.length < 6) {
                            setSignupError(
                              "Password must be at least 6 characters"
                            );
                            return;
                          }

                          setIsSigningUp(true);

                          try {
                            const response = await registerUser({
                              first_name: signupData.first_name,
                              last_name: signupData.last_name,
                              email: signupData.email,
                              username: signupData.username,
                              password: signupData.password,
                              country_Code: signupData.country_Code,
                              role: signupData.role,
                            });

                            dispatch(
                              setUser({
                                user: {
                                  ...(response as any).user,
                                  email: signupData.email,
                                  first_name: signupData.first_name,
                                  last_name: signupData.last_name,
                                  username: signupData.username,
                                },
                                token: (response as any).token,
                              })
                            );

                            navigateWithLoader("/profile/setupprofile");
                          } catch (error: any) {
                            setSignupError(
                              error?.message ||
                                "Registration failed. Please try again."
                            );
                          } finally {
                            setIsSigningUp(false);
                          }
                        }}
                        className="w-full py-3 rounded-md text-white"
                        style={{ background: currentTheme.colors.primary }}
                      >
                        {isSigningUp
                          ? "Creating Account..."
                          : "Complete Sign Up"}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer from landing page */}
      <footer className="border-t bg-black -mb-24">
        <div className="container mx-auto py-8 px-4 text-sm text-gray-400 flex items-center -mb-46 justify-between">
          <span>© {new Date().getFullYear()} Kozeo</span>
          <a
            href="#"
            className="hover:underline text-gray-400 hover:text-white transition-colors"
          >
            Contact Us
          </a>
        </div>
      </footer>
    </>
  );
}
