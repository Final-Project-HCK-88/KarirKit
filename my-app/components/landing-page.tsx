"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/footer";
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="KarirKit Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
                unoptimized
              />
              <span className="text-2xl font-bold text-gray-900">KarirKit</span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-[#0c1b8a] font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#0c1b8a] hover:bg-[#0c1b8a]/90 text-white font-medium rounded-xl px-6 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>10,000+ Job Seekers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>500+ Companies</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>95% Match Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Glassmorphism Container */}
            <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-gray-200/50">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 sm:p-12 shadow-inner">
                {/* Mockup Header */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg h-8 max-w-md mx-4"></div>
                </div>

                {/* Mockup Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded-lg w-full"></div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 border border-blue-100">
                    <div className="h-6 bg-blue-200 rounded-lg w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-blue-100 rounded-lg w-full"></div>
                      <div className="h-4 bg-blue-100 rounded-lg w-5/6"></div>
                      <div className="h-4 bg-blue-100 rounded-lg w-4/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl"></div>
          </div>

          <div className="text-center mt-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A beautiful, intuitive dashboard that puts your career growth at
              your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0c1b8a] to-blue-500">
                {" "}
                Your Success
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to find, apply, and land your dream job in one
              intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
              >
                <CardContent className="p-8">
                  {/* Icon with Gradient */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                  ></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Loved by Job Seekers
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who found their dream jobs with KarirKit
            </p>
          </div>

          <div className="relative">
            {/* Testimonial Card */}
            <Card className="border-0 bg-white shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                {/* Stars */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>

                {/* Content */}
                <p className="text-2xl text-gray-900 leading-relaxed mb-8 font-medium">
                  &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0c1b8a] to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role} at{" "}
                      {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full border-2 hover:border-[#0c1b8a] hover:text-[#0c1b8a] transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-[#0c1b8a] w-8"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full border-2 hover:border-[#0c1b8a] hover:text-[#0c1b8a] transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-[#0c1b8a] via-blue-600 to-blue-700 text-white shadow-2xl rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
            <CardContent className="relative p-12 sm:p-16 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join KarirKit today and discover opportunities that match your
                skills, ambitions, and salary expectations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-[#0c1b8a] hover:bg-gray-100 font-semibold rounded-2xl px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#0c1b8a] font-semibold rounded-2xl px-8 py-6 text-lg transition-all hover:scale-105"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
