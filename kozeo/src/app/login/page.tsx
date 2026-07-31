"use client";

import { useState, useRef, useEffect } from "react";
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

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const Navbar = () => {
  return (
    <header className="absolute top-0 inset-x-0 z-50">
      <nav className="flex items-center justify-between px-6 sm:px-12 h-24" aria-label="Global">
        <Link href="/" className="flex items-center gap-2 text-forge-ink-muted hover:text-forge-ink transition-colors group">
          <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium tracking-wide">Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center transition-transform duration-300 hover:scale-105">
          <Image src="/kozeoLogo.png" alt="Kozeo Logo" width={32} height={32} className="rounded-full w-8 h-8" />
        </Link>
        <div className="w-24"></div> {/* Spacer for perfect centering */}
      </nav>
    </header>
  );
};

const inputClasses =
  "w-full px-4 py-3 bg-forge-bg border border-forge-line rounded-lg text-forge-ink placeholder:text-forge-ink-muted/50 text-sm transition-all duration-200 focus:outline-none focus:border-forge-ember focus:ring-1 focus:ring-forge-ember";

const labelClasses = 
  "block text-left mb-1.5 text-xs font-medium tracking-widest text-forge-ink-muted uppercase";

const primaryButtonClasses =
  "w-full py-3.5 px-4 rounded-lg bg-forge-ember text-forge-bg text-sm font-semibold transition-colors duration-200 hover:bg-forge-ember-hot active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

export default function LoginSignupPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { navigateWithLoader } = useNavigationLoader();
  const dispatch = useDispatch();
  const { theme: currentAppTheme } = useTheme();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpRef = useRef(null);
  const nameRef = useRef(null);

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
        <PageLoader duration={2000} onComplete={() => setIsLoading(false)} useSlideAnimation={false} />
      )}

      {/* Global Canvas */}
      <div className="min-h-screen bg-forge-bg text-forge-ink font-sans flex flex-col relative selection:bg-forge-ember selection:text-forge-bg overflow-x-hidden">
        
        <Navbar />

        {/* Centered Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16 z-10 relative w-full">
          
          <div className="mb-10 text-center">
            <Image
              src="/logoFial.svg"
              alt="Kozeo Full Logo"
              width={300}
              height={70}
              className="w-48 sm:w-64 h-auto brightness-0 invert opacity-90 mx-auto"
              priority
            />
          </div>

          {/* Elevated Central Card */}
          <div className="w-full max-w-[420px] bg-forge-bg-raised border border-forge-line rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Toggle Switch */}
            <div className="flex p-1 mb-8 bg-forge-bg border border-forge-line rounded-xl">
              <button
                type="button"
                onClick={() => { setShowLogin(true); setSignupStep(1); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showLogin 
                    ? "bg-forge-bg-raised text-forge-ink border border-forge-line shadow-sm" 
                    : "text-forge-ink-muted hover:text-forge-ink"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !showLogin 
                    ? "bg-forge-bg-raised text-forge-ink border border-forge-line shadow-sm" 
                    : "text-forge-ink-muted hover:text-forge-ink"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Sliding Container */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-400 ease-in-out"
                style={{ transform: `translateX(${showLogin ? "0%" : "-50%"})`, width: "200%" }}
              >
                
                { }
                {/* Login Form (Left side) */}
                <form className="w-full space-y-5 pr-2">
                  <div>
                    <label htmlFor="login-email" className={labelClasses}>Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="login-password" className={labelClasses.replace('mb-1.5', '')}>Password</label>
                      <a href="#" className="text-xs font-medium text-forge-ink-muted hover:text-forge-ink transition-colors underline-offset-4 hover:underline">Forgot?</a>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`${inputClasses} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-ink-muted hover:text-forge-ink transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {loginError && <p className="text-forge-ember-hot text-sm font-medium mt-2">{loginError}</p>}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    onClick={async (e) => {
                      e.preventDefault();
                      setLoginError("");

                      if (!loginEmail || !loginPassword) {
                        setLoginError("Please fill in all fields.");
                        return;
                      }

                      setIsLoggingIn(true);
                      try {
                        const response = await loginUser({
                          email: loginEmail,
                          password: loginPassword,
                        });
                        
                        // Using your exact login dispatch logic
                        dispatch(
                          setUser({
                            user: { ...response.user, email: loginEmail },
                            token: response.token,
                            loginEntry: true,
                          })
                        );

                        navigateWithLoader("/Atrium");
                      } catch (error) {
                        setLoginError(error?.message || "Login failed. Please try again.");
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    className={`${primaryButtonClasses} mt-4`}
                  >
                    {isLoggingIn ? "Logging in..." : "Sign In"}
                  </button>
                </form>

                { }
                {/* Signup Form (Right side) */}
                <form
                  className="w-full pl-2"
                  onSubmit={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                >
                  
                  {/* Step Indicators */}
                  {!showLogin && (
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3].map((step) => (
                        <div 
                          key={step} 
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            step < signupStep ? "bg-forge-ember" : 
                            step === signupStep ? "bg-forge-ember-hot" : "bg-forge-bg border border-forge-line"
                          }`} 
                        />
                      ))}
                    </div>
                  )}

                  {/* Step 1: Request OTP */}
                  {signupStep === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div>
                        <label className={labelClasses}>Email Address</label>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className={inputClasses}
                        />
                      </div>
                      
                      {emailError && <p className="text-forge-ember-hot text-sm font-medium">{emailError}</p>}
                      
                      <button
                        type="button"
                        disabled={isSendingOtp}
                        className={`${primaryButtonClasses} mt-4`}
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
                              setEmailError(result?.message || "Failed to send verification code.");
                            }
                          } catch (err) {
                            const errorMessage =
                              typeof err === "object" && err !== null && "message" in err
                                ? err.message
                                : "Failed to send OTP.";
                            setEmailError(errorMessage);
                          } finally {
                            setIsSendingOtp(false);
                          }
                        }}
                      >
                        {isSendingOtp ? "Sending code..." : "Continue"}
                      </button>
                    </div>
                  )}

                  {}
                  {/* Step 2: Verify OTP */}
                  {signupStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div>
                        <label className={labelClasses}>Verification Code</label>
                        <input
                          ref={otpRef}
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value);
                            setOtpError("");
                          }}
                          className={inputClasses}
                        />
                        <p className="mt-2 text-xs text-forge-ink-muted">Sent to <span className="text-forge-ink">{signupData.email}</span></p>
                      </div>
                      
                      {otpError && <p className="text-forge-ember-hot text-sm font-medium">{otpError}</p>}
                      
                      <button
                        type="button"
                        className={primaryButtonClasses}
                        onClick={async () => {
                          setOtpError("");
                          if (!otp) {
                            setOtpError("Please enter the code sent to your email.");
                            return;
                          }
                          try {
                            const res = await verifyOtp(signupData.email, otp);
                            if (res.success) {
                              setSignupStep(3);
                              setOtpError("");
                            } else {
                              setOtpError(res.message || "Invalid code.");
                            }
                          } catch (err) {
                            setOtpError(
                              typeof err === "object" && err !== null && "message" in err
                                ? err.message
                                : "Verification failed."
                            );
                          }
                        }}
                      >
                        Verify Code
                      </button>

                      <div className="flex items-center justify-between pt-2">
                         <button
                           type="button"
                           onClick={() => setSignupStep(1)}
                           className="text-sm font-medium text-forge-ink-muted hover:text-forge-ink transition-colors"
                         >
                           Change email
                         </button>
                         <button
                           type="button"
                           disabled={isSendingOtp || resendCooldown > 0}
                           onClick={async () => {
                             setIsSendingOtp(true);
                             try {
                               const res = await verifyEmail(signupData.email);
                               const result = Array.isArray(res) ? res[0] : res;
                               if (result && result.success) {
                                 setResendCooldown(30);
                               } else {
                                 setOtpError(result?.message || "Failed to resend code.");
                               }
                             } catch (err) {
                               setOtpError(
                                 typeof err === "object" && err !== null && "message" in err
                                   ? err.message
                                   : "Failed to resend code."
                               );
                             } finally {
                               setIsSendingOtp(false);
                             }
                           }}
                           className={`text-sm font-medium transition-colors ${
                             resendCooldown > 0 ? "text-forge-line cursor-default" : "text-forge-ink-muted hover:text-forge-ink"
                           }`}
                         >
                           {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                         </button>
                      </div>
                    </div>
                  )}

                  {}
                  {/* Step 3: Complete Details */}
                  {signupStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClasses}>First Name</label>
                          <input
                            ref={nameRef}
                            type="text"
                            placeholder="John"
                            value={signupData.first_name}
                            onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                        <div>
                          <label className={labelClasses}>Last Name</label>
                          <input
                            type="text"
                            placeholder="Doe"
                            value={signupData.last_name}
                            onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                            className={inputClasses}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Username</label>
                        <input
                          type="text"
                          placeholder="johndoe123"
                          value={signupData.username}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, "");
                            setSignupData({ ...signupData, username: value });
                          }}
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className={labelClasses}>Password</label>
                        <div className="relative">
                          <input
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="Minimum 6 characters"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-ink-muted hover:text-forge-ink transition-colors p-1"
                            tabIndex={-1}
                          >
                            {showSignupPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-ink-muted hover:text-forge-ink transition-colors p-1"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {signupError && <p className="text-forge-ember-hot text-sm font-medium mt-2">{signupError}</p>}

                      <button
                        type="submit"
                        disabled={isSigningUp}
                        className={`${primaryButtonClasses} mt-6`}
                        onClick={async (e) => {
                          e.preventDefault();
                          setSignupError("");

                          if (!signupData.first_name || !signupData.last_name || !signupData.username || !signupData.password) {
                            setSignupError("Please fill in all fields.");
                            return;
                          }
                          if (signupData.username.includes(" ")) {
                            setSignupError("Username cannot contain spaces.");
                            return;
                          }
                          if (signupData.password !== signupData.confirmPassword) {
                            setSignupError("Passwords do not match.");
                            return;
                          }
                          if (signupData.password.length < 6) {
                            setSignupError("Password must be at least 6 characters.");
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
                                  ...response.user,
                                  email: signupData.email,
                                  first_name: signupData.first_name,
                                  last_name: signupData.last_name,
                                  username: signupData.username,
                                },
                                token: response.token,
                                loginEntry: true,
                              })
                            );

                            navigateWithLoader("/profile/setupprofile");
                          } catch (error) {
                            setSignupError(error?.message || "Registration failed. Please try again.");
                          } finally {
                            setIsSigningUp(false);
                          }
                        }}
                      >
                        {isSigningUp ? "Creating Account..." : "Complete Sign Up"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
        
        {/* Simple Footer */}
        <footer className="w-full text-center py-6 text-sm font-medium text-forge-ink-muted">
          © {new Date().getFullYear()} Kozeo
        </footer>
      </div>
    </>
  );
}