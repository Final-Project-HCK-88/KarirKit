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
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
  createdAt: string;
}

export default function SalaryBenchmarkPage() {
  const [step, setStep] = useState<"form" | "analyzing">("form");
  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    experience: "",
    currentSalary: "",
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
        const response = await fetch("/api/sallary-benchmark", {
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
          jobTitle: data.preferences.position || "",
          location: data.preferences.location || "",
          experience: data.preferences.yearsOfExperience?.toString() || "",
          currentSalary: data.preferences.expectedSalary?.toString() || "",
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
        jobTitle: "",
        location: "",
        experience: "",
        currentSalary: "",
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
        "cv-upload-salary"
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
    if (!formData.jobTitle || !formData.location || !formData.experience) {
      alert("Please fill in all required fields");
      return;
    }

    setStep("analyzing");

    try {
      // Call API to create salary benchmark request
      const response = await fetch("/api/sallary-benchmark", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          location: formData.location,
          experienceYear: Number.parseInt(formData.experience),
          currentOrOfferedSallary: Number.parseFloat(
            formData.currentSalary || "0"
          ),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create benchmark request"
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      const requestId = data.request?._id || data.request?.id;

      if (!requestId) {
        throw new Error("No request ID returned from API");
      }

      console.log(
        "Redirecting to:",
        `/dashboard/salary-benchmark/${requestId}`
      );

      // Redirect to result page
      window.location.href = `/dashboard/salary-benchmark/${requestId}`;
    } catch (error) {
      console.error("Error creating benchmark:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create benchmark"
      );
      setStep("form");
    }
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {step === "form" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Salary Benchmark</h1>
            <p className="text-muted-foreground">
              Get market insights and negotiation recommendations
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
                      href={`/dashboard/salary-benchmark/${item._id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent hover:border-primary transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="font-medium">{item.jobTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.location} • {item.experienceYear} years
                            experience • Rp{" "}
                            {item.currentOrOfferedSallary.toLocaleString(
                              "id-ID"
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
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
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>
                Help us calculate the right market range for you
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
                      id="cv-upload-salary"
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
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Years of Experience *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current/Offered Salary (Optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 150000"
                    value={formData.currentSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentSalary: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleAnalyze}>
                Get Benchmark
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">
            Analyzing salary market data...
          </p>
        </div>
      )}
    </div>
  );
}
