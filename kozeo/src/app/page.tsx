"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiCode,
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiCheck,
} from "react-icons/fi";
import { PageLoader } from "../components/common/PageLoader";

// Custom hook for scroll animations
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

// Navbar Component
const Navbar = () => {
  const [isOnDarkBackground, setIsOnDarkBackground] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Get all dark sections
      const heroSection = document.querySelector("#hero-section");
      const resumeSection = document.querySelector("#resume-section");
      const skillForgeSection = document.querySelector("#skill-forge-section");
      const ctaSection = document.querySelector("#cta-section");

      let isOnDark = false;

      // Check if we're in any dark section
      const darkSections = [
        heroSection,
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
      className={`fixed top-0 inset-x-0 z-50 transition-all h-16 duration-300 ease-in-out ${
        isOnDarkBackground ? "bg-black" : "bg-white border-gray-200"
      }`}
    >
      <nav
        className="flex items-center justify-center h-full relative"
        style={{ padding: "0 clamp(1rem, 4vw, 3rem)" }}
        aria-label="Global"
      >
        <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className={`flex items-center font-bold tracking-tight transition-colors duration-300 ${
              isOnDarkBackground ? "text-white" : "text-black"
            }`}
            style={{
              gap: "clamp(0.5rem, 1.5vw, 1rem)",
              fontSize: "clamp(1.25rem, 3vw, 2rem)",
            }}
          >
            <Image
              src="/kozeoLogo.png"
              alt="Kozeo Logo"
              width={32}
              height={32}
              style={{
                width: "clamp(24px, 4vw, 40px)",
                height: "clamp(24px, 4vw, 40px)",
                borderRadius: "100%",
              }}
            />
          </Link>
        </div>

        <div
          className="flex items-center absolute right-0"
          style={{
            gap: "clamp(0.5rem, 2vw, 1rem)",
            paddingRight: "clamp(1rem, 4vw, 3rem)",
          }}
        >
          <Link
            href="/login"
            className={`rounded-full transition-all duration-300 hover:scale-105 border ${
              isOnDarkBackground
                ? "border-white text-white bg-black hover:bg-white hover:text-black hover:shadow-lg"
                : "border-black text-black bg-white hover:bg-black hover:text-white hover:shadow-lg"
            }`}
            style={{
              padding:
                "clamp(0.375rem, 1.5vh, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
              fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
            }}
          >
            Login
          </Link>
          <Link
            href="/login"
            className={`rounded-full transition-all duration-300 hover:scale-105 ${
              isOnDarkBackground
                ? "bg-white text-black hover:bg-gray-100 hover:shadow-lg"
                : "bg-black text-white hover:bg-gray-800 hover:shadow-lg"
            }`}
            style={{
              padding:
                "clamp(0.375rem, 1.5vh, 0.75rem) clamp(1rem, 3vw, 1.5rem)",
              fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
            }}
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
};

// Hero Component
const Hero = () => {
  return (
    <section className="h-screen relative overflow-hidden bg-black">
      {/* Glow Effects */}
      <div className="fixed top-1/4 right-8 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 left-8 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="fixed top-2/3 right-1/3 w-2 h-0 rounded-full opacity-70 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />

      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Twinkling stars for immediate feedback */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-twinkle"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle"></div>

        {/* Twinkling Stars */}
        <div className="absolute inset-0">
          {/* Large Stars */}
          <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-twinkle"></div>

          {/* Medium Stars */}
          <div className="absolute top-32 right-40 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-52 left-16 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute bottom-32 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-1/2 left-8 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>

          {/* Small Stars */}
          <div className="absolute top-24 left-1/2 w-px h-px bg-white animate-twinkle"></div>
          <div className="absolute top-48 right-16 w-px h-px bg-white animate-twinkle"></div>
          <div className="absolute bottom-48 left-40 w-px h-px bg-white animate-twinkle"></div>
          <div className="absolute bottom-24 right-1/2 w-px h-px bg-white animate-twinkle"></div>
          <div className="absolute top-2/3 right-8 w-px h-px bg-white animate-twinkle"></div>
        </div>

        {/* Moving Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `moveStars ${
                  15 + Math.random() * 25
                }s linear infinite`,
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
              // animationDelay: "0s",
            }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-0 h-px bg-gradient-to-l from-transparent via-white to-transparent opacity-25 max-w-md"
            style={{
              animation: "slideLeft 5s infinite linear",
              // animationDelay: "0s", // Changed from "2s" to "0s"
            }}
          ></div> */}

          {/* Diagonal Lines */}
          {/* <div className="absolute top-1/3 left-0 w-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20 rotate-12" 
               style={{
                 animation: 'slideRight 6s infinite linear',
                 animationDelay: '1s'
               }}></div>
          <div className="absolute bottom-1/3 right-0 w-0 h-px bg-gradient-to-l from-transparent via-white to-transparent opacity-15 -rotate-12" 
               style={{
                 animation: 'slideLeft 7s infinite linear',
                 animationDelay: '3s'
               }}></div> */}
        </div>
      </div>

      {/* Content */}
      <div
        className="relative h-full flex items-center justify-center sm:justify-start px-4 z-10 hero-content"
        style={{
          paddingTop: "clamp(40px, 6vh, 100px)",
          paddingLeft: "clamp(1rem, 2vw, 2rem) clamp(1rem, 8vw, 8rem)",
        }}
      >
        <div
          className="max-w-full text-center sm:text-left"
          style={{ maxWidth: "min(90vw, 600px)" }}
        >
          {/* Kozeo Combined Logo */}
          <div
            className="flex items-center justify-center sm:justify-start w-full hero-logo"
            style={
              {
                // marginBottom: "clamp(1rem, 4vh, 4rem)",
              }
            }
          >
            <Image
              src="/logoFial.svg"
              alt="Kozeo Full Logo"
              width={625}
              height={147}
              className="brightness-0 invert hero-logo"
              style={{
                width: "clamp(240px, 45vw, 500px)",
                height: "auto",
                maxWidth: "90vw",
              }}
              priority
            />
          </div>

          <h1
            className="font-normal leading-tight text-white text-center sm:text-left sm:ml-0 md:ml-10 hero-title"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 4rem)",
              marginBottom: "clamp(1rem, 3vh, 2.5rem)",
              lineHeight: "1.1",
            }}
          >
            Ignore The Noise,
            <br />
            Hire With Purpose
          </h1>
          <p
            className="text-gray-300 leading-relaxed text-center sm:text-left sm:ml-0 md:ml-10  hero-subtitle"
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              marginBottom: "clamp(2rem, 5vh, 3rem)",
              maxWidth: "min(90vw, 500px)",
            }}
          >
            Build your tech portfolio with real-world projects that matter.
            Every project on Kozeo contributes to your professional growth.
          </p>
          <div
            className="flex flex-row items-center justify-center sm:justify-start sm:ml-0 md:ml-10  hero-buttons"
            style={{ gap: "clamp(0.75rem, 3vw, 1.5rem)" }}
          >
            <Link
              href="/login"
              className="bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] text-center hero-button"
              style={{
                padding: "clamp(0.75rem, 2vh, 1rem) clamp(1.5rem, 4vw, 2rem)",
                fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                minWidth: "clamp(140px, 25vw, 180px)",
              }}
            >
              Start Building
            </Link>
            <Link
              href="/login"
              className="border border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] text-center hero-button"
              style={{
                padding: "clamp(0.75rem, 2vh, 1rem) clamp(1.5rem, 4vw, 2rem)",
                fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                minWidth: "clamp(120px, 22vw, 160px)",
              }}
            >
              Post Project
            </Link>
          </div>
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
            className={`bg-gradient-to-br from-gray-900 to-black transition-all duration-1000 ease-out ${
              isVisible("resume-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ padding: "clamp(3rem, 8vh, 6rem) 0" }}
          >
            <div
              className="max-w-6xl mx-auto"
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
                    <span className="text-cyan-400">Kozeo Journey</span>
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
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">1</span>
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
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">2</span>
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
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">3</span>
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
            <div
              className="max-w-6xl mx-auto"
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
                    className="bg-yellow-100 text-yellow-800 font-medium rounded-full"
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
                          className="text-green-400 mr-3 flex-shrink-0"
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
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                        Available Now
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                      <span className="text-xs font-semibold text-yellow-300">
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
                            className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300 font-medium"
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
                      <p className="text-sm font-bold text-green-400">
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

          {/* Features Comparison */}
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
