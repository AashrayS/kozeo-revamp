"use client";

import { useState } from "react";
import { theme } from "../../theme";
import { useRef, useEffect } from "react";
import { useNavigationLoader } from "../../components/common/useNavigationLoader";
import { loginUser, registerUser } from "../../../utilities/kozeoApi";
import { setToken } from "../../../utilities/api";
import { useDispatch } from "react-redux";
import { setUser } from "../../../store/userSlice";

export default function LoginSignupPage() {
  const [showLogin, setShowLogin] = useState(true);
  const { navigateWithLoader } = useNavigationLoader();
  const dispatch = useDispatch();

  const isDark = true;
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
    console.log("Signup step changed to:", signupStep);
  }, [signupStep]);

  return (
    <div
      className="flex w-full h-screen overflow-hidden  md:flex-row"
      style={{
        fontFamily: currentTheme.fonts.base,
        backgroundColor: currentTheme.colors.background,
      }}
    >
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      <div className="md:w-full w-full flex  flex-col items-center justify-items-start md:justify-center p-6 md:p-10 text-center text-white bg-[radial-gradient(circle_at_center,_#111,_#000)] md:bg-[radial-gradient(circle_at_center,_#111,_#000)]">
        <h1
          className="font-bold mb-2 md:mb-4 text-4xl mt-16 md:mt-0 md:text-8xl"
          style={{}}
        >
         KOZEO
        </h1>
        <p className="mb-4 md:mb-6 text-sm md:text-base" style={{}}>
          Get your hands dirty with real life projects
        </p>
        <div className="w-full sm:w-[90%] md:w-1/4 h-full  border-amber-50 relative flex flex-col items-center justify-center px-6 py-10  overflow-hidden">
          <div className="flex mb-6 ">
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
          <div className="relative w-full  overflow-x-hidden sm:h-auto">
            <div
              className="   w-full h-full flex transition-transform duration-500 ease-in-out"
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
                    className="block w-full text-left mb-1 text-sm font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                    style={{
                      borderColor: currentTheme.colors.border,
                      background: currentTheme.colors.input,
                      color: currentTheme.colors.text,
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block w-full text-left mb-1 text-sm font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                    style={{
                      borderColor: currentTheme.colors.border,
                      background: currentTheme.colors.input,
                      color: currentTheme.colors.text,
                    }}
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
                      // Pass as object, not as separate args
                      const response = await loginUser({
                        email: loginEmail,
                        password: loginPassword,
                      });

                      // Save token
                      setToken((response as any).token);

                      // Save user to Redux and localStorage
                      dispatch(setUser((response as any).user));

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
              >
                {signupStep === 1 && (
                  <>
                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
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
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
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
                      onClick={() => {
                        const valid = /\S+@\S+\.\S+/.test(signupData.email);
                        if (!valid) {
                          setEmailError("Please enter a valid email.");
                          return;
                        }
                        setEmailError("");
                        setIsSendingOtp(true);

                        // Simulate sending OTP and move to step 2
                        setTimeout(() => {
                          console.log("Moving to OTP verification step");
                          setIsSendingOtp(false);
                          setSignupStep(2); // Go to OTP verification step
                          setResendCooldown(30); // Start resend cooldown
                        }, 1500);
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
                      <p className="text-xs text-gray-500 mb-2">
                        For testing, use OTP: 123123
                      </p>
                      <input
                        ref={otpRef}
                        type="text"
                        placeholder="Enter OTP (Test: 123123)"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value);
                          setOtpError(""); // Clear error when user types
                        }}
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>
                    {otpError && (
                      <p className="text-red-500 text-sm">{otpError}</p>
                    )}

                    <button
                      type="button"
                      className="w-full py-3 rounded-md text-white"
                      style={{ background: currentTheme.colors.primary }}
                      onClick={() => {
                        console.log("OTP verification attempt:", otp);
                        if (otp === "123123") {
                          console.log(
                            "OTP verified successfully, moving to step 3"
                          );
                          setSignupStep(3);
                          setOtpError("");
                        } else {
                          console.log("Invalid OTP entered");
                          setOtpError("Invalid OTP. Please use: 123123");
                        }
                      }}
                    >
                      Verify OTP
                    </button>

                    <p
                      className="text-sm mt-2 text-center"
                      style={{ color: currentTheme.colors.text }}
                    >
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

                {/* Show debug info in development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-gray-500 mt-2">
                    Current step: {signupStep}, isSendingOtp:{" "}
                    {isSendingOtp.toString()}
                  </div>
                )}

                {signupStep === 3 && (
                  <>
                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
                        First Name
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        placeholder="John"
                        value={signupData.first_name}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={signupData.last_name}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        placeholder="johndoe"
                        value={signupData.username}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            username: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
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
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
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
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
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

                        // Validation
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
                          // Pass as object, not as separate args
                          const response = await registerUser({
                            first_name: signupData.first_name,
                            last_name: signupData.last_name,
                            email: signupData.email,
                            username: signupData.username,
                            password: signupData.password,
                            country_Code: signupData.country_Code,
                            role: signupData.role,
                          });

                          // Save token
                          setToken((response as any).token);

                          // Save user to Redux and localStorage
                          dispatch(setUser((response as any).user));

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
                      {isSigningUp ? "Creating Account..." : "Complete Sign Up"}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
