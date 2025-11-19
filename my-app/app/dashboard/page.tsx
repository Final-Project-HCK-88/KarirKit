"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  DollarSign,
  Briefcase,
  History,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

interface HistoryItem {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

const features = [
  {
    title: "Contract Analysis",
    description: "Upload and analyze job contracts or resumes with AI",
    icon: FileText,
    href: "/dashboard/contract-analysis",
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "Salary Benchmark",
    description: "Get market salary insights and negotiation tips",
    icon: DollarSign,
    href: "/dashboard/salary-benchmark",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Job Matching",
    description: "Find jobs that match your preferences and skills",
    icon: Briefcase,
    href: "/dashboard/job-matching",
    color: "from-purple-500 to-purple-600",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentActivities, setRecentActivities] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        // Take only the 3 most recent items
        const recent = data.data.resumes.slice(0, 3);
        setRecentActivities(recent);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      {/* Hero Section with Image */}
      <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
        {/* Left Content */}
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-[#0c1b8a]">
              ✨ Welcome back!
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Hello, {user?.fullname || "aflah"}!
          </h1>
          <p className="text-xl text-gray-600">
            Ready to take your career to nenext level?
          </p>
        </div>

        {/* Right Image - Professional illustration */}
        <div className="hidden lg:block relative">
          <div className="relative w-full h-[500px]">
            <Image
              src="/illustration-dashboard.svg"
              alt="Professional working illustration"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Feature Cards - Clean & Modern */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="group h-full hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 bg-white rounded-3xl">
                <CardHeader className="pb-4 space-y-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="link"
                    className="gap-2 text-[#0c1b8a] hover:text-blue-700 font-semibold p-0 h-auto"
                  >
                    Get Started{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section - Recent Activity & Profile */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <Card className="border border-gray-100 shadow-md rounded-3xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <History className="h-4 w-4 text-[#0c1b8a]" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  No recent activity yet. Start by uploading a contract or job
                  description
                </p>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-[#0c1b8a] hover:text-[#0c1b8a] hover:bg-blue-50 font-medium transition-all shadow-sm"
                >
                  <Link href="/dashboard/contract-analysis">Get Started</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-[#0c1b8a]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {activity.fileName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(activity.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-[#0c1b8a] hover:text-blue-700 hover:bg-blue-50 font-semibold rounded-xl"
                >
                  <Link href="/dashboard/history">View All →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="border border-gray-100 shadow-md rounded-3xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 mb-6">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.fullname || "User"}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#0c1b8a] to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {user?.fullname?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {user?.fullname || "aflah"}
                </p>
                <p className="text-gray-500 text-sm">{user?.email || "aflah@mail.com"}</p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="w-full rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-[#0c1b8a] hover:text-[#0c1b8a] hover:bg-blue-50 font-semibold transition-all shadow-sm"
            >
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
