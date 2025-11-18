"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { SalaryBenchmarkResult } from "@/components/salary-benchmark-result";

interface SalaryData {
  min: number;
  median: number;
  max: number;
  yourSalary: number;
  status: "below" | "fair" | "above";
  recommendations: string[];
  salaryTrend: number;
}

interface BenchmarkResponse {
  marketMinimum: number;
  marketMedian: number;
  marketMaximum: number;
  userSalary: number;
  negotiationTips: string[];
  analysis: string;
  sources?: string[];
}

interface UserPreferences {
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
}

export default function SalaryBenchmarkResultPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SalaryData | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch benchmark result
        const response = await fetch(`/api/sallary-benchmark/${params.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch benchmark");
        }

        const responseData = await response.json();
        const data: BenchmarkResponse = responseData.data;

        // Fetch user preferences from salary_requests collection
        const prefsResponse = await fetch(
          `/api/sallary-benchmark?id=${params.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        let preferences: UserPreferences | null = null;
        if (prefsResponse.ok) {
          const prefsData = await prefsResponse.json();
          if (prefsData.data) {
            preferences = {
              jobTitle: prefsData.data.jobTitle || "",
              location: prefsData.data.location || "",
              experienceYear: prefsData.data.experienceYear || 0,
              currentOrOfferedSallary:
                prefsData.data.currentOrOfferedSallary || 0,
            };
            setUserPreferences(preferences);
            setJobTitle(preferences.jobTitle);
          }
        }

        // Determine status
        const userSalary = data.userSalary;
        const median = data.marketMedian;
        const threshold = median * 0.1; // 10% threshold

        let status: "below" | "fair" | "above" = "fair";
        if (userSalary < median - threshold) {
          status = "below";
        } else if (userSalary > median + threshold) {
          status = "above";
        }

        setResult({
          min: data.marketMinimum,
          median: data.marketMedian,
          max: data.marketMaximum,
          yourSalary: data.userSalary,
          status,
          recommendations: data.negotiationTips || [],
          salaryTrend: 0, // Not provided by API
        });

        // If preferences not fetched, fallback to generic
        if (!preferences) {
          setJobTitle("Your Position");
        }
      } catch (err) {
        console.error("Error fetching benchmark:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load benchmark"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBenchmark();
    }
  }, [params.id]);

  const handleReset = () => {
    router.push("/dashboard/salary-benchmark");
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Link href="/dashboard/salary-benchmark">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading benchmark results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Link href="/dashboard/salary-benchmark">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-destructive text-center">
            <p className="font-semibold mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Link href="/dashboard/salary-benchmark">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <p className="text-muted-foreground">No benchmark data available</p>
          <Button onClick={handleReset}>Create New Benchmark</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* User Preferences Card */}
      {userPreferences && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📊 Your Preferences
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Position:</span>
              <p className="text-gray-900 font-semibold">
                {userPreferences.jobTitle}
              </p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Location:</span>
              <p className="text-gray-900 font-semibold">
                {userPreferences.location}
              </p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Experience:</span>
              <p className="text-gray-900 font-semibold">
                {userPreferences.experienceYear} years
              </p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">
                Current/Offered Salary:
              </span>
              <p className="text-gray-900 font-semibold">
                Rp{" "}
                {userPreferences.currentOrOfferedSallary.toLocaleString(
                  "id-ID"
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <SalaryBenchmarkResult
        result={result}
        jobTitle={jobTitle}
        onReset={handleReset}
      />
    </div>
  );
}
