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
  Briefcase,
  MapPin,
  DollarSign,
  Code,
  Building2,
} from "lucide-react";
import { WizardNavigation } from "@/components/wizard-navigation";

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

const wizardSteps = [
  { id: 1, title: "Role & Location", description: "Job Details" },
  { id: 2, title: "Industry", description: "Your Field" },
  { id: 3, title: "Salary & Skills", description: "Expectations" },
  { id: 4, title: "Review", description: "Confirm Details" },
];

export default function JobMatchingPage() {
  const [mode, setMode] = useState<"select" | "ai" | "form" | null>("select");
  const [wizardStep, setWizardStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    industry: "",
    expectedSalary: "",
    skill: "",
    position: "",
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
    setFormData({ ...formData, expectedSalary: numbersOnly });
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
    const salaryValue = option.expectedSalary?.toString() || "";
    setFormData({
      position: option.position || "",
      location: option.location || "",
      industry: option.industry || "",
      expectedSalary: salaryValue,
      skill: option.skills || "",
    });
    setDisplaySalary(formatNumberWithDots(salaryValue));

    // Move to form mode and wizard step 1
    setMode("form");
    setWizardStep(1);

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("job-matching-wizard")
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

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!formData.position || !formData.location) {
        alert("Please fill in position and location");
        return;
      }
    } else if (wizardStep === 2) {
      if (!formData.industry) {
        alert("Please enter the industry");
        return;
      }
    }
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAnalyze = async () => {
    if (!formData.location || !formData.industry || !formData.position) {
      alert("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);

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
            <h1 className="text-3xl font-bold mb-2">Job Matching & Analysis</h1>
            <p className="text-muted-foreground">
              Find jobs that match your preferences and skills
            </p>
          </div>

          {/* Mode Selection */}
          {mode === "select" && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Method</CardTitle>
                <CardDescription>
                  Select how you want to find your perfect job match
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* AI Option */}
                  <button
                    onClick={() => {
                      if (!hasCV) {
                        setMode("form");
                        alert("Please upload your CV first or use manual form");
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
                          Let AI analyze your CV and provide personalized job
                          recommendations based on your skills and experience
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
                          Fill out the form manually with your job preferences
                          to get matching opportunities
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
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Career Paths Based on Your Profile
                </h2>
                <p className="text-lg text-muted-foreground">
                  Discover career opportunities perfectly matched to your skills
                  and experience.
                  <br />
                  <span className="text-sm font-medium text-primary">
                    Select one to start your personalized job search
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
                          <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Industry
                            </p>
                            <p className="font-semibold text-sm truncate">
                              {option.industry}
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
                              Rp {option.expectedSalary}jt
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skills Section */}
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-primary" />
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
            <Card id="job-matching-wizard">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle>Find Your Perfect Job Match</CardTitle>
                    <CardDescription>
                      Answer a few questions to get personalized job
                      recommendations
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
                {!hasCV && wizardStep === 1 && (
                  <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Upload className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          💡 Pro Tip: Upload Your CV
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Get AI-powered job recommendations and auto-fill this
                          form
                        </p>
                        <div className="flex gap-2">
                          <Input
                            id="cv-upload-job"
                            type="file"
                            accept="application/pdf"
                            onChange={handleCVFileChange}
                            className="flex-1 text-xs h-9"
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
                    </div>
                  </div>
                )}

                {/* Step 1: Role & Location */}
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Role & Location
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          What position and where are you looking?
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Position *
                        </label>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          value={formData.position}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                          className="h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          The job title you're interested in
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
                          City or region where you want to work
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Industry */}
                {wizardStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Industry Preference
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Which industry do you want to work in?
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          Industry *
                        </label>
                        <Input
                          placeholder="e.g., Technology, Finance, Healthcare"
                          value={formData.industry}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              industry: e.target.value,
                            })
                          }
                          className="h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          The sector or field you want to work in
                        </p>
                      </div>

                      {/* Industry Examples */}
                      <div className="p-4 bg-accent/50 rounded-lg">
                        <p className="text-xs font-medium mb-2">
                          Popular Industries:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Technology",
                            "Finance",
                            "Healthcare",
                            "E-commerce",
                            "Education",
                            "Manufacturing",
                          ].map((ind) => (
                            <button
                              key={ind}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, industry: ind })
                              }
                              className="text-xs px-3 py-1.5 bg-white border rounded-full hover:bg-primary hover:text-white transition-colors"
                            >
                              {ind}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Salary & Skills */}
                {wizardStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Salary & Skills
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tell us about your expectations and skills
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Expected Salary (per month)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            type="text"
                            placeholder="15.000.000"
                            value={displaySalary}
                            onChange={handleSalaryChange}
                            className="h-12 text-base pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Optional: Your expected monthly salary
                        </p>
                      </div>

                      {formData.expectedSalary && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-900">
                            💰 Formatted:{" "}
                            <span className="font-bold">
                              Rp{" "}
                              {Number(formData.expectedSalary).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Code className="h-4 w-4 text-primary" />
                          Skills (comma separated)
                        </label>
                        <Input
                          placeholder="e.g., React, TypeScript, Node.js"
                          value={formData.skill}
                          onChange={(e) =>
                            setFormData({ ...formData, skill: e.target.value })
                          }
                          className="h-12 text-base"
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate multiple skills with commas
                        </p>
                      </div>

                      {formData.skill && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium mb-2">
                            Your Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.skill.split(",").map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-900 rounded-full"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                          Review Your Preferences
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Make sure everything looks correct
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Position
                            </p>
                            <p className="font-semibold">{formData.position}</p>
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
                          <Building2 className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Industry
                            </p>
                            <p className="font-semibold">{formData.industry}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Expected Salary
                            </p>
                            <p className="font-semibold">
                              {formData.expectedSalary
                                ? `Rp ${Number(
                                    formData.expectedSalary
                                  ).toLocaleString("id-ID")}`
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/30 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <Code className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Skills
                            </p>
                            <p className="font-semibold">
                              {formData.skill || "Not specified"}
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
                      Find Matching Jobs
                      <Briefcase className="h-4 w-4 ml-2" />
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
                  Finding Your Perfect Job Matches
                </p>
                <p className="text-sm text-muted-foreground">
                  We're searching through thousands of opportunities...
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
