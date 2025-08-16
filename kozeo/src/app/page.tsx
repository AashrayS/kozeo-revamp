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
            {/* <svg
              width="100"
              height="24"
              viewBox="0 0 625 147"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 sm:h-6 w-auto"
            >
              <path
                d="M104.8 145H83.6L33 76.8L18.4 89.6V145H0.400001V2.19999H18.4V72.6C22.4 68.0667 26.4667 63.5333 30.6 59C34.7333 54.4667 38.8667 49.9333 43 45.4L81.6 2.19999H102.6L46 64.4L104.8 145ZM244.922 73.4C244.922 84.4667 243.522 94.5333 240.722 103.6C237.922 112.533 233.722 120.267 228.122 126.8C222.655 133.333 215.789 138.333 207.522 141.8C199.389 145.267 189.922 147 179.122 147C167.922 147 158.189 145.267 149.922 141.8C141.655 138.2 134.789 133.2 129.322 126.8C123.855 120.267 119.789 112.467 117.122 103.4C114.455 94.3333 113.122 84.2667 113.122 73.2C113.122 58.5333 115.522 45.7333 120.322 34.8C125.122 23.8667 132.389 15.3333 142.122 9.2C151.989 3.06666 164.389 -4.76837e-06 179.322 -4.76837e-06C193.589 -4.76837e-06 205.589 3.06666 215.322 9.2C225.055 15.2 232.389 23.7333 237.322 34.8C242.389 45.7333 244.922 58.6 244.922 73.4ZM132.122 73.4C132.122 85.4 133.789 95.7333 137.122 104.4C140.455 113.067 145.589 119.733 152.522 124.4C159.589 129.067 168.455 131.4 179.122 131.4C189.922 131.4 198.722 129.067 205.522 124.4C212.455 119.733 217.589 113.067 220.922 104.4C224.255 95.7333 225.922 85.4 225.922 73.4C225.922 55.4 222.189 41.3333 214.722 31.2C207.255 20.9333 195.455 15.8 179.322 15.8C168.522 15.8 159.589 18.1333 152.522 22.8C145.589 27.3333 140.455 33.9333 137.122 42.6C133.789 51.1333 132.122 61.4 132.122 73.4ZM361.819 145H262.819V131.4L338.019 18.2H265.219V2.19999H359.819V15.8L284.619 129H361.819V145ZM468.872 145H389.072V2.19999H468.872V18H407.072V62.6H465.272V78.2H407.072V129.2H468.872V145ZM624.805 73.4C624.805 84.4667 623.405 94.5333 620.605 103.6C617.805 112.533 613.605 120.267 608.005 126.8C602.538 133.333 595.671 138.333 587.405 141.8C579.271 145.267 569.805 147 559.005 147C547.805 147 538.071 145.267 529.805 141.8C521.538 138.2 514.671 133.2 509.205 126.8C503.738 120.267 499.671 112.467 497.005 103.4C494.338 94.3333 493.005 84.2667 493.005 73.2C493.005 58.5333 495.405 45.7333 500.205 34.8C505.005 23.8667 512.271 15.3333 522.005 9.2C531.871 3.06666 544.271 -4.76837e-06 559.205 -4.76837e-06C573.471 -4.76837e-06 585.471 3.06666 595.205 9.2C604.938 15.2 612.271 23.7333 617.205 34.8C622.271 45.7333 624.805 58.6 624.805 73.4ZM512.005 73.4C512.005 85.4 513.671 95.7333 517.005 104.4C520.338 113.067 525.471 119.733 532.405 124.4C539.471 129.067 548.338 131.4 559.005 131.4C569.805 131.4 578.605 129.067 585.405 124.4C592.338 119.733 597.471 113.067 600.805 104.4C604.138 95.7333 605.805 85.4 605.805 73.4C605.805 55.4 602.071 41.3333 594.605 31.2C587.138 20.9333 575.338 15.8 559.205 15.8C548.405 15.8 539.471 18.1333 532.405 22.8C525.471 27.3333 520.338 33.9333 517.005 42.6C513.671 51.1333 512.005 61.4 512.005 73.4Z"
                fill={isOnDarkBackground ? "white" : "black"}
              />
            </svg> */}
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
            href="/login"
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
      {/* Glow Effects */}
      <div className="fixed top-1/4 right-8 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-1/4 left-8 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
      <div className="fixed top-2/3 right-1/3 w-2 h-0 rounded-full opacity-70 bg-emerald-400 shadow-[0_0_200px_80px_rgba(52,211,153,0.25)] pointer-events-none z-0" />

      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Twinkling stars for immediate feedback */}
        <div
          className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-twinkle"
        ></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-twinkle"
        ></div>
        <div
          className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle"
        ></div>

        {/* Twinkling Stars */}
        <div className="absolute inset-0">
          {/* Large Stars */}
          <div
            className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-twinkle"
          ></div>

          {/* Medium Stars */}
          <div
            className="absolute top-32 right-40 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute top-52 left-16 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute bottom-32 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute bottom-20 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          ></div>
          <div
            className="absolute top-1/2 left-8 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
          ></div>

          {/* Small Stars */}
          <div
            className="absolute top-24 left-1/2 w-px h-px bg-white animate-twinkle"
          ></div>
          <div
            className="absolute top-48 right-16 w-px h-px bg-white animate-twinkle"
          ></div>
          <div
            className="absolute bottom-48 left-40 w-px h-px bg-white animate-twinkle"
          ></div>
          <div
            className="absolute bottom-24 right-1/2 w-px h-px bg-white animate-twinkle"
          ></div>
          <div
            className="absolute top-2/3 right-8 w-px h-px bg-white animate-twinkle"
          ></div>
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
      <div className="relative h-full flex items-center justify-center sm:items-end sm:justify-start pb-8 sm:pb-16 md:pb-24 px-3 sm:pl-8 sm:pr-8 md:pl-16 lg:pl-24 z-10">
        <div className="max-w-full sm:max-w-2xl text-center sm:text-left">
          {/* Kozeo Combined Logo */}
          <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-center sm:justify-start w-full sm:-ml-8  lg:-ml-8 xl:-ml-12">
            <Image
              src="/logoFial.svg"
              alt="Kozeo Full Logo"
              width={625}
              height={147}
              className="w-72 sm:w-80 md:w-96 lg:w-[400px] xl:w-[450px] 2xl:w-[500px] h-auto brightness-0 invert max-w-[90vw]"
              priority
            />
          </div>

          <h1 className="text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal sm:leading-tight text-white mb-4 sm:mb-6 md:mb-8">
            Ignore The Noise,
            <br />
            Hire With Purpose
          </h1>
          <p className="text-base leading-relaxed sm:text-base md:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-full sm:max-w-xl mx-auto sm:mx-0">
            Build your tech portfolio with real-world projects that matter.
            Every project on Kozeo contributes to your professional growth.
          </p>
          <div className="flex flex-row gap-3 sm:gap-3 md:gap-4 items-center justify-center sm:justify-start">
            <Link
              href="/login"
              className="bg-white text-black px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-sm sm:text-sm md:text-base lg:text-lg font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex-1 sm:flex-none max-w-[140px] sm:max-w-none"
            >
              Start Building
            </Link>
            <Link
              href="/login"
              className="border border-white text-white px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-sm sm:text-sm md:text-base lg:text-lg font-medium hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex-1 sm:flex-none max-w-[120px] sm:max-w-none"
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
            className={`py-12 sm:py-16 md:py-24 bg-stone-50 transition-all duration-1000 ease-out ${
              isVisible("value-section")
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-black mb-4 sm:mb-6 md:mb-8">
                  Profile &gt; Money
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Kozeo transforms project culture into career growth. Unlike
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
                    Every project builds your credible tech portfolio with
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
