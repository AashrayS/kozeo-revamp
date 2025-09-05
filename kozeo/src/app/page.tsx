"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiCode,
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiCheck,
  FiMessageCircle,
  FiVideo,
  FiEdit3,
  FiDollarSign,
  FiGithub,
  FiGitBranch,
  FiTerminal,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiZap,
  FiActivity,
  FiFolder,
  FiClock,
} from "react-icons/fi";
import { PageLoader } from "../components/common/PageLoader";

// Simple Star Animation Hook
const useParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize simple star particles
    const particleCount = 80;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const intensity = Math.random();
      return {
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5, // Smaller dots: 0.5 to 2.5px
        opacity: intensity * 0.4 + 0.1, // Subtle opacity: 0.1 to 0.5
        twinkleSpeed: Math.random() * 0.02 + 0.005, // Slow twinkling
        baseOpacity: intensity * 0.4 + 0.1,
      };
    });

    let animationFrame: number;

    const animate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Simple twinkling effect
        const time = Date.now() * particle.twinkleSpeed;
        particle.opacity = particle.baseOpacity + Math.sin(time) * 0.1;

        // Draw simple white dots
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reposition particles on resize
      particles.forEach((particle) => {
        if (particle.x > canvas.width)
          particle.x = Math.random() * canvas.width;
        if (particle.y > canvas.height)
          particle.y = Math.random() * canvas.height;
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return canvasRef;
};

// Enhanced Scroll Animation Hook
const useScrollAnimation = (threshold = 0.1) => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold,
        rootMargin: "50px 0px -100px 0px",
      }
    );

    const elements = document.querySelectorAll("[data-scroll-animation]");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [threshold]);

  const isVisible = (elementId: string) => visibleElements.has(elementId);

  return { isVisible };
};

// Enhanced Navbar Component
const Navbar = () => {
  const [isOnDarkBackground, setIsOnDarkBackground] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate scroll progress
      const progress = scrollY / (documentHeight - viewportHeight);
      setScrollProgress(Math.min(progress, 1));

      // Get all dark sections
      const heroSection = document.querySelector("#hero-section");
      const usecaseSection = document.querySelector("#usecase-section");
      const collaborationSection = document.querySelector(
        "#collaboration-section"
      );
      const resumeSection = document.querySelector("#resume-section");
      const skillForgeSection = document.querySelector("#skill-forge-section");
      const ctaSection = document.querySelector("#cta-section");

      let isOnDark = false;

      // Check if we're in any dark section
      const darkSections = [
        heroSection,
        usecaseSection,
        collaborationSection,
        resumeSection,
        skillForgeSection,
        ctaSection,
      ];

      for (const section of darkSections) {
        if (section) {
          const rect = section.getBoundingClientRect();
          // Check if navbar overlaps with this dark section
          if (rect.top <= 64 && rect.bottom >= 0) {
            // 64px is navbar height
            isOnDark = true;
            break;
          }
        }
      }

      setIsOnDarkBackground(isOnDark);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all h-16 duration-300 ease-in-out backdrop-blur-md ${
        isOnDarkBackground
          ? "bg-black/10 border-white/10"
          : "bg-white/10 border-gray-200/50"
      } `}
    >
      {/* Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      <nav
        className="flex items-center justify-between h-full relative px-4 sm:px-6 lg:px-8"
        aria-label="Global"
      >
        {/* Logo - Left side */}
        <div className="flex items-center">
          <Link
            href="/"
            className={`flex items-center font-bold tracking-tight transition-all duration-300 hover:scale-105 group ${
              isOnDarkBackground ? "text-white" : "text-black"
            }`}
            style={{
              gap: "clamp(0.5rem, 1.5vw, 1rem)",
              fontSize: "clamp(1rem, 3vw, 1.5rem)",
            }}
          >
            <div className="relative">
              <Image
                src="/kozeoLogo.png"
                alt="Kozeo Logo"
                width={32}
                height={32}
                className="transition-all duration-300 group-hover:rotate-12"
                style={{
                  width: "clamp(24px, 6vw, 36px)",
                  height: "clamp(24px, 6vw, 36px)",
                  borderRadius: "100%",
                }}
              />
              {/* Tech Orbit Animation */}
              <div
                className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ animation: "spin 8s linear infinite" }}
              />
            </div>

            {/* Terminal-style text decoration - Hidden on very small screens */}
            {/* <span className="relative hidden sm:block">
              <span className="opacity-60 text-green-400 mr-1 font-mono text-sm">
                {">"}
              </span>
              Kozeo
            </span> */}
          </Link>
        </div>

        {/* Action Buttons - Always visible */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/login"
            className={`group relative overflow-hidden rounded-full transition-all duration-300 hover:scale-105 ${
              isOnDarkBackground
                ? "border border-white/20 text-white bg-black/20 hover:bg-white hover:text-black"
                : "border border-black/20 text-black bg-white/20 hover:bg-black hover:text-white"
            }`}
            style={{
              padding:
                "clamp(0.4rem, 1.5vh, 0.6rem) clamp(0.8rem, 3vw, 1.2rem)",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
          </Link>

          <Link
            href="/login"
            className={`group relative overflow-hidden rounded-full transition-all duration-300 hover:scale-105 shadow-lg ${
              isOnDarkBackground
                ? "bg-white text-black hover:shadow-white/20"
                : "bg-black text-white hover:shadow-black/20"
            }`}
            style={{
              padding:
                "clamp(0.4rem, 1.5vh, 0.6rem) clamp(0.8rem, 3vw, 1.2rem)",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
          >
            <span className="relative z-10 flex items-center gap-1 sm:gap-2">
              <FiZap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sign Up</span>
              <span className="xs:hidden">Join</span>
            </span>
            <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500 to-cyan-500" />
          </Link>
        </div>
      </nav>
    </header>
  );
};

// Enhanced Hero Component with Engineering Focus
const Hero = () => {
  const particleCanvasRef = useParticleSystem();

  return (
    <section className="h-screen relative overflow-hidden bg-black">
      {/* Simple Star Animation Canvas */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Glow Effects - Same as Login Page */}
      <div className="absolute inset-0">
        <div className="fixed top-1/4 right-8 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
        <div className="fixed bottom-1/4 left-8 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        <div className="fixed top-2/3 right-1/3 w-2 h-0 rounded-full opacity-70 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />
      </div>

      {/* Moving Stars - Same as Login Page */}
      <div className="absolute inset-0">
        {/* Static visible stars for immediate feedback */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-70"></div>

        {/* Large Moving Stars */}
        <div
          className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full opacity-80"
          style={{ animation: "moveStars 20s linear infinite" }}
        ></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full opacity-60"
          style={{ animation: "moveStars 25s linear infinite" }}
        ></div>
        <div
          className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-70"
          style={{ animation: "moveStars 30s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full opacity-90"
          style={{ animation: "moveStars 18s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full opacity-75"
          style={{ animation: "moveStars 35s linear infinite" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-85"
          style={{ animation: "moveStars 22s linear infinite" }}
        ></div>

        {/* Medium Moving Stars */}
        <div
          className="absolute top-32 right-40 w-0.5 h-0.5 bg-white rounded-full opacity-60"
          style={{ animation: "moveStars 28s linear infinite" }}
        ></div>
        <div
          className="absolute top-52 left-16 w-0.5 h-0.5 bg-white rounded-full opacity-50"
          style={{ animation: "moveStars 32s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-70"
          style={{ animation: "moveStars 26s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-55"
          style={{ animation: "moveStars 38s linear infinite" }}
        ></div>
        <div
          className="absolute top-1/2 left-8 w-0.5 h-0.5 bg-white rounded-full opacity-65"
          style={{ animation: "moveStars 24s linear infinite" }}
        ></div>

        {/* Small Moving Stars */}
        <div
          className="absolute top-24 left-1/2 w-px h-px bg-white opacity-40"
          style={{ animation: "moveStars 40s linear infinite" }}
        ></div>
        <div
          className="absolute top-48 right-16 w-px h-px bg-white opacity-30"
          style={{ animation: "moveStars 45s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-48 left-40 w-px h-px bg-white opacity-45"
          style={{ animation: "moveStars 33s linear infinite" }}
        ></div>
        <div
          className="absolute bottom-24 right-1/2 w-px h-px bg-white opacity-35"
          style={{ animation: "moveStars 42s linear infinite" }}
        ></div>
        <div
          className="absolute top-2/3 right-8 w-px h-px bg-white opacity-40"
          style={{ animation: "moveStars 36s linear infinite" }}
        ></div>
      </div>

      {/* Main Content */}
      <div
        className="relative h-full flex items-center justify-center sm:justify-start px-4 z-20"
        style={{
          paddingTop: "clamp(40px, 6vh, 100px)",
          paddingLeft: "clamp(1rem, 2vw, 2rem) clamp(1rem, 8vw, 8rem)",
        }}
      >
        <div
          className="max-w-full text-center sm:text-left  border-white ml-0 lg:ml-24"
          style={{ maxWidth: "min(90vw, 700px)" }}
        >
          {/* Terminal-style Header */}
          {/* <div className="font-mono text-green-400 text-sm mb-6 opacity-80">
            kozeo@terminal:~$ init project --type=career-growth
          </div> */}

          {/* Enhanced Logo with Glitch Effect */}
          <div className="flex items-center justify-center sm:justify-start w-full ml-0 lg:-ml-14 mb-8 group">
            <div className="relative">
              <Image
                src="/logoFial.svg"
                alt="Kozeo Full Logo"
                width={625}
                height={147}
                className="transition-all duration-500 group-hover:scale-105"
                style={{
                  width: "clamp(240px, 45vw, 500px)",
                  height: "auto",
                  maxWidth: "90vw",
                  filter:
                    "brightness(0) invert(1) drop-shadow(0 0 20px rgba(139,92,246,0.5))",
                }}
                priority
              />
              {/* Glitch overlay effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <Image
                  src="/logoFial.svg"
                  alt="Kozeo Full Logo"
                  width={625}
                  height={147}
                  style={{
                    width: "clamp(240px, 45vw, 500px)",
                    height: "auto",
                    maxWidth: "90vw",
                    filter: "brightness(0) invert(1) hue-rotate(180deg)",
                    transform: "translate(2px, 2px)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Typewriter Title */}
          <h1
            className="font-bold leading-tight text-center sm:text-left hero-title relative"
            style={{
              fontSize: "clamp(2rem, 6vw, 4rem)",
              marginBottom: "clamp(1.5rem, 4vh, 3rem)",
              lineHeight: "1.1",
              background: "white",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <span className="block">Real Projects</span>
            <span className="block">Real People</span>
            <span className="block text-white/90 ">Real Impact</span>
          </h1>

          {/* Enhanced Subtitle with Code Syntax */}
          <div className="mb-8">
            {/* <div className="font-mono text-gray-400 text-sm mb-2">
              // Professional growth through real-world projects
            </div> */}
            <p
              className="text-gray-300 leading-relaxed text-center sm:text-left"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                maxWidth: "min(90vw, 600px)",
                lineHeight: "1.6",
              }}
            >
              Transform your coding skills into a powerful portfolio. Every line
              of code, every project, every collaboration on Kozeo builds toward
              your next career milestone .
            </p>
          </div>

          {/* Subtle Action Buttons - Dark Theme */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4"
            style={{ gap: "clamp(1rem, 3vw, 1.5rem)" }}
          >
            <Link
              href="/login"
              className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/30 text-center"
              style={{
                padding: "clamp(1rem, 2.5vh, 1.25rem) clamp(2rem, 5vw, 2.5rem)",
                fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                minWidth: "clamp(180px, 30vw, 220px)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FiTerminal className="w-5 h-5" />
                git init career
              </span>
              <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>

            <Link
              href="/login"
              className="group relative overflow-hidden bg-black/40 backdrop-blur-sm border border-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-black/60 hover:text-white hover:border-gray-600 transition-all duration-300 hover:scale-105 text-center"
              style={{
                padding: "clamp(1rem, 2.5vh, 1.25rem) clamp(2rem, 5vw, 2.5rem)",
                fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                minWidth: "clamp(160px, 28vw, 200px)",
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FiGitBranch className="w-5 h-5" />
                npm start project
              </span>
            </Link>
          </div>

          {/* Status Bar */}
          {/* <div className="mt-8 font-mono text-xs text-gray-500 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live: 2,847 developers online
            </span>
            <span className="flex items-center gap-1">
              <FiActivity className="w-3 h-3" />
              342 projects active
            </span>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { isVisible } = useScrollAnimation();
  const [isLoading, setIsLoading] = useState(true);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kozeo",
    url: "/",
    description:
      "Kozeo is a professional networking platform designed to help you build meaningful career connections.",
  };

  return (
    <>
      {isLoading && (
        <PageLoader
          duration={2500}
          onComplete={() => setIsLoading(false)}
          useSlideAnimation={true}
        />
      )}

      <div
        className={`transition-opacity duration-1000 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Navbar />
        <main className="pb-20 lg:pb-0">
          <div
            id="hero-section"
            data-scroll-animation
            className={`transition-all duration-1000 ease-out ${
              isVisible("hero-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Hero />
          </div>

          {/* What You Can Do Section */}
          <section
            id="collaboration-section"
            data-scroll-animation
            className={`bg-black text-white transition-all duration-1000 ease-out ${
              isVisible("collaboration-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(4rem, 10vh, 8rem) 0" }}
          >
            {/* Glow Effects */}
            <div className="absolute top-1/4 left-8 w-2 h-0 rounded-full opacity-80 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-8 w-2 h-0 rounded-full opacity-80 bg-blue-500 shadow-[0_0_200px_80px_rgba(59,130,246,0.25)] pointer-events-none z-0" />

            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(4rem, 8vh, 6rem)" }}
              >
                <h2
                  className="font-bold leading-tight text-transparent bg-clip-text bg-white from-white via-purple-400 to-cyan-400"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  What you can do on Kozeo
                </h2>
                <p
                  className="text-gray-300 mx-auto leading-relaxed"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    maxWidth: "min(90vw, 800px)",
                    lineHeight: "1.7",
                  }}
                >
                  Kozeo is designed to help you build a meaningful portfolio
                  while earning. Every project contributes to your professional
                  growth and resume enhancement.
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                style={{
                  gap: "clamp(2rem, 5vw, 3rem)",
                }}
              >
                {/* Enhanced Feature Cards */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiCode
                        className="text-white"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-white mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Work on Real Projects
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Take on projects from startups, NGOs, and growing
                      businesses. Build{" "}
                      <span className="text-white">real-world experience</span>{" "}
                      that enhances your portfolio and resume.
                    </p>
                  </div>
                </div>

                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiUsers
                        className="text-white"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-white mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Find collaboraters
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Find developers or join interesting projects and work with
                      other developers. Develop{" "}
                      <span className="text-white">teamwork skills</span> that
                      are essential in professional environments.
                    </p>
                  </div>
                </div>

                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl md:col-span-2 lg:col-span-1"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiDollarSign
                        className="text-white"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-white mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Earn While Learning
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Get paid for your contributions while building valuable
                      experience.
                      <span className="text-white">
                        Installment based payments
                      </span>{" "}
                      ensures you get paid for your work properly.
                    </p>
                  </div>
                </div>

                {/* Additional Feature: Build Portfolio */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiStar
                        className="text-white"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-white mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Build Your Portfolio
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Every completed project becomes part of your professional
                      portfolio.
                      <span className="text-white">
                        Showcase your abilities
                      </span>{" "}
                      to potential employers.
                    </p>
                  </div>
                </div>

                {/* Discussion Rooms Feature */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiMessageCircle
                        className="text-white"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-white mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Join Discussion Rooms
                    </h3>
                    <p
                      className="text-gray-400 leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Connect with the community through specialized discussion
                      rooms for{" "}
                      <span className="text-white">
                        referrals, job opportunities, coding contests
                      </span>{" "}
                      and more. Build your professional network and get support
                      from fellow developers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Call to Action */}
              <div
                className="text-center"
                style={{ marginTop: "clamp(4rem, 8vh, 6rem)" }}
              >
                <p
                  className="text-gray-300 mb-8"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                    lineHeight: "1.6",
                  }}
                >
                  Join thousands of developers already building their future on
                  Kozeo.
                </p>

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/15 hover:border-white/30 relative overflow-hidden"
                  style={{
                    padding:
                      "clamp(1rem, 2.5vh, 1.25rem) clamp(2rem, 5vw, 3rem)",
                    fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Building Your Future
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </div>
            </div>
          </section>

          {/* Collaboration Features Section */}
          <section
            id="collaboration-section"
            data-scroll-animation
            className={`bg-black text-white transition-all duration-1000 ease-out ${
              isVisible("collaboration-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(4rem, 10vh, 8rem) 0" }}
          >
            {/* Glow Effects */}
            <div className="absolute top-1/4 left-8 w-2 h-0 rounded-full opacity-80 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-8 w-2 h-0 rounded-full opacity-80 bg-blue-500 shadow-[0_0_200px_80px_rgba(59,130,246,0.25)] pointer-events-none z-0" />

            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(4rem, 8vh, 6rem)" }}
              >
                <h2
                  className="font-bold leading-tight text-white"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Built for Seamless Collaboration
                </h2>
                <p
                  className="text-gray-400 mx-auto leading-relaxed"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    maxWidth: "min(90vw, 800px)",
                    lineHeight: "1.7",
                  }}
                >
                  Experience next-generation collaboration tools designed to
                  make remote teamwork as natural as being in the same room.
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                style={{
                  gap: "clamp(2rem, 5vw, 3rem)",
                }}
              >
                {/* Chat Interface */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiMessageCircle
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-white mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    Intuitive Chat Interface
                  </h3>
                  <p
                    className="text-gray-400 leading-relaxed"
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      lineHeight: "1.6",
                    }}
                  >
                    Real-time messaging with code sharing, file attachments, and
                    smart notifications. Stay connected with your team and never
                    miss important updates.
                  </p>
                </div>

                {/* Video Call Feature */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiVideo
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-white mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    HD Video Calls
                  </h3>
                  <p
                    className="text-gray-400 leading-relaxed"
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      lineHeight: "1.6",
                    }}
                  >
                    Crystal-clear video conferences with screen sharing,
                    recording, and breakout rooms. Perfect for standups, code
                    reviews, and brainstorming sessions.
                  </p>
                </div>

                {/* Collabboard */}
                <div
                  className="bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl md:col-span-2 lg:col-span-1"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-black rounded-full mb-4 flex items-center justify-center border border-gray-700"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiEdit3
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-white mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    CollabBoard
                  </h3>
                  <p
                    className="text-gray-400 leading-relaxed"
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1rem)",
                      lineHeight: "1.6",
                    }}
                  >
                    Interactive whiteboard for visual collaboration. Draw
                    diagrams, create flowcharts, and brainstorm ideas together
                    in real-time with unlimited canvas space.
                  </p>
                </div>
              </div>

              {/* Additional Features Grid */}
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{
                  gap: "clamp(2rem, 5vw, 3rem)",
                  marginTop: "clamp(3rem, 6vh, 4rem)",
                }}
              >
                {/* Project Management */}
                <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-black rounded-lg p-3 border border-gray-700">
                      <FiCheck className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-lg">
                        Integrated Project Management (Upcoming)
                      </h4>
                      <p className="text-gray-400 leading-relaxed">
                        Task tracking, milestone management, and progress
                        visualization built right into your collaboration
                        workspace.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code Collaboration */}
                <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-black rounded-lg p-3 border border-gray-700">
                      <FiCode className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-lg">
                        Live Code Collaboration (Upcoming)
                      </h4>
                      <p className="text-gray-400 leading-relaxed">
                        Real-time code editing, syntax highlighting, and version
                        control integration for seamless development workflows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Proposition Section */}
          <section
            id="value-section"
            data-scroll-animation
            className={`bg-stone-50 transition-all duration-1000 ease-out ${
              isVisible("value-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >
            <div
              className="max-w-6xl mx-auto"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(3rem, 8vh, 5rem)" }}
              >
                <h2
                  className="font-normal leading-tight text-black"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Profile &gt; Money
                </h2>
                <p
                  className="text-gray-600 mx-auto"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    maxWidth: "min(90vw, 750px)",
                    lineHeight: "1.6",
                  }}
                >
                  Kozeo transforms project culture into career growth. Unlike
                  traditional platforms that focus only on task completion,
                  every project on Kozeo contributes to your tech portfolio and
                  professional identity.
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-3"
                style={{
                  gap: "clamp(2rem, 5vw, 3rem)",
                  marginTop: "clamp(3rem, 6vh, 5rem)",
                }}
              >
                <div
                  className="text-center"
                  style={{ padding: "clamp(0.5rem, 2vh, 1rem)" }}
                >
                  <div
                    className="bg-black rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiCode
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                      marginBottom: "clamp(0.75rem, 2vh, 1rem)",
                    }}
                  >
                    Profile-First Approach
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      lineHeight: "1.5",
                    }}
                  >
                    Every project builds your credible tech portfolio with
                    real-world projects from startups and NGOs.
                  </p>
                </div>

                <div
                  className="text-center"
                  style={{ padding: "clamp(0.5rem, 2vh, 1rem)" }}
                >
                  <div
                    className="bg-black rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiTrendingUp
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                      marginBottom: "clamp(0.75rem, 2vh, 1rem)",
                    }}
                  >
                    Resume-Enhancing Work
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      lineHeight: "1.5",
                    }}
                  >
                    Collaborative projects that develop communication,
                    leadership, and technical skills employers value.
                  </p>
                </div>

                <div
                  className="text-center"
                  style={{ padding: "clamp(0.5rem, 2vh, 1rem)" }}
                >
                  <div
                    className="bg-black rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiUsers
                      className="text-white"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                      marginBottom: "clamp(0.75rem, 2vh, 1rem)",
                    }}
                  >
                    Impact-Driven Projects
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      lineHeight: "1.5",
                    }}
                  >
                    Work on meaningful projects that create real value while
                    building proof of your domain expertise.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Resume Enhancement Section */}
          <section
            id="resume-section"
            data-scroll-animation
            className={`bg-black transition-all duration-1000 ease-out ${
              isVisible("resume-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >
            {/* Glow Effects */}
            <div className="absolute top-1/4 left-8 w-2 h-0 rounded-full opacity-80 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-8 w-2 h-0 rounded-full opacity-80 bg-blue-500 shadow-[0_0_200px_80px_rgba(59,130,246,0.25)] pointer-events-none z-0" />

            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Image Side - Shows first on mobile */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      className="bg-white  shadow-2xl p-6 lg:transform lg:rotate-3 lg:hover:rotate-0 transition-transform duration-300"
                      style={{
                        maxWidth: "clamp(280px, 50vw, 400px)",
                        width: "100%",
                      }}
                    >
                      <Image
                        src="/Resume.jpg"
                        alt="Resume with Kozeo profile integration"
                        className="w-full h-auto "
                        width={400}
                        height={600}
                        style={{
                          aspectRatio: "3/4",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Floating badge */}
                    {/* <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300">
                       Stand Out
                    </div> */}
                  </div>
                </div>

                {/* Content Side - Shows second on mobile */}
                <div className="order-2 lg:order-1">
                  <h2
                    className="font-normal leading-tight text-white text-center lg:text-left"
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 4rem)",
                      marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                    }}
                  >
                    Showcase Your
                    <br />
                    <span className="text-white">Kozeo Journey</span>
                  </h2>

                  <p
                    className="text-gray-300 mb-8"
                    style={{
                      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                      lineHeight: "1.6",
                      marginBottom: "clamp(2rem, 4vh, 2.5rem)",
                    }}
                  >
                    Stand out to recruiters by showcasing your real-world
                    project experience. Add your Kozeo profile URL and project
                    details directly to your resume.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-black text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          Include Your Kozeo Profile URL
                        </h3>
                        <p className="text-gray-400">
                          Add your personalized Kozeo profile link to let
                          recruiters explore your complete project portfolio and
                          professional achievements.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-black text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          Highlight Your Projects
                        </h3>
                        <p className="text-gray-400">
                          List specific projects you've completed through Kozeo,
                          showcasing the real-world impact of your technical
                          skills and problem-solving abilities.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-black text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          Demonstrate Proven Experience
                        </h3>
                        <p className="text-gray-400">
                          Show recruiters that you've worked on real projects
                          with actual organizations, not just theoretical
                          exercises or personal hobby projects.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skill Forge Section */}
          <section
            id="skill-forge-section"
            data-scroll-animation
            className={`bg-black text-white transition-all duration-1000 ease-out ${
              isVisible("skill-forge-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >
            {/* Glow Effects */}
            <div className="absolute top-1/4 left-8 w-2 h-0 rounded-full opacity-80 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />
            <div className="absolute bottom-1/4 right-8 w-2 h-0 rounded-full opacity-80 bg-blue-500 shadow-[0_0_200px_80px_rgba(59,130,246,0.25)] pointer-events-none z-0" />

            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(3rem, 8vh, 4rem)" }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{ marginBottom: "clamp(1rem, 3vh, 1.5rem)" }}
                >
                  {/* <FiStar
                    className="text-yellow-500 mr-2"
                    style={{
                      width: "clamp(1.5rem, 4vw, 2rem)",
                      height: "clamp(1.5rem, 4vw, 2rem)",
                    }}
                  /> */}
                  <span
                    className="bg-white/10 text-white font-medium rounded-full border border-white/20"
                    style={{
                      fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                      padding:
                        "clamp(0.25rem, 1vh, 0.375rem) clamp(0.75rem, 2vw, 1rem)",
                    }}
                  >
                    Skill Forge
                  </span>
                </div>
                <h2
                  className="font-normal leading-tight text-white"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Free Learning Opportunities
                </h2>
                <p
                  className="text-gray-300 mx-auto"
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                    maxWidth: "min(90vw, 750px)",
                    lineHeight: "1.6",
                  }}
                >
                  Discover projects marked as "Skill Forge" - free opportunities
                  to learn, practice, and build your portfolio without any
                  payment commitments.
                </p>
              </div>

              <div
                className="grid md:grid-cols-2 items-center"
                style={{ gap: "clamp(3rem, 6vw, 4rem)" }}
              >
                <div>
                  <h3
                    className="font-semibold text-white"
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      marginBottom: "clamp(1.5rem, 3vh, 2rem)",
                    }}
                  >
                    Perfect for:
                  </h3>
                  <ul
                    className="space-y-4"
                    style={{ gap: "clamp(1rem, 2vh, 1.5rem)" }}
                  >
                    {[
                      "Students learning new technologies",
                      "Developers switching to new frameworks",
                      "Anyone wanting to contribute to open source",
                      "Building a portfolio with real projects",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center"
                        style={{
                          fontSize: "clamp(0.875rem, 2vw, 1rem)",
                          marginBottom: "clamp(0.75rem, 2vh, 1rem)",
                        }}
                      >
                        <FiCheck
                          className="text-white mr-3 flex-shrink-0"
                          style={{
                            width: "clamp(1rem, 2.5vw, 1.25rem)",
                            height: "clamp(1rem, 2.5vw, 1.25rem)",
                          }}
                        />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-black border border-gray-800 shadow-lg">
                  {/* Header with badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-xs font-medium text-white uppercase tracking-wider">
                        Available Now
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                      <span className="text-xs font-semibold text-white">
                        Skill Forge
                      </span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h4 className="text-lg font-bold text-white mb-3">
                    TaskFlow Pro
                  </h4>

                  {/* Project Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Collaborative task management platform with real-time
                    updates, drag-and-drop interface, and team synchronization.
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["React", "TypeScript", "Node.js", "WebSocket"].map(
                        (tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white font-medium"
                          >
                            {tech}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>4-6 weeks</span>
                      <span>•</span>
                      <span>3-5 developers</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        Portfolio + Certificate
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}

          <section
            id="features-section"
            data-scroll-animation
            className={`py-24 bg-gray-50 transition-all duration-1000 ease-out ${
              isVisible("features-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-6xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-normal leading-tight text-black mb-8">
                  Why choose Kozeo?
                </h2>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:grid grid-cols-3 gap-0">
                  <div className="p-6 font-semibold text-gray-500 bg-gray-50">
                    Feature
                  </div>
                  <div className="p-6 font-semibold text-center bg-black text-white">
                    Kozeo
                  </div>
                  <div className="p-6 font-semibold text-center">
                    Traditional Platforms
                  </div>

                  <div className="p-6 border-t">Profile-First Approach</div>
                  <div className="p-6 border-t text-center bg-green-50 text-green-600 font-medium">
                    ✓
                  </div>
                  <div className="p-6 border-t text-center text-red-500">✗</div>

                  <div className="p-6 border-t">Resume-Enhancing Work</div>
                  <div className="p-6 border-t text-center bg-green-50 text-green-600 font-medium">
                    ✓
                  </div>
                  <div className="p-6 border-t text-center text-red-500">✗</div>

                  <div className="p-6 border-t">
                    No Upfront Cost for Posters
                  </div>
                  <div className="p-6 border-t text-center bg-green-50 text-green-600 font-medium">
                    ✓
                  </div>
                  <div className="p-6 border-t text-center text-red-500">✗</div>

                  <div className="p-6 border-t">Proof of Domain Expertise</div>
                  <div className="p-6 border-t text-center bg-green-50 text-green-600 font-medium">
                    ✓
                  </div>
                  <div className="p-6 border-t text-center text-red-500">✗</div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {[
                    "Profile-First Approach",
                    "Resume-Enhancing Work",
                    "No Upfront Cost for Posters",
                    "Proof of Domain Expertise",
                  ].map((feature, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {feature}
                      </h3>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-sm font-medium text-gray-600 mb-1">
                            Kozeo
                          </span>
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              ✓
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-sm font-medium text-gray-600 mb-1">
                            Traditional
                          </span>
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              ✗
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Comparison */}
          <section
            id="cta-section"
            data-scroll-animation
            data-section="cta"
            className={`bg-black text-white py-12 sm:py-16 md:py-24 transition-all duration-1000 ease-out ${
              isVisible("cta-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight mb-4 sm:mb-6 md:mb-8">
                Ready to build your
                <br />
                tech portfolio?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto">
                Join the movement that's making freelancing purposeful and
                profile development structured.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] w-fit"
                >
                  Start Building Your Profile
                </Link>
                <Link
                  href="/login"
                  className="border border-white text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] w-fit"
                >
                  Post a Project
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t">
          <div className="container mx-auto py-8 px-4 text-sm text-gray-600 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Kozeo</span>
            <a href="/" className="hover:underline">
              Contact Us
            </a>
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </div>
    </>
  );
}
