"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Briefcase,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { WizardNavigation } from "@/components/wizard-navigation";
import Swal from "sweetalert2";

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

const wizardSteps = [
  { id: 1, title: "Basic Info", description: "Job & Location" },
  { id: 2, title: "Experience", description: "Your Background" },
  { id: 3, title: "Salary", description: "Current/Expected" },
  { id: 4, title: "Review", description: "Confirm Details" },
];

export default function SalaryBenchmarkPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "ai" | "form" | null>("select");
  const [wizardStep, setWizardStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skipCVUpload, setSkipCVUpload] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    experience: "",
    currentSalary: "",
  });
  const [displaySalary, setDisplaySalary] = useState("");

  // Format number with dots (10000 -> 10.000)
  const formatNumberWithDots = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return numbers.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  // Handle salary input change
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbersOnly = inputValue.replace(/\D/g, "");
    setFormData({ ...formData, currentSalary: numbersOnly });
    setDisplaySalary(formatNumberWithDots(numbersOnly));
  };
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
    // Convert salary from millions to full number (15 -> 15000000)
    const salaryInFull = option.expectedSalary
      ? (option.expectedSalary * 1000000).toString()
      : "";
    setFormData({
      jobTitle: option.position || "",
      location: option.location || "",
      experience: option.yearsOfExperience?.toString() || "",
      currentSalary: salaryInFull,
    });
    setDisplaySalary(formatNumberWithDots(salaryInFull));

    // Move to form mode and wizard step 1
    setMode("form");
    setWizardStep(1);

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("salary-wizard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        Swal.fire({
          title: "Invalid File Type",
          text: "Please upload a PDF file",
          icon: "error",
          confirmButtonColor: "#0c1b8a",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "File size must be less than 10MB",
          icon: "error",
          confirmButtonColor: "#0c1b8a",
        });
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

      Swal.fire({
        title: "Success!",
        text: "CV uploaded successfully! Loading career insights...",
        icon: "success",
        confirmButtonColor: "#0c1b8a",
        timer: 2000,
        showConfirmButton: false,
      });

      // Load preference options after successful upload
      await loadPreferenceOptions();

      // Reset file input
      const fileInput = document.getElementById(
        "cv-upload-salary"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error uploading CV:", error);
      Swal.fire({
        title: "Upload Failed",
        text: error instanceof Error ? error.message : "Failed to upload CV",
        icon: "error",
        confirmButtonColor: "#0c1b8a",
      });
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!formData.jobTitle || !formData.location) {
        Swal.fire({
          title: "Incomplete Information",
          text: "Please fill in job title and location",
          icon: "warning",
          confirmButtonColor: "#0c1b8a",
        });
        return;
      }
    } else if (wizardStep === 2) {
      if (!formData.experience) {
        Swal.fire({
          title: "Incomplete Information",
          text: "Please enter your years of experience",
          icon: "warning",
          confirmButtonColor: "#0c1b8a",
        });
        return;
      }
    }
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAnalyze = async () => {
    if (!formData.jobTitle || !formData.location || !formData.experience) {
      Swal.fire({
        title: "Incomplete Information",
        text: "Please fill in all required fields",
        icon: "warning",
        confirmButtonColor: "#0c1b8a",
      });
      return;
    }

    setIsAnalyzing(true);

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
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Failed to create benchmark",
        icon: "error",
        confirmButtonColor: "#0c1b8a",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {!isAnalyzing && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Salary Benchmark</h1>
            <p className="text-muted-foreground">
              Get market insights and negotiation recommendations
            </p>
          </div>

          {/* Mode Selection */}
          {mode === "select" && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Method</CardTitle>
                <CardDescription>
                  Select how you want to get your salary benchmark
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* AI Option */}
                  <button
                    onClick={async () => {
                      if (!hasCV) {
                        const result = await Swal.fire({
                          title: "CV Required",
                          text: "Please upload your CV first or use manual form",
                          icon: "info",
                          confirmButtonColor: "#0c1b8a",
                          showCancelButton: true,
                          confirmButtonText: "Go to Profile",
                          cancelButtonText: "Use Manual Form",
                        });

                        if (result.isConfirmed) {
                          router.push("/dashboard/profile");
                        } else if (result.isDismissed) {
                          // User chose "Use Manual Form"
                          setSkipCVUpload(true);
                          setMode("form");
                        }
                        return;
                      }
                      setMode("ai");
                      loadPreferenceOptions();
                    }}
                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Use AI from CV
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Let AI analyze your CV and provide personalized career
                          insights and salary recommendations
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          {hasCV ? (
                            <span className="text-green-600 font-medium">
                              ✓ CV Uploaded
                            </span>
                          ) : (
                            <span className="text-orange-600 font-medium">
                              ⚠ CV Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Manual Form Option */}
                  <button
                    onClick={() => setMode("form")}
                    className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Manual Form
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Fill out the form manually with your job details to
                          get salary benchmarks
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-blue-600 font-medium">
                            → Quick & Simple
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Section - Only show in select mode */}
          {mode === "select" &&
            (loadingHistory ? (
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
            ) : null)}

          {/* Career Preference Options - Only show in AI mode */}
          {mode === "ai" && loadingOptions && (
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

          {mode === "ai" && !loadingOptions && preferenceOptions.length > 0 && (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("select")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Method Selection
                </Button>
              </div>

              {/* Header Section with Icon */}
              <div className="text-center max-w-3xl mx-auto space-y-3 py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Career Insights from Your CV
                </h2>
                <p className="text-lg text-muted-foreground">
                  Based on your experience and skills, here are personalized
                  career paths.
                  <br />
                  <span className="text-sm font-medium text-primary">
                    Select one to auto-fill the form and get started
                  </span>
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-5">
                {preferenceOptions.map((option, index) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${
                      selectedOption === option.id
                        ? "ring-2 ring-primary shadow-xl bg-linear-to-br from-primary/5 to-primary/10 scale-[1.02]"
                        : "hover:border-primary hover:scale-[1.01]"
                    }`}
                    onClick={() => handleSelectOption(option)}
                  >
                    {/* Option Number Badge */}
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </div>

                    <CardHeader className="pb-3 pt-6 pl-16">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl font-bold">
                              {option.title}
                            </CardTitle>
                            {selectedOption === option.id && (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-3 py-1 rounded-full font-medium">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Selected
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-base leading-relaxed">
                            {option.description}
                          </CardDescription>
                        </div>
                        <div
                          className={`shrink-0 transition-all duration-300 ${
                            selectedOption === option.id
                              ? "rotate-90 text-primary"
                              : "text-muted-foreground group-hover:translate-x-1 group-hover:text-primary"
                          }`}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Position
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {option.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Experience
                            </p>
                            <p className="font-semibold text-sm">
                              {option.yearsOfExperience} years (
                              {option.experienceLevel})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Location
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {option.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Expected Salary
                            </p>
                            <p className="font-semibold text-sm text-green-600">
                              Rp {(option.expectedSalary * 1000000).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skills Section */}
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="h-4 w-4 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-xs font-medium text-muted-foreground">
                            Key Skills
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {option.skills}
                        </p>
                      </div>

                      {/* CTA Hint */}
                      {selectedOption !== option.id && (
                        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-xs text-primary font-medium flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Click to select and continue
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Wizard Form - Only show in form mode */}
          {mode === "form" && (
            <Card id="salary-wizard">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle>Let's Get Your Salary Benchmark</CardTitle>
                    <CardDescription>
                      Follow these simple steps to get personalized salary
                      insights
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode("select")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change Method
                  </Button>
                </div>
                <WizardNavigation
                  steps={wizardSteps}
                  currentStep={wizardStep}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Upload Section */}
                {!hasCV && !skipCVUpload && wizardStep === 1 && (
                  <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Upload className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          💡 Pro Tip: Upload Your CV
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Get AI-powered career insights and auto-fill this form
                        </p>
                        <div className="flex gap-2">
                          <Input
                            id="cv-upload-salary"
                            type="file"
                            accept="application/pdf"
                            onChange={handleCVFileChange}
                            className="flex-1 text-xs h-9"
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
                    </div>
                  </div>
                )}

                {/* Step 1: Basic Info */}
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Job Title & Location
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tell us about the position you're interested in
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Job Title *
                        </label>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          value={formData.jobTitle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jobTitle: e.target.value,
                            })
                          }
                          className="h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          Be specific for better results
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Location *
                        </label>
                        <Input
                          placeholder="e.g., Jakarta, Indonesia"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          className="h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          City and country for accurate market data
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Your Experience Level
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Help us understand your career stage
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Years of Experience *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience: e.target.value,
                            })
                          }
                          className="h-12 text-base"
                          min="0"
                          max="50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Include all relevant work experience
                        </p>
                      </div>

                      {/* Experience Level Guide */}
                      <div className="p-4 bg-accent/50 rounded-lg">
                        <p className="text-xs font-medium mb-2">
                          Experience Level Guide:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• 0-2 years: Junior/Entry Level</li>
                          <li>• 3-5 years: Mid-Level</li>
                          <li>• 6-10 years: Senior Level</li>
                          <li>• 10+ years: Lead/Principal/Staff</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Salary */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Salary Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This helps us provide better benchmarking (optional)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Current or Expected Salary (per month)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            Rp
                          </span>
                          <Input
                            type="text"
                            placeholder="15.000.000"
                            value={displaySalary}
                            onChange={handleSalaryChange}
                            className="h-12 text-base pl-10 font-medium"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Optional: Enter your current or expected monthly salary (e.g., 15.000.000)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {wizardStep === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Review Your Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Make sure everything looks correct before submitting
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Job Title
                            </p>
                            <p className="font-semibold">{formData.jobTitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Location
                            </p>
                            <p className="font-semibold">{formData.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Years of Experience
                            </p>
                            <p className="font-semibold">
                              {formData.experience} years
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Current/Expected Salary
                            </p>
                            <p className="font-semibold">
                              {formData.currentSalary
                                ? `Rp ${Number(
                                    formData.currentSalary
                                  ).toLocaleString("id-ID")}`
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {wizardStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  {wizardStep < wizardSteps.length ? (
                    <Button
                      onClick={handleNextStep}
                      className={wizardStep === 1 ? "w-full" : "flex-1"}
                    >
                      Next Step
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleAnalyze} className="flex-1">
                      Get Benchmark
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isAnalyzing && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">
                  Analyzing Salary Market Data
                </p>
                <p className="text-sm text-muted-foreground">
                  We're gathering insights from thousands of data points...
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
