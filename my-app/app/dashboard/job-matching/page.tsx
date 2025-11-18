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
      position: option.position || "",
      location: option.location || "",
      industry: option.industry || "",
      expectedSalary: option.expectedSalary?.toString() || "",
      skill: option.skills || "",
    });

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("job-matching-form")
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
                  Career Paths Based on Your Profile
                </h2>
                <p className="text-muted-foreground">
                  Here are career opportunities that match your skills and
                  experience. Select one to start your job search.
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
                            Industry:
                          </span>
                          <p className="font-medium">{option.industry}</p>
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

          <Card id="job-matching-form">
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
              <CardDescription>
                {preferenceOptions.length > 0
                  ? "Review and adjust your job preferences below"
                  : "Tell us what you're looking for and we'll find matching jobs"}
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
                        Get personalized job recommendations and auto-fill forms
                      </p>
                    </div>
                  </div>
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
                      disabled={isUploadingCV || !cvFile}
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
