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

      const ctaSection = document.querySelector('[data-section="cta"]');

      if (ctaSection) {
        const heroEnd = viewportHeight;
        const ctaRect = ctaSection.getBoundingClientRect();
        const isInCta = ctaRect.top <= 100 && ctaRect.bottom >= 0;
        const isInHero = scrollY < heroEnd - 100;

        setIsOnDarkBackground(isInHero || isInCta);
      } else {
        const isInHero = scrollY < viewportHeight - 100;
        setIsOnDarkBackground(isInHero);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`static sm:fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${
        isOnDarkBackground ? "bg-black" : "bg-white border-b border-gray-200"
      }`}
    >
      <nav
        className="flex items-center justify-between sm:justify-center px-4 sm:px-8 py-3 sm:py-8 relative"
        aria-label="Global"
      >
        <div className="flex items-center justify-start sm:justify-center sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
          <Link
            href="/"
            className={`flex items-center gap-2 sm:gap-3 font-bold text-xl sm:text-3xl tracking-tight transition-colors duration-300 ${
              isOnDarkBackground ? "text-white" : "text-black"
            }`}
          >
            <Image
              src="/kozeoLogo.png"
              alt="Kozeo Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            Kozeo
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 sm:absolute sm:right-8">
          <Link
            href="/login"
            className={`rounded-full px-2 py-1 sm:px-6 sm:py-2 text-xs sm:text-base transition-all duration-300 hover:scale-105 border ${
              isOnDarkBackground
                ? "border-white text-white bg-transparent hover:bg-white hover:text-black hover:shadow-lg"
                : "border-black text-black bg-transparent hover:bg-black hover:text-white hover:shadow-lg"
            }`}
          >
            Login
          </Link>
          <Link
            href="/profile/setupprofile"
            className={`rounded-full px-2 py-1 sm:px-6 sm:py-2 text-xs sm:text-base transition-all duration-300 hover:scale-105 ${
              isOnDarkBackground
                ? "bg-white text-black hover:bg-gray-100 hover:shadow-lg"
                : "bg-black text-white hover:bg-gray-800 hover:shadow-lg"
            }`}
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
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Static visible stars for immediate feedback */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>

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
                animationDelay: `${Math.random() * 20}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center sm:items-end sm:justify-start pb-8 sm:pb-16 md:pb-24 px-3 sm:pl-8 sm:pr-8 md:pl-16 lg:pl-24 z-10">
        <div className="max-w-full sm:max-w-2xl text-center sm:text-left">
          <h1 className="text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal sm:leading-tight text-white mb-4 sm:mb-6 md:mb-8">
            Ignore The Noise,
            <br />
            Hire With Purpose
          </h1>
          <p className="text-base leading-relaxed sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-full sm:max-w-xl mx-auto sm:mx-0">
            Build your tech portfolio with real-world projects that matter.
            Every gig on Kozeo contributes to your professional growth.
          </p>
          <div className="flex flex-row gap-3 sm:gap-3 md:gap-4 items-center justify-center sm:justify-start">
            <Link
              href="/Atrium"
              className="bg-white text-black px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-sm sm:text-sm md:text-base lg:text-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg flex-1 sm:flex-none max-w-[140px] sm:max-w-none"
            >
              Start Building
            </Link>
            <Link
              href="/gigs/create"
              className="border border-white text-white px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-sm sm:text-sm md:text-base lg:text-lg font-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 flex-1 sm:flex-none max-w-[120px] sm:max-w-none"
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
      <div>
        <Navbar />
        <main>
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
            className={`py-12 sm:py-16 md:py-24 bg-white transition-all duration-1000 ease-out ${
              isVisible("value-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-black mb-4 sm:mb-6 md:mb-8">
                  Profile &gt; Payment
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Kozeo transforms gig culture into career growth. Unlike
                  traditional platforms that focus only on task completion,
                  every project on Kozeo contributes to your tech portfolio and
                  professional identity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-12 md:mt-20">
                <div className="text-center px-2 py-4">
                  <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FiCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Profile-First Approach
                  </h3>
                  <p className="text-gray-600">
                    Every gig builds your credible tech portfolio with
                    real-world projects from startups and NGOs.
                  </p>
                </div>

                <div className="text-center px-2 py-4">
                  <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FiTrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Resume-Enhancing Work
                  </h3>
                  <p className="text-gray-600">
                    Collaborative projects that develop communication,
                    leadership, and technical skills employers value.
                  </p>
                </div>

                <div className="text-center px-2 py-4">
                  <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FiUsers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Impact-Driven Projects
                  </h3>
                  <p className="text-gray-600">
                    Work on meaningful projects that create real value while
                    building proof of your domain expertise.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Skill Forge Section */}
          <section
            id="skill-forge-section"
            data-scroll-animation
            className={`py-12 sm:py-16 md:py-24 bg-gray-50 transition-all duration-1000 ease-out ${
              isVisible("skill-forge-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-4">
                  <FiStar className="text-yellow-500 w-8 h-8 mr-2" />
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    Skill Forge
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-black mb-4 sm:mb-6 md:mb-8">
                  Free Learning Opportunities
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover projects marked as "Skill Forge" - free opportunities
                  to learn, practice, and build your portfolio without any
                  payment commitments.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">Perfect for:</h3>
                  <ul className="space-y-4">
                    {[
                      "Students learning new technologies",
                      "Developers switching to new frameworks",
                      "Anyone wanting to contribute to open source",
                      "Building a portfolio with real projects",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheck className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 rounded-xl bg-white border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <FiStar className="text-yellow-500 w-6 h-6 mr-2" />
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
                      Skill Forge
                    </span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Sample Project</h4>
                  <p className="text-gray-600 mb-4">
                    "Build a React Todo App with TypeScript and implement
                    real-time collaboration features."
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    💡 Free • Learn React, TypeScript, WebSockets
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
                  href="/Atrium"
                  className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:bg-gray-100 transition-colors w-fit"
                >
                  Start Building Your Profile
                </Link>
                <Link
                  href="/gigs/create"
                  className="border border-white text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-medium hover:bg-white hover:text-black transition-colors w-fit"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
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
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t">
          <div className="container mx-auto py-8 px-4 text-sm text-gray-600 flex items-center justify-between">
            <span>© {new Date().getFullYear()} Kozeo</span>
            <a href="#" className="hover:underline">
              Back to top
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
