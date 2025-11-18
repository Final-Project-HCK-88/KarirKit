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

interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  position: string;
  skills: string;
  experienceLevel: string;
  yearsOfExperience: number;
  location: string;
  industry: string;
  expectedSalary: number;
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
  const [hasCV, setHasCV] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [preferenceOptions, setPreferenceOptions] = useState<
    PreferenceOption[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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

  // Check if user has CV and load preferences
  useEffect(() => {
    const checkCVAndLoadOptions = async () => {
      try {
        const response = await fetch("/api/cv");
        const data = await response.json();
        setHasCV(data.hasCV || false);

        // If user has CV, automatically load preference options
        if (data.hasCV) {
          await loadPreferenceOptions();
        }
      } catch (error) {
        console.error("Error checking CV:", error);
      }
    };
    checkCVAndLoadOptions();
  }, []);

  const loadPreferenceOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await fetch("/api/generate-preferences", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate preferences");
      }

      const data = await response.json();
      console.log("Generated preferences:", data.preferences);

      // Set the options from API response
      if (data.preferences?.options) {
        setPreferenceOptions(data.preferences.options);
      }
    } catch (error) {
      console.error("Error generating preferences:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSelectOption = (option: PreferenceOption) => {
    setSelectedOption(option.id);
    // Auto-fill form with selected option
    setFormData({
      jobTitle: option.position || "",
      location: option.location || "",
      experience: option.yearsOfExperience?.toString() || "",
      currentSalary: option.expectedSalary?.toString() || "",
    });

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("salary-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
      // Upload CV using dedicated CV upload endpoint
      const formDataUpload = new FormData();
      formDataUpload.append("file", cvFile);

      const uploadResponse = await fetch("/api/cv/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload CV");
      }

      const uploadData = await uploadResponse.json();
      console.log("✅ CV uploaded:", uploadData);

      // Update state
      setHasCV(true);
      setCvFile(null);
      alert("CV uploaded successfully! Loading career insights...");

      // Load preference options after successful upload
      await loadPreferenceOptions();

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

          {/* Career Preference Options */}
          {loadingOptions && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-lg font-medium">Analyzing your CV...</p>
                  <p className="text-sm">Generating career insights for you</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loadingOptions && preferenceOptions.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Career Insights from Your CV
                </h2>
                <p className="text-muted-foreground">
                  Based on your experience and skills, here are some career
                  paths you might explore. Click on one to auto-fill the form
                  below.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {preferenceOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                      selectedOption === option.id
                        ? "ring-2 ring-primary shadow-lg bg-primary/5"
                        : "hover:border-primary"
                    }`}
                    onClick={() => handleSelectOption(option)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            {option.title}
                            {selectedOption === option.id && (
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                                Selected
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {option.description}
                          </CardDescription>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${
                            selectedOption === option.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Position:
                          </span>
                          <p className="font-medium">{option.position}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Experience:
                          </span>
                          <p className="font-medium">
                            {option.yearsOfExperience} years (
                            {option.experienceLevel})
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <p className="font-medium">{option.location}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Expected Salary:
                          </span>
                          <p className="font-medium">
                            Rp {option.expectedSalary}jt
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-muted-foreground text-sm">
                          Key Skills:
                        </span>
                        <p className="text-sm mt-1">{option.skills}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card id="salary-form">
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>
                {preferenceOptions.length > 0
                  ? "Review and adjust the information below, or enter your own details"
                  : "Help us calculate the right market range for you"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CV Upload Section */}
              {!hasCV && (
                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border-2 border-dashed">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Upload Your CV</p>
                      <p className="text-xs text-muted-foreground">
                        Get personalized career insights and auto-fill forms
                      </p>
                    </div>
                  </div>
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
                </div>
              )}

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
