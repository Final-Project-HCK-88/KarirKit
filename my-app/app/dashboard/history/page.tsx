"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Trash2, Eye, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

interface HistoryItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  textLength: number;
  uploadedAt: string;
  hasAnalysis?: boolean;
  analysisId?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/history");

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      const resumes = data.data.resumes || [];

      // Check analysis status for each resume
      const resumesWithAnalysis = await Promise.all(
        resumes.map(async (resume: HistoryItem) => {
          try {
            const analysisResponse = await fetch(
              `/api/analyze-cv?resumeId=${resume.id}`
            );
            const analysisData = await analysisResponse.json();
            return {
              ...resume,
              hasAnalysis: analysisData.hasAnalysis || false,
              analysisId: analysisData.data?.analysisId,
            };
          } catch {
            return { ...resume, hasAnalysis: false };
          }
        })
      );

      setHistory(resumesWithAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You want to delete <strong>"${fileName}"</strong>?<br><br>This will also delete any associated analysis results.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0c1b8a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/analyze-cv?resumeId=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete file");
      }

      // Refresh history after successful deletion
      await fetchHistory();

      Swal.fire({
        title: "Deleted!",
        text: "File and associated analysis deleted successfully!",
        icon: "success",
        confirmButtonColor: "#0c1b8a",
      });
    } catch (err) {
      console.error("Error deleting file:", err);

      Swal.fire({
        title: "Error!",
        text: err instanceof Error
          ? err.message
          : "Failed to delete file. Please try again.",
        icon: "error",
        confirmButtonColor: "#0c1b8a",
      });
    }
  };

  const handleAnalyze = (id: string) => {
    window.location.href = `/dashboard/contract-analysis?resumeId=${id}`;
  };

  const handleViewAnalysis = (resumeId: string) => {
    router.push(`/dashboard/analysis/${resumeId}`);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="gap-2 mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload History</h1>
        <p className="text-muted-foreground">
          View and manage your uploaded contracts and documents
        </p>
      </div>

      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <p className="text-muted-foreground">Loading history...</p>
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <p className="text-muted-foreground mb-4">
              No uploads yet. Start by uploading a contract!
            </p>
            <Button asChild>
              <Link href="/dashboard/contract-analysis">Upload Contract</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            return (
              <Card key={item.id} className="hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="p-3 bg-secondary rounded-lg h-fit">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.fileName}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          Size: {(item.fileSize / 1024).toFixed(2)} KB • Text:{" "}
                          {item.textLength} chars
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded:{" "}
                          {new Date(item.uploadedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        {item.hasAnalysis && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              Analyzed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View file"
                        onClick={() => window.open(item.fileUrl, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.hasAnalysis ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleViewAnalysis(item.id)}
                        >
                          View Analysis
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnalyze(item.id)}
                        >
                          Analyze
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => handleDelete(item.id, item.fileName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
