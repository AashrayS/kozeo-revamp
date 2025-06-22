"use client";

import { useState } from "react";
import { theme } from "../../theme";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginSignupPage() {
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  const isDark = true;
  const currentTheme = isDark ? theme.dark : theme.light;

  const [signupStep, setSignupStep] = useState(1);
  const [signupEmail, setSignupEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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
  }, [signupStep]);

  return (
    <div
      className="flex w-full h-screen overflow-hidden  md:flex-row"
      style={{
        fontFamily: currentTheme.fonts.base,
        backgroundColor: currentTheme.colors.background,
      }}
    >
      <div className="md:w-full w-full flex flex-col items-center justify-items-start md:justify-center p-6 md:p-10 text-center text-white bg-[radial-gradient(circle_at_center,_#111,_#000)] md:bg-[radial-gradient(circle_at_center,_#111,_#000)]">
        <h1
          className="font-bold mb-2 md:mb-4 text-4xl mt-16 md:mt-0 md:text-8xl"
          style={{}}
        >
          Kozeo
        </h1>
        <p className="mb-4 md:mb-6 text-sm md:text-base" style={{}}>
          Get your hands dirty with real life projects
        </p>
        <div className="w-full sm:w-[90%] md:w-1/4 h-auto relative flex flex-col items-center justify-center px-6 py-10  overflow-hidden">
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
          <div className="relative w-full min-h-[300px] overflow-hidden sm:h-auto">
            <div
              className="absolute top-0 left-0 w-full h-full flex transition-transform duration-500 ease-in-out"
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
                    placeholder="••••••••"
                    className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                    style={{
                      borderColor: currentTheme.colors.border,
                      background: currentTheme.colors.input,
                      color: currentTheme.colors.text,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    const email = (
                      document.getElementById("login-email") as HTMLInputElement
                    )?.value;
                    const password = (
                      document.getElementById(
                        "login-password"
                      ) as HTMLInputElement
                    )?.value;

                    if (email === "boobs@boobs.com" && password === "boobs") {
                      router.push("/Atrium"); // Simulate successful login
                    } else {
                      alert("Invalid credentials");
                    }
                  }}
                  className="w-full py-3 rounded-md text-white"
                  style={{ background: currentTheme.colors.primary }}
                >
                  Login
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
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
                        const valid = /\S+@\S+\.\S+/.test(signupEmail);
                        if (!valid) {
                          setEmailError("Please enter a valid email.");
                          return;
                        }
                        setEmailError("");
                        setIsSendingOtp(true);

                        // Simulate API call
                        setTimeout(() => {
                          setIsSendingOtp(false);
                          setSignupStep(2);
                          setResendCooldown(30);
                        }, 1500);
                      }}
                    >
                      {isSendingOtp ? "Sending OTP..." : "Send OTP"}
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
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="w-full py-3 rounded-md text-white"
                      style={{ background: currentTheme.colors.primary }}
                      onClick={() => {
                        if (otp == "boobs") {
                          setSignupStep(3);
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

                {signupStep === 3 && (
                  <>
                    <div>
                      <label
                        className="block w-full text-left mb-1 text-sm font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Username
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        placeholder="John Doe"
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
                        placeholder="••••••••"
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
                        placeholder="••••••••"
                        className="w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg"
                        style={{
                          borderColor: currentTheme.colors.border,
                          background: currentTheme.colors.input,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle signup logic here
                        router.push("/profile/setupprofile");
                      }}
                      className="w-full py-3 rounded-md text-white"
                      style={{ background: currentTheme.colors.primary }}
                    >
                      Complete Sign Up
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
