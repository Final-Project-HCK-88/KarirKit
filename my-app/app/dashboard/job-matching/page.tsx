"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader,
  Clock,
  ChevronRight,
  FileText,
  Upload,
} from "lucide-react";

interface HistoryItem {
  _id: string;
  location: string;
  industry: string;
  expectedSalary: number;
  skill: string[];
  position: string;
}

export default function JobMatchingPage() {
  const [step, setStep] = useState<"input" | "analyzing">("input");
  const [formData, setFormData] = useState({
    location: "",
    industry: "",
    expectedSalary: "",
    skill: "",
    position: "",
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [useCV, setUseCV] = useState(false);
  const [hasCV, setHasCV] = useState(false);
  const [loadingCV, setLoadingCV] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/match-making", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  // Check if user has CV
  useEffect(() => {
    const checkCV = async () => {
      try {
        const response = await fetch("/api/cv");
        const data = await response.json();
        setHasCV(data.hasCV || false);
      } catch (error) {
        console.error("Error checking CV:", error);
      }
    };
    checkCV();
  }, []);

  const handleToggleCV = async () => {
    if (!hasCV) return;

    const newUseCV = !useCV;
    setUseCV(newUseCV);

    if (newUseCV) {
      setLoadingCV(true);
      try {
        const response = await fetch("/api/generate-preferences", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to generate preferences");
        }

        const data = await response.json();
        console.log("Generated preferences:", data.preferences);

        // Auto-fill form
        setFormData({
          position: data.preferences.position || "",
          location: data.preferences.location || "",
          industry: data.preferences.industry || "",
          expectedSalary: data.preferences.expectedSalary?.toString() || "",
          skill: data.preferences.skills || "",
        });
      } catch (error) {
        console.error("Error generating preferences:", error);
        alert("Failed to load CV data");
        setUseCV(false);
      } finally {
        setLoadingCV(false);
      }
    } else {
      // Clear form when toggling off
      setFormData({
        location: "",
        industry: "",
        expectedSalary: "",
        skill: "",
        position: "",
      });
    }
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setCvFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;

    setIsUploadingCV(true);

    try {
      // Upload PDF
      const formDataUpload = new FormData();
      formDataUpload.append("file", cvFile);

      const uploadResponse = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formDataUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF");
      }

      const uploadData = await uploadResponse.json();

      // Save CV to database
      const saveResponse = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: uploadData.url,
          text: uploadData.extractedText,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save CV");
      }

      // Update state
      setHasCV(true);
      setCvFile(null);
      alert("CV uploaded successfully! You can now use CV data.");

      // Reset file input
      const fileInput = document.getElementById(
        "cv-upload-job"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert(error instanceof Error ? error.message : "Failed to upload CV");
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.location || !formData.industry || !formData.position) {
      alert("Please fill in all required fields");
      return;
    }

    setStep("analyzing");

    try {
      const skillArray = formData.skill
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch("/api/match-making", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: formData.location,
          industry: formData.industry,
          expectedSalary: Number.parseFloat(formData.expectedSalary || "0"),
          skill: skillArray,
          position: formData.position,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create job matching request"
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      const preferencesId = data.createdPreferences?.id;

      if (!preferencesId) {
        throw new Error("No preferences ID returned from API");
      }

      console.log(
        "Redirecting to:",
        `/dashboard/job-matching/${preferencesId}`
      );

      // Redirect to result page
      window.location.href = `/dashboard/job-matching/${preferencesId}`;
    } catch (error) {
      console.error("Error creating job matching:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create job matching"
      );
      setStep("input");
    }
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {step === "input" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Matching & Analysis</h1>
            <p className="text-muted-foreground">
              Find jobs that match your preferences and skills
            </p>
          </div>

          {/* History Section */}
          {loadingHistory ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Loading history...</span>
                </div>
              </CardContent>
            </Card>
          ) : history.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Searches
                </CardTitle>
                <CardDescription>
                  Click on a previous search to view its results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((item) => (
                    <Link
                      key={item._id}
                      href={`/dashboard/job-matching/${item._id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:border-primary transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="font-medium">{item.position}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.location} • {item.industry} • Rp{" "}
                            {item.expectedSalary.toLocaleString("id-ID")}
                          </div>
                          {item.skill && item.skill.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Skills: {item.skill.join(", ")}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                Tell us what you're looking for and we'll find matching jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CV Toggle */}
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">
                      {hasCV ? "Use CV Data" : "No CV Uploaded"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hasCV
                        ? "Auto-fill form with your CV information"
                        : "Upload your CV to auto-fill this form"}
                    </p>
                  </div>
                </div>
                {hasCV ? (
                  <Button
                    variant={useCV ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleCV}
                    disabled={loadingCV}
                  >
                    {loadingCV ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : useCV ? (
                      "Enabled"
                    ) : (
                      "Enable"
                    )}
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input
                      id="cv-upload-job"
                      type="file"
                      accept="application/pdf"
                      onChange={handleCVFileChange}
                      className="max-w-[200px] text-xs h-8"
                    />
                    <Button
                      size="sm"
                      onClick={handleUploadCV}
                      disabled={!cvFile || isUploadingCV}
                    >
                      {isUploadingCV ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position *</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    placeholder="e.g., Jakarta, Indonesia"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry *</label>
                  <Input
                    placeholder="e.g., Technology, Finance"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Salary</label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000000"
                    value={formData.expectedSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedSalary: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Skills (comma separated)
                </label>
                <Input
                  placeholder="e.g., React, TypeScript, Node.js"
                  value={formData.skill}
                  onChange={(e) =>
                    setFormData({ ...formData, skill: e.target.value })
                  }
                />
              </div>

              <Button className="w-full" onClick={handleAnalyze}>
                Find Matching Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">
            Finding matching jobs for you...
          </p>
        </div>
      )}
    </div>
  );
}
