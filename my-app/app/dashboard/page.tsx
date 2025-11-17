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
} from "lucide-react";

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

  return (
    <div className="px-4 py-12 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.fullname || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Explore AI-powered career analysis tools
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                <CardHeader>
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white w-fit mb-4`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No recent analyses yet. Start by uploading a contract or job
              description.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4 bg-transparent"
            >
              <Link href="/dashboard/history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {user?.fullname || "Not set"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user?.email}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4 bg-transparent"
            >
              <Link href="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
