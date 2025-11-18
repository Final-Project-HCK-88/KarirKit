"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Loader,
  MapPin,
  Building2,
  DollarSign,
  ExternalLink,
} from "lucide-react";

interface JobListing {
  id?: string;
  position: string;
  company: string;
  companyLogo?: string;
  location: string;
  date?: string;
  salary?: string;
  jobUrl: string;
  matchScore?: number;
  matchReason?: string;
}

interface MatchResponse {
  preferences: {
    position: string;
    location: string;
    industry: string;
    expectedSalary: number;
    skill: string[];
  };
  jobListings: JobListing[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function JobMatchingResultPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);

  useEffect(() => {
    const fetchJobMatches = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/match-making/${params.id}?page=1&limit=5`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          // Retry on 500/503 errors (server overload) up to 2 times
          if (
            (response.status === 500 || response.status === 503) &&
            retryCount < 2
          ) {
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setError(`Server busy, retrying... (${retryCount + 1}/2)`);
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
            return fetchJobMatches(retryCount + 1);
          }

          throw new Error(
            errorData.message ||
              errorData.error ||
              "Failed to fetch job matches"
          );
        }

        const responseData = await response.json();
        console.log("Job matching response:", responseData);
        setResult(responseData);
        setAllJobs(responseData.jobListings);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching job matches:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load job matches"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJobMatches();
    }
  }, [params.id]);

  const handleReset = () => {
    router.push("/dashboard/job-matching");
  };

  const loadMoreJobs = async () => {
    if (!result?.hasNextPage || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await fetch(
        `/api/match-making/${params.id}?page=${nextPage}&limit=5`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load more jobs");
      }

      const data = await response.json();
      setAllJobs((prev) => [...prev, ...data.jobListings]);
      setResult((prev) => (prev ? { ...prev, ...data } : data));
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more jobs:", err);
      setError("Failed to load more jobs");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <Link href="/dashboard/job-matching">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">
            {error || "Finding matching jobs from LinkedIn..."}
          </p>
          <p className="text-xs text-muted-foreground">
            This may take 10-30 seconds
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <Link href="/dashboard/job-matching">
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

  if (!result || !result.jobListings || result.jobListings.length === 0) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <Link href="/dashboard/job-matching">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <p className="text-muted-foreground">No matching jobs found</p>
          <Button onClick={handleReset}>Search Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <Link href="/dashboard/job-matching">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Job Matching
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Matching Jobs</h1>
          <p className="text-muted-foreground">
            Found {result.totalJobs} jobs matching your preferences
          </p>
        </div>

        {/* Preferences Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Search Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{result.preferences.position}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{result.preferences.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{result.preferences.industry}</p>
              </div>
              {result.preferences.expectedSalary > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expected Salary
                  </p>
                  <p className="font-medium">
                    Rp{" "}
                    {result.preferences.expectedSalary.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
              {result.preferences.skill &&
                result.preferences.skill.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Skills</p>
                    <p className="font-medium">
                      {result.preferences.skill.join(", ")}
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Available Positions</h2>
            <p className="text-sm text-muted-foreground">
              Showing {allJobs.length} of {result.totalJobs} jobs
            </p>
          </div>
          {allJobs.map((job, index) => (
            <Card
              key={job.id || index}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 flex-1">
                    {job.companyLogo && (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-12 h-12 rounded object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {job.position}
                        {job.matchScore && (
                          <span className="ml-2 text-sm font-normal text-primary">
                            ({job.matchScore}% match)
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.date && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Posted: {job.date}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild size="sm" className="gap-2 shrink-0">
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Job <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              {job.matchReason && (
                <CardContent>
                  <div className="bg-accent/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">
                      Why this matches:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {job.matchReason}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {result.hasNextPage && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={loadMoreJobs}
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading more jobs...
                </>
              ) : (
                `Load More Jobs (${
                  result.totalJobs - allJobs.length
                } remaining)`
              )}
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center pt-8">
          <Button onClick={handleReset}>Search Again</Button>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
