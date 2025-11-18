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

export default function SalaryBenchmarkResultPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SalaryData | null>(null);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        setError("");

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

        // Extract job title from analysis or use generic
        setJobTitle("Your Position");
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
      <SalaryBenchmarkResult
        result={result}
        jobTitle={jobTitle}
        onReset={handleReset}
      />
    </div>
  );
}
