"use client";

import { useTheme } from "@/contexts/ThemeContext";
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

export default function Home() {
  const { theme } = useTheme();

  const features = [
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Real Projects",
      description:
        "Work on actual projects that matter and build your portfolio with meaningful contributions.",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Collaborate",
      description:
        "Connect with talented developers, designers, and creators from around the world.",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Skill Development",
      description:
        "Learn new technologies and improve your skills through hands-on experience.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      content:
        "Kozeo helped me transition from tutorials to real-world projects. The experience has been invaluable!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "UI/UX Designer",
      content:
        "Amazing platform to collaborate with developers. I've worked on some incredible projects here.",
      rating: 5,
    },
    {
      name: "Alex Kim",
      role: "Backend Engineer",
      content:
        "The quality of projects and the community support on Kozeo is exceptional. Highly recommend!",
      rating: 5,
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="/kozeoLogo.png"
                alt="Kozeo Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-blue-600">Kozeo</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/Atrium"
                className={`hover:text-blue-600 transition-colors ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Browse Projects
              </Link>
              <Link
                href="/gigs"
                className={`hover:text-blue-600 transition-colors ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Gigs
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get Your Hands Dirty with{" "}
            <span className="text-blue-600">Real Life Projects</span>
          </h1>
          <p
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Join a community of developers, designers, and creators working on
            meaningful projects. Build your skills, expand your network, and
            create something amazing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/Atrium"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
            >
              Explore Projects
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/gigs/create"
              className={`border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors ${
                theme === "dark" ? "bg-transparent" : "bg-white"
              }`}
            >
              Post a Project
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-20 px-4 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Kozeo?</h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Everything you need to grow as a developer and creator
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                } shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Forge Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <FiStar className="text-yellow-500 w-8 h-8 mr-2" />
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                Skill Forge
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Free Learning Opportunities
            </h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              } max-w-3xl mx-auto`}
            >
              Discover projects marked as "Skill Forge" - free opportunities to
              learn, practice, and build your portfolio without any payment
              commitments.
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
            <div
              className={`p-8 rounded-xl ${
                theme === "dark" ? "bg-gray-800" : "bg-blue-50"
              } border-2 border-blue-200`}
            >
              <div className="flex items-center mb-4">
                <FiStar className="text-yellow-500 w-6 h-6 mr-2" />
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded">
                  Skill Forge
                </span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Sample Project</h4>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                } mb-4`}
              >
                "Build a React Todo App with TypeScript and implement real-time
                collaboration features."
              </p>
              <div className="text-sm text-blue-600 font-medium">
                💡 Free • Learn React, TypeScript, WebSockets
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className={`py-20 px-4 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Community Says</h2>
            <p
              className={`text-xl ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join thousands of developers who have accelerated their careers
              with Kozeo
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                } shadow-lg`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p
                  className={`mb-4 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Building?</h2>
          <p
            className={`text-xl mb-8 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Join our community today and start working on projects that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/Atrium"
              className={`border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors ${
                theme === "dark" ? "bg-transparent" : "bg-white"
              }`}
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-12 px-4 sm:px-6 lg:px-8 ${
          theme === "dark"
            ? "border-gray-800 bg-gray-900"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/kozeoLogo.png"
                  alt="Kozeo Logo"
                  width={32}
                  height={32}
                  className="mr-2"
                />
                <h3 className="text-xl font-bold text-blue-600">Kozeo</h3>
              </div>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Get your hands dirty with real life projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/Atrium"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Browse Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gigs"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    All Gigs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gigs/create"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Post Project
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/discussionroom"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Discussions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Profiles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/review"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile/setupprofile"
                    className={`hover:text-blue-600 transition-colors ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Create Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`border-t pt-8 mt-8 text-center ${
              theme === "dark"
                ? "border-gray-800 text-gray-400"
                : "border-gray-200 text-gray-600"
            }`}
          >
            <p>&copy; 2025 Kozeo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
