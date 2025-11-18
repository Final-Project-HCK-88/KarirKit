"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

interface AnalysisData {
  summary: string;
  contractInfo?: {
    position: string;
    company: string;
    contractType: string;
    startDate: string;
    duration: string;
  };
  salary?: {
    amount: string;
    currency: string;
    frequency: string;
    additionalBenefits: string[];
  };
  workingConditions?: {
    workingHours: string;
    location: string;
    remotePolicy: string;
  };
  keyTerms?: Array<{
    term: string;
    description: string;
  }>;
  warnings?: Array<{
    severity: string;
    clause: string;
    issue: string;
    recommendation: string;
  }>;
  redFlags?: string[];
  recommendations: string;
}

export default function ViewAnalysisPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzedAt, setAnalyzedAt] = useState("");

  useEffect(() => {
    if (!resumeId) {
      setError("No resume ID provided");
      setIsLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analyze-cv?resumeId=${resumeId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();

        if (!data.hasAnalysis) {
          setError("No analysis found for this document");
          return;
        }

        setAnalysis(data.data.analysis);
        setAnalyzedAt(data.data.analyzedAt);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analysis"
        );
        console.error("Error fetching analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [resumeId]);

  if (isLoading) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="gap-2 mb-8">
          <Link href="/dashboard/history">
            <ArrowLeft className="h-4 w-4" /> Back to History
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-12 text-center pb-12">
            <p className="text-destructive mb-4">
              {error || "Analysis not found"}
            </p>
            <Button asChild>
              <Link href="/dashboard/history">Go to History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="gap-2 mb-8">
        <Link href="/dashboard/history">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contract Analysis Result</h1>
        <p className="text-muted-foreground">
          Analyzed on{" "}
          {new Date(analyzedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-3">Summary</h2>
            <p className="text-sm text-gray-700">{analysis.summary}</p>
          </CardContent>
        </Card>

        {/* Contract Info */}
        {analysis.contractInfo && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">📋 Contract Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Position:</strong> {analysis.contractInfo.position}
                </div>
                <div>
                  <strong>Company:</strong> {analysis.contractInfo.company}
                </div>
                <div>
                  <strong>Type:</strong> {analysis.contractInfo.contractType}
                </div>
                <div>
                  <strong>Start Date:</strong> {analysis.contractInfo.startDate}
                </div>
                <div className="col-span-2">
                  <strong>Duration:</strong> {analysis.contractInfo.duration}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Salary */}
        {analysis.salary && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">💰 Salary & Benefits</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Amount:</strong> {analysis.salary.amount}{" "}
                  {analysis.salary.currency}
                </p>
                <p>
                  <strong>Frequency:</strong> {analysis.salary.frequency}
                </p>
                {analysis.salary.additionalBenefits &&
                  analysis.salary.additionalBenefits.length > 0 && (
                    <div>
                      <strong>Benefits:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {analysis.salary.additionalBenefits.map(
                          (benefit, index) => (
                            <li key={index}>{benefit}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Working Conditions */}
        {analysis.workingConditions && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">🏢 Working Conditions</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Hours:</strong>{" "}
                  {analysis.workingConditions.workingHours}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {analysis.workingConditions.location}
                </p>
                <p>
                  <strong>Policy:</strong>{" "}
                  {analysis.workingConditions.remotePolicy}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <Card className="bg-yellow-50 border-2 border-yellow-400">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3 text-red-800">
                ⚠️ Warnings & Risk Highlights
              </h2>
              <div className="space-y-3">
                {analysis.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 ${
                      warning.severity === "high"
                        ? "bg-red-100 border-red-600"
                        : warning.severity === "medium"
                        ? "bg-orange-100 border-orange-600"
                        : "bg-yellow-100 border-yellow-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          warning.severity === "high"
                            ? "bg-red-600 text-white"
                            : warning.severity === "medium"
                            ? "bg-orange-600 text-white"
                            : "bg-yellow-600 text-white"
                        }`}
                      >
                        {warning.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      <strong>Clause:</strong> &ldquo;{warning.clause}&rdquo;
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Issue:</strong> {warning.issue}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>💡 Recommendation:</strong>{" "}
                      {warning.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Red Flags */}
        {analysis.redFlags && analysis.redFlags.length > 0 && (
          <Card className="bg-red-50 border-2 border-red-600">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3 text-red-800">
                🚩 Red Flags
              </h2>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {analysis.redFlags.map((flag, index) => (
                  <li key={index} className="font-medium">
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key Terms */}
        {analysis.keyTerms && analysis.keyTerms.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">📝 Key Terms</h2>
              <div className="space-y-2">
                {analysis.keyTerms.map((term, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-purple-300 pl-3"
                  >
                    <p className="font-medium text-sm">{term.term}</p>
                    <p className="text-xs text-gray-600">{term.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysis.recommendations && (
          <Card className="bg-blue-50 border-blue-300">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-3">
                💡 Overall Recommendations
              </h2>
              <p className="text-sm text-gray-700">
                {analysis.recommendations}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
