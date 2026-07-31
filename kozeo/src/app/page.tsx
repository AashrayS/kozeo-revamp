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
      className={`fixed top-0 inset-x-0 z-50 transition-all h-16 duration-300 ease-in-out  ${
        isOnDarkBackground
          ? "bg-forge-bg/10 border-forge-line"
          : "bg-forge-bg/10 border-forge-line/50"
      } `}
    >
      {/* Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-[1px] bg-forge-ember transition-all duration-300"
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
              isOnDarkBackground ? "text-forge-ink" : "text-forge-ink"
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
                className="absolute inset-0 rounded-sm border border-forge-ember/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ animation: "spin 8s linear infinite" }}
              />
            </div>

            {/* Terminal-style text decoration - Hidden on very small screens */}
            {/* <span className="relative hidden sm:block">
              <span className="opacity-60 text-forge-ember mr-1 font-mono text-sm">
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
                ? "border border-forge-line text-forge-ink bg-forge-bg/20 hover:bg-forge-bg hover:text-forge-ink"
                : "border border-black/20 text-forge-ink bg-forge-bg/20 hover:bg-forge-bg hover:text-forge-ink"
            }`}
            style={{
              padding:
                "clamp(0.4rem, 1.5vh, 0.6rem) clamp(0.8rem, 3vw, 1.2rem)",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-forge-bg from-purple-500/20 to-cyan-500/20" />
          </Link>

          <Link
            href="/login"
            className={`group relative overflow-hidden rounded-full transition-all duration-300 hover:scale-105 shadow-[0_4px_20px_rgba(21,18,13,0.5)] ${
              isOnDarkBackground
                ? "bg-forge-bg text-forge-ink hover:shadow-white/20"
                : "bg-forge-bg text-forge-ink hover:shadow-black/20"
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
            <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-forge-bg from-purple-500 to-cyan-500" />
          </Link>
        </div>
      </nav>
    </header>
  );
};

// Deterministic pseudo-random per index — same output on server and client, no hydration mismatch
const seeded = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const EMBER_COLS = 40;
const EMBER_ROWS = 7;

const EmberField = () => {
  const cells = Array.from({ length: EMBER_COLS * EMBER_ROWS });
  return (
    <div className="ember-field" aria-hidden="true">
      {cells.map((_, i) => {
        const lit = seeded(i) > 0.74;
        const delay = (seeded(i + 137) * 7).toFixed(2);
        const duration = (4 + seeded(i + 271) * 5).toFixed(2);
        return (
          <span
            key={i}
            className={lit ? "ember-cell ember-cell--lit" : "ember-cell"}
            style={lit ? { animationDelay: `${delay}s`, animationDuration: `${duration}s` } : undefined}
          />
        );
      })}
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-forge-bg min-h-screen flex items-center pt-16">
      {/* Grain, not a blur blob — gives the dark field texture instead of looking flat/AI-smooth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Signature element: a commit/contribution field that heats up like coals — this replaces the old glass card */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] sm:h-[38%]">
        <EmberField />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-3xl">
          <p
            className="uppercase text-forge-ember mb-6"
            style={{
              fontFamily: "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace",
              fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
              letterSpacing: "0.2em",
            }}
          >
            Open projects — startups &amp; passion projects
          </p>

          <h1
            className="text-forge-ink mb-8"
            style={{
              fontFamily: "'Fraunces', ui-serif, Georgia, serif",
              fontWeight: 500,
              fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
            }}
          >
            Code that
            <br />
            outlives the
            <br />
            <span className="italic text-forge-ember">sprint.</span>
          </h1>

          <p
            className="text-forge-ink-muted mb-10 max-w-xl"
            style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.7 }}
          >
            Kozeo pairs developers with real startups and other developers building real
            software. Ship the work, keep the proof, get paid along the way.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-sm bg-forge-ink text-forge-bg font-medium transition-all duration-300 hover:bg-forge-ember hover:text-forge-bg"
              style={{ fontSize: "clamp(0.9rem, 1.4vw, 1rem)" }}
            >
              Browse open projects
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-sm border border-forge-line text-forge-ink-muted transition-all duration-300 hover:border-forge-ember hover:text-forge-ember"
              style={{ fontSize: "clamp(0.9rem, 1.4vw, 1rem)" }}
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ember-field {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(${EMBER_COLS}, 1fr);
          grid-template-rows: repeat(${EMBER_ROWS}, 1fr);
          gap: 3px;
          mask-image: linear-gradient(to bottom, transparent, black 55%, black 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 55%, black 100%);
        }
        .ember-cell {
          background: color-mix(in srgb, var(--forge-ink) 3%, transparent);
          border-radius: 1px;
        }
        .ember-cell--lit {
          background: var(--forge-ember-low);
          animation: emberPulse ease-in-out infinite;
        }
        @keyframes emberPulse {
          0%, 100% { background: var(--forge-ember-low); opacity: 0.55; }
          50% { background: var(--forge-ember); opacity: 1; box-shadow: 0 0 5px 0px color-mix(in srgb, var(--forge-ember) 40%, transparent); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ember-cell--lit { animation: none; background: var(--forge-ember); opacity: 0.8; }
        }
      `}</style>
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
            className={`bg-forge-bg text-forge-ink transition-all duration-1000 ease-out ${
              isVisible("collaboration-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(4rem, 10vh, 8rem) 0" }}
          >
            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(4rem, 8vh, 6rem)" }}
              >
                <h2
                  className="font-normal leading-tight text-forge-ink"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  What you can do on Kozeo
                </h2>
                <p
                  className="text-forge-ink mx-auto leading-relaxed"
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
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiCode
                        className="text-forge-ink"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-forge-ink mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Work on Real Projects
                    </h3>
                    <p
                      className="text-forge-ink-muted leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Take on projects from startups, NGOs, and growing
                      businesses. Build{" "}
                      <span className="text-forge-ink">real-world experience</span>{" "}
                      that enhances your portfolio and resume.
                    </p>
                  </div>
                </div>

                <div
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiUsers
                        className="text-forge-ink"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-forge-ink mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Find collaboraters
                    </h3>
                    <p
                      className="text-forge-ink-muted leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Find developers or join interesting projects and work with
                      other developers. Develop{" "}
                      <span className="text-forge-ink">teamwork skills</span> that
                      are essential in professional environments.
                    </p>
                  </div>
                </div>

                <div
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] md:col-span-2 lg:col-span-1"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiDollarSign
                        className="text-forge-ink"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-forge-ink mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Earn While Learning
                    </h3>
                    <p
                      className="text-forge-ink-muted leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Get paid for your contributions while building valuable
                      experience.
                      <span className="text-forge-ink">
                        Installment based payments
                      </span>{" "}
                      ensures you get paid for your work properly.
                    </p>
                  </div>
                </div>

                {/* Additional Feature: Build Portfolio */}
                <div
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiStar
                        className="text-forge-ink"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-forge-ink mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Build Your Portfolio
                    </h3>
                    <p
                      className="text-forge-ink-muted leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Every completed project becomes part of your professional
                      portfolio.
                      <span className="text-forge-ink">
                        Showcase your abilities
                      </span>{" "}
                      to potential employers.
                    </p>
                  </div>
                </div>

                {/* Discussion Rooms Feature */}
                <div
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div className="relative z-10">
                    <div
                      className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                      style={{
                        width: "clamp(3rem, 8vw, 4rem)",
                        height: "clamp(3rem, 8vw, 4rem)",
                      }}
                    >
                      <FiMessageCircle
                        className="text-forge-ink"
                        style={{
                          width: "clamp(1.5rem, 4vw, 2rem)",
                          height: "clamp(1.5rem, 4vw, 2rem)",
                        }}
                      />
                    </div>

                    <h3
                      className="font-semibold text-forge-ink mb-3"
                      style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)" }}
                    >
                      Join Discussion Rooms
                    </h3>
                    <p
                      className="text-forge-ink-muted leading-relaxed"
                      style={{
                        fontSize: "clamp(0.9rem, 2vw, 1rem)",
                        lineHeight: "1.6",
                      }}
                    >
                      Connect with the community through specialized discussion
                      rooms for{" "}
                      <span className="text-forge-ink">
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
                  className="text-forge-ink mb-8"
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
                  className="group inline-flex items-center gap-3 bg-forge-bg/10  border border-forge-line text-forge-ink font-semibold rounded-sm transition-all duration-300 hover:transform hover:scale-105 hover:bg-forge-bg/15 hover:border-forge-line/30 relative overflow-hidden"
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
                  <div className="absolute inset-0 bg-forge-bg/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              </div>
            </div>
          </section>

          {/* Collaboration Features Section */}
          <section
            id="collaboration-section"
            data-scroll-animation
            className={`bg-forge-bg text-forge-ink transition-all duration-1000 ease-out ${
              isVisible("collaboration-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(4rem, 10vh, 8rem) 0" }}
          >


            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div
                className="text-center"
                style={{ marginBottom: "clamp(4rem, 8vh, 6rem)" }}
              >
                <h2
                  className="font-bold leading-tight text-forge-ink"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Built for Seamless Collaboration
                </h2>
                <p
                  className="text-forge-ink-muted mx-auto leading-relaxed"
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
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiMessageCircle
                      className="text-forge-ink"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-forge-ink mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    Intuitive Chat Interface
                  </h3>
                  <p
                    className="text-forge-ink-muted leading-relaxed"
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
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiVideo
                      className="text-forge-ink"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-forge-ink mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    HD Video Calls
                  </h3>
                  <p
                    className="text-forge-ink-muted leading-relaxed"
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
                  className="bg-forge-bg/80  border border-forge-line rounded-sm hover:border-forge-line transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] md:col-span-2 lg:col-span-1"
                  style={{ padding: "clamp(1.5rem, 4vh, 2rem)" }}
                >
                  <div
                    className="bg-forge-bg rounded-full mb-4 flex items-center justify-center border border-forge-line"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiEdit3
                      className="text-forge-ink"
                      style={{
                        width: "clamp(1.5rem, 4vw, 2rem)",
                        height: "clamp(1.5rem, 4vw, 2rem)",
                      }}
                    />
                  </div>
                  <h3
                    className="font-semibold text-forge-ink mb-3"
                    style={{
                      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
                    }}
                  >
                    CollabBoard
                  </h3>
                  <p
                    className="text-forge-ink-muted leading-relaxed"
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
                <div className="bg-forge-bg/60  border border-forge-line rounded-sm p-6 hover:border-forge-line transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-forge-bg rounded-sm p-3 border border-forge-line">
                      <FiCheck className="text-forge-ink w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-forge-ink mb-2 text-lg">
                        Integrated Project Management (Upcoming)
                      </h4>
                      <p className="text-forge-ink-muted leading-relaxed">
                        Task tracking, milestone management, and progress
                        visualization built right into your collaboration
                        workspace.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code Collaboration */}
                <div className="bg-forge-bg/60  border border-forge-line rounded-sm p-6 hover:border-forge-line transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-forge-bg rounded-sm p-3 border border-forge-line">
                      <FiCode className="text-forge-ink w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-forge-ink mb-2 text-lg">
                        Live Code Collaboration (Upcoming)
                      </h4>
                      <p className="text-forge-ink-muted leading-relaxed">
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
            className={`bg-forge-bg transition-all duration-1000 ease-out ${
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
                  className="font-normal leading-tight text-forge-ink"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Profile &gt; Money
                </h2>
                <p
                  className="text-forge-ink-muted mx-auto"
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
                    className="bg-forge-bg rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiCode
                      className="text-forge-ink"
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
                    className="text-forge-ink-muted"
                    style={{
                      fontSize: "clamp(0.875rem, 2vw, 1rem)",
                      lineHeight: "1.5",
                    }}
                  >
                    Every project builds your credible tech portfolio with
                    real-world projects from startups and weekend projects.
                  </p>
                </div>

                <div
                  className="text-center"
                  style={{ padding: "clamp(0.5rem, 2vh, 1rem)" }}
                >
                  <div
                    className="bg-forge-bg rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiTrendingUp
                      className="text-forge-ink"
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
                    className="text-forge-ink-muted"
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
                    className="bg-forge-bg rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      width: "clamp(3rem, 8vw, 4rem)",
                      height: "clamp(3rem, 8vw, 4rem)",
                    }}
                  >
                    <FiUsers
                      className="text-forge-ink"
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
                    className="text-forge-ink-muted"
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
            className={`bg-forge-bg transition-all duration-1000 ease-out ${
              isVisible("resume-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >


            <div
              className="max-w-6xl mx-auto relative z-10"
              style={{ padding: "0 clamp(1rem, 4vw, 2rem)" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                {/* Image Side - Shows first on mobile */}
                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                  <div className="relative">
                    <div
                      className="bg-forge-bg  shadow-[0_4px_20px_rgba(21,18,13,0.5)] p-6 lg:transform lg:rotate-3 lg:hover:rotate-0 transition-transform duration-300"
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
                    {/* <div className="absolute -top-4 -right-4 bg-forge-bg text-forge-ember text-forge-ink px-4 py-2 rounded-full text-sm font-semibold shadow-[0_4px_20px_rgba(21,18,13,0.5)] hover:shadow-[0_4px_20px_rgba(21,18,13,0.5)] transition-shadow duration-300">
                       Stand Out
                    </div> */}
                  </div>
                </div>

                {/* Content Side - Shows second on mobile */}
                <div className="order-2 lg:order-1">
                  <h2
                    className="font-normal leading-tight text-forge-ink text-center lg:text-left"
                    style={{
                      fontSize: "clamp(2.5rem, 6vw, 4rem)",
                      marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                    }}
                  >
                    Showcase Your
                    <br />
                    <span className="text-forge-ink">Kozeo Journey</span>
                  </h2>

                  <p
                    className="text-forge-ink mb-8"
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
                      <div className="w-8 h-8 bg-forge-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-forge-ink text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-forge-ink mb-2">
                          Include Your Kozeo Profile URL
                        </h3>
                        <p className="text-forge-ink-muted">
                          Add your personalized Kozeo profile link to let
                          recruiters explore your complete project portfolio and
                          professional achievements.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-forge-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-forge-ink text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-forge-ink mb-2">
                          Highlight Your Projects
                        </h3>
                        <p className="text-forge-ink-muted">
                          List specific projects you've completed through Kozeo,
                          showcasing the real-world impact of your technical
                          skills and problem-solving abilities.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-forge-bg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-forge-ink text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-forge-ink mb-2">
                          Demonstrate Proven Experience
                        </h3>
                        <p className="text-forge-ink-muted">
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
            className={`bg-forge-bg text-forge-ink transition-all duration-1000 ease-out ${
              isVisible("skill-forge-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >


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
                    className="text-forge-ember mr-2"
                    style={{
                      width: "clamp(1.5rem, 4vw, 2rem)",
                      height: "clamp(1.5rem, 4vw, 2rem)",
                    }}
                  /> */}
                  <span
                    className="bg-forge-bg/10 text-forge-ink font-medium rounded-full border border-forge-line"
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
                  className="font-normal leading-tight text-forge-ink"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                    marginBottom: "clamp(1.5rem, 4vh, 2rem)",
                  }}
                >
                  Free Learning Opportunities
                </h2>
                <p
                  className="text-forge-ink mx-auto"
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
                    className="font-semibold text-forge-ink"
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
                          className="text-forge-ink mr-3 flex-shrink-0"
                          style={{
                            width: "clamp(1rem, 2.5vw, 1.25rem)",
                            height: "clamp(1rem, 2.5vw, 1.25rem)",
                          }}
                        />
                        <span className="text-forge-ink">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 rounded-sm bg-forge-bg border border-forge-line shadow-[0_4px_20px_rgba(21,18,13,0.5)]">
                  {/* Header with badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-forge-bg rounded-full"></div>
                      <span className="text-xs font-medium text-forge-ink uppercase tracking-wider">
                        Available Now
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-forge-bg/10 border border-forge-line rounded-full">
                      <span className="text-xs font-semibold text-forge-ink">
                        Skill Forge
                      </span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h4 className="text-lg font-bold text-forge-ink mb-3">
                    TaskFlow Pro
                  </h4>

                  {/* Project Description */}
                  <p className="text-forge-ink text-sm leading-relaxed mb-4">
                    Collaborative task management platform with real-time
                    updates, drag-and-drop interface, and team synchronization.
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <p className="text-xs text-forge-ink-muted mb-2 uppercase tracking-wide">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["React", "TypeScript", "Node.js", "WebSocket"].map(
                        (tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-forge-bg/10 border border-forge-line rounded text-xs text-forge-ink font-medium"
                          >
                            {tech}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-forge-line">
                    <div className="flex items-center space-x-4 text-xs text-forge-ink-muted">
                      <span>4-6 weeks</span>
                      <span>•</span>
                      <span>3-5 developers</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-forge-ink">
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
            className={`py-24 bg-forge-bg transition-all duration-1000 ease-out ${
              isVisible("features-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-6xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-normal leading-tight text-forge-ink mb-8">
                  Why choose Kozeo?
                </h2>
              </div>

              <div className="bg-forge-bg rounded-sm shadow-[0_4px_20px_rgba(21,18,13,0.5)] overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:grid grid-cols-3 gap-0">
                  <div className="p-6 font-semibold text-forge-ink-muted bg-forge-bg">
                    Feature
                  </div>
                  <div className="p-6 font-semibold text-center bg-forge-bg text-forge-ink">
                    Kozeo
                  </div>
                  <div className="p-6 font-semibold text-center">
                    Traditional Platforms
                  </div>

                  <div className="p-6 border-t border-forge-line text-forge-ink-muted">Profile-First Approach</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ember font-medium">✓</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ink-muted opacity-40">✗</div>

                  <div className="p-6 border-t border-forge-line text-forge-ink-muted">Resume-Enhancing Work</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ember font-medium">✓</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ink-muted opacity-40">✗</div>

                  <div className="p-6 border-t border-forge-line text-forge-ink-muted">No Upfront Cost for Posters</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ember font-medium">✓</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ink-muted opacity-40">✗</div>

                  <div className="p-6 border-t border-forge-line text-forge-ink-muted">Proof of Domain Expertise</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ember font-medium">✓</div>
                  <div className="p-6 border-t border-forge-line text-center text-forge-ink-muted opacity-40">✗</div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {[
                    "Profile-First Approach",
                    "Resume-Enhancing Work",
                    "No Upfront Cost for Posters",
                    "Proof of Domain Expertise",
                  ].map((feature, index) => (
                    <div key={index} className="bg-forge-bg rounded-sm p-4">
                      <h3 className="font-semibold text-forge-ink mb-3">
                        {feature}
                      </h3>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-sm font-medium text-forge-ink-muted mb-1">Kozeo</span>
                          <div className="w-8 h-8 border border-forge-ember rounded-sm flex items-center justify-center">
                            <span className="text-forge-ember font-bold text-lg">✓</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-sm font-medium text-forge-ink-muted mb-1">Traditional</span>
                          <div className="w-8 h-8 border border-forge-line rounded-sm flex items-center justify-center">
                            <span className="text-forge-ink-muted font-bold text-lg opacity-40">✗</span>
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
            className={`bg-forge-bg text-forge-ink py-12 sm:py-16 md:py-24 transition-all duration-1000 ease-out ${
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
              <p className="text-base sm:text-lg md:text-xl text-forge-ink mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto">
                Join the movement that's making freelancing purposeful and
                profile development structured.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm bg-forge-ink text-forge-bg font-medium transition-all duration-200 hover:bg-forge-ember hover:text-forge-ink text-sm md:text-base"
                >
                  Start Building Your Profile
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-sm border border-forge-line text-forge-ink font-medium transition-all duration-200 hover:border-forge-ember hover:text-forge-ember text-sm md:text-base"
                >
                  Post a Project
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-forge-line">
          <div className="container mx-auto py-8 px-4 text-sm text-forge-ink-muted flex items-center justify-between">
            <span>© {new Date().getFullYear()} Kozeo</span>
            <a href="/" className="hover:text-forge-ember transition-colors duration-200">Contact Us</a>
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
