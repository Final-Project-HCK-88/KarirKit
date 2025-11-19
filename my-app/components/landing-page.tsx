"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/footer";
import { useAuth } from "@/context/auth-context";
import {
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
  Briefcase,
} from "lucide-react";

export function   LandingPage() {
  const { user, logout } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fresh Graduate",
      company: "Tech Startup",
      content:
        "KarirKit helped me land my dream job in just 2 weeks! The AI-powered matching is incredibly accurate.",
      rating: 5,
      avatar: "SC",
    },
    {
      name: "Ahmad Rizki",
      role: "Software Engineer",
      company: "Unicorn Company",
      content:
        "The salary benchmark feature gave me confidence to negotiate a 40% salary increase. Game changer!",
      rating: 5,
      avatar: "AR",
    },
    {
      name: "Maya Putri",
      role: "Product Designer",
      company: "Global Agency",
      content:
        "Finally, a platform that understands what I'm looking for. The job matches are spot-on every time.",
      rating: 5,
      avatar: "MP",
    },
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Matching",
      description:
        "Our advanced AI analyzes your CV and matches you with the perfect opportunities tailored to your skills.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Job Search",
      description:
        "Find roles that align with your career goals. Save time with intelligent filtering and real-time updates.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Salary Insights",
      description:
        "Get data-driven salary benchmarks for your role, location, and experience level. Negotiate with confidence.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Profile Analytics",
      description:
        "Track your profile views, application status, and get actionable insights to improve your chances.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Alerts",
      description:
        "Never miss an opportunity. Get real-time notifications for jobs matching your preferences.",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "CV Analysis",
      description:
        "Upload your CV and get instant feedback with AI-powered suggestions to make it stand out.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e40af] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center space-x-3 group"
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                <span className="text-2xl font-bold text-[#1e40af]">K</span>
              </div>
              <span className="text-2xl font-bold text-white">KarirKit</span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-block text-base font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => logout()}
                    className="rounded-full border-2 border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#1e40af] font-semibold transition-all cursor-pointer px-6"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/20 font-semibold rounded-full px-6"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-white text-[#1e40af] hover:bg-blue-50 font-bold rounded-full shadow-lg hover:shadow-xl transition-all px-8"
                  >
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Landing Page */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900">Your AI</span>
                <br />
                <span className="text-gray-900">Career</span>
                <br />
                <span className="text-gray-900">Assistant</span>
              </h1>

              <p className="text-xl text-gray-700 leading-relaxed max-w-lg">
                KarirKit matches you with perfect opportunities using advanced
                AI
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold rounded-full px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  <Link href={user ? "/dashboard" : "/register"}>
                    Get Started
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-[#1e40af] hover:bg-[#1e40af] hover:text-white font-bold rounded-full px-10 py-6 text-lg transition-all"
                >
                  <Link href="#features">Demo</Link>
                </Button>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Contract Card Illustration */}
                <div className="absolute top-0 right-0 bg-white rounded-3xl shadow-2xl p-8 w-80 border-4 border-blue-100 transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-blue-600 font-bold text-xl">
                      CONTRACT
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-blue-100 rounded-full w-full"></div>
                    <div className="h-3 bg-blue-100 rounded-full w-5/6"></div>
                    <div className="h-3 bg-blue-100 rounded-full w-4/6"></div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-8 left-0 bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">▶</span>
                    </div>
                    <div>
                      <div className="h-2 bg-white/40 rounded w-20 mb-1"></div>
                      <div className="h-2 bg-white/40 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background City Skyline */}
              <div className="absolute bottom-0 left-0 right-0 opacity-20">
                <div className="flex items-end justify-center space-x-4 h-40">
                  <div className="w-16 bg-blue-300 h-24 rounded-t-lg"></div>
                  <div className="w-20 bg-blue-400 h-32 rounded-t-lg"></div>
                  <div className="w-24 bg-blue-500 h-40 rounded-t-lg"></div>
                  <div className="w-16 bg-blue-400 h-28 rounded-t-lg"></div>
                  <div className="w-20 bg-blue-300 h-20 rounded-t-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Feature 1: Real-time Salary Benchmarking */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full mb-4">
                01
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Salary 
                <br />
                benchmark
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Understand market salary ranges instantly.
              </p>
            </div>

            {/* Illustration: Salary Benchmarking */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Wallet with money illustration */}
                <div className="relative bg-linear-to-br from-blue-500 to-blue-700 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-200 rounded-2xl transform -rotate-12"></div>
                  <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-300 rounded-2xl transform rotate-12"></div>

                  {/* People with money */}
                  <div className="relative flex items-end justify-center space-x-8 h-64">
                    {/* Person 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-blue-300 rounded-full mb-2"></div>
                      <div className="w-16 h-24 bg-white rounded-t-3xl"></div>
                      <div className="flex gap-1 mt-2">
                        <div className="w-6 h-8 bg-blue-900 rounded-b-lg"></div>
                        <div className="w-6 h-8 bg-blue-900 rounded-b-lg"></div>
                      </div>
                    </div>

                    {/* Giant Coin */}
                    <div className="w-32 h-32 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl transform -translate-y-8">
                      <div className="text-4xl font-bold text-yellow-900">
                        $
                      </div>
                    </div>

                    {/* Person 2 */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-blue-300 rounded-full mb-2"></div>
                      <div className="w-16 h-24 bg-white rounded-t-3xl"></div>
                      <div className="flex gap-1 mt-2">
                        <div className="w-6 h-8 bg-blue-900 rounded-b-lg"></div>
                        <div className="w-6 h-8 bg-blue-900 rounded-b-lg"></div>
                      </div>
                    </div>
                  </div>

                  {/* Coins stack */}
                  <div className="absolute bottom-4 right-8 space-y-1">
                    <div className="w-16 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-16 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-16 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-16 h-4 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: AI-powered Contract Intelligence */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Illustration First (on left) */}
            <div className="relative h-96 flex items-center justify-center lg:order-1">
              <div className="relative w-full max-w-md">
                {/* Contract document illustration */}
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-100">
                  {/* Header with CONTRACT text */}
                  <div className="flex justify-between items-start mb-6">
                    {/* Profile photos */}
                    <div className="flex gap-4">
                      <div className="w-24 h-28 bg-linear-to-b from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-20 h-24 bg-linear-to-b from-blue-400 to-blue-500 rounded-xl"></div>
                      </div>
                      <div className="w-20 h-24 bg-linear-to-b from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-md">
                        <div className="w-16 h-20 bg-linear-to-b from-gray-300 to-gray-400 rounded-lg"></div>
                      </div>
                    </div>

                    {/* CONTRACT label */}
                    <div className="bg-white border-2 border-blue-500 rounded-lg px-4 py-2 font-bold text-blue-600">
                      CONTRACT
                    </div>
                  </div>

                  {/* Checkmarks list */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div
                          className={`h-2 bg-gray-200 rounded-full ${
                            i === 5
                              ? "w-full"
                              : i === 4
                              ? "w-5/6"
                              : i === 3
                              ? "w-4/6"
                              : i === 2
                              ? "w-3/6"
                              : "w-full"
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>

                  {/* Magnifying glass */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform">
                    <svg
                      className="w-20 h-20 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" strokeWidth="3" />
                      <path
                        strokeLinecap="round"
                        strokeWidth="3"
                        d="M21 21l-4.35-4.35"
                      />
                    </svg>
                  </div>

                  {/* Paper clip */}
                  <div className="absolute -top-4 right-20 w-12 h-16 border-4 border-gray-400 rounded-t-full rounded-b-lg transform rotate-45"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:order-2">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full mb-4">
                02
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                AI-powered
                <br />
                contract
                <br />
                Summary
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Scan contracts instantly and reveal risky clauses.
              </p>
            </div>
          </div>

          {/* Feature 3: Job Matching */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full mb-4">
                03
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Job Matching
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get matched with the right job openings quickly and efficiently.
              </p>
            </div>

            {/* Illustration: Job Search */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="relative w-full max-w-md h-full">
                {/* Background circle */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-blue-200 rounded-full opacity-50"></div>

                {/* Person searching */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Body */}
                  <div className="relative">
                    {/* Head */}
                    <div className="w-16 h-16 bg-blue-300 rounded-full mx-auto mb-2"></div>

                    {/* Torso */}
                    <div className="w-32 h-40 bg-linear-to-b from-blue-500 to-blue-700 rounded-t-full mx-auto relative">
                      <div className="absolute -right-16 top-8 w-20 h-4 bg-blue-600 rounded-full transform rotate-45"></div>
                      <div className="absolute -left-16 top-12 w-20 h-4 bg-blue-600 rounded-full transform -rotate-45"></div>
                    </div>

                    {/* Magnifying Glass */}
                    <div className="absolute -right-20 top-0 w-24 h-24">
                      <div className="w-20 h-20 border-8 border-blue-600 rounded-full bg-blue-100/50"></div>
                      <div className="w-4 h-16 bg-blue-600 transform rotate-45 origin-top-left absolute bottom-0 right-0"></div>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-xl border-2 border-blue-300 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="font-bold text-gray-700">JOBS</span>
                </div>

                {/* Floating job cards */}
                <div className="absolute top-16 -left-12 bg-white rounded-xl p-3 shadow-lg transform -rotate-12 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>

                <div className="absolute bottom-20 -right-12 bg-white rounded-xl p-3 shadow-lg transform rotate-12 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
