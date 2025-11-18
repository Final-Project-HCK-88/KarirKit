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
} from "lucide-react";

export function LandingPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c1b8a] shadow-sm border-b border-[#0c1b8a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center space-x-3"
            >
              <Image
                src="/kaka.png"
                alt="KarirKit Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
                unoptimized
              />
              <span className="text-2xl font-bold text-white">KarirKit</span>
            </Link>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-block text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logout()}
                    className="rounded-xl border-white/50 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#0c1b8a] font-medium transition-all cursor-pointer"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-white/90 hover:text-white hover:bg-white/10 font-medium"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-white text-[#0c1b8a] hover:bg-white/90 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-[#0c1b8a]" />
              <span className="text-sm font-medium text-[#0c1b8a]">
                AI-Powered Career Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Dream Job
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0c1b8a] via-blue-600 to-cyan-500">
                Awaits You
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              KarirKit matches you with perfect opportunities using advanced AI.
              Get salary insights, CV analysis, and land your dream role faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#0c1b8a] hover:bg-[#0c1b8a]/90 text-white font-semibold rounded-2xl px-8 py-6 text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-200 hover:border-[#0c1b8a] hover:text-[#0c1b8a] font-semibold rounded-2xl px-8 py-6 text-lg transition-all hover:scale-105"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
