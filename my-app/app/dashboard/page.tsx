"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
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
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-medium text-[#0c1b8a]">
            ✨ Welcome back!
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
          Hello, {user?.fullname || "User"}!
        </h1>
        <p className="text-xl text-gray-600">
          Ready to take your career to the next level?
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="group h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white rounded-2xl hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
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

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <History className="h-5 w-5 text-[#0c1b8a]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div>
                <p className="text-gray-600 text-sm mb-3">
                  No recent activity yet. Start by uploading a contract or job
                  description.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:border-[#0c1b8a] hover:text-[#0c1b8a] font-medium transition-all"
                >
                  <Link href="/dashboard/contract-analysis">Get Started</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-[#0c1b8a]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.fileName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
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
                  className="w-full mt-2 text-[#0c1b8a] hover:text-blue-700 hover:bg-blue-50 font-medium"
                >
                  <Link href="/dashboard/history">View All →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.fullname || "User"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0c1b8a] to-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.fullname?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {user?.fullname || "Not set"}
                  </p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl border-gray-200 hover:border-[#0c1b8a] hover:text-[#0c1b8a] font-medium transition-all"
            >
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
