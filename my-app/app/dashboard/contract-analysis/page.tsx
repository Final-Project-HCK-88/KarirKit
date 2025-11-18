"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  Loader,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UploadResult {
  url: string;
  resumeId: string;
  textLength: number;
  fileName: string;
}

interface CVAnalysis {
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

export default function ContractAnalysisPage() {
  const [step, setStep] = useState<
    "upload" | "uploading" | "uploaded" | "analyzing" | "result"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showFullSummary, setShowFullSummary] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setStep("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      console.log("✅ Upload response:", data);
      console.log("📋 resumeId from response:", data.resumeId);
      console.log("📋 Full data keys:", Object.keys(data));

      // Response structure is flat, not nested in data.data
      setUploadResult(data);
      setStep("uploaded");

      // Auto analyze after upload
      if (data.resumeId) {
        console.log("🚀 Starting auto-analyze with resumeId:", data.resumeId);
        setTimeout(() => handleAnalyze(data.resumeId), 500);
      } else {
        console.error("❌ No resumeId in upload response!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("upload");
    }
  };

  const handleAnalyze = async (resumeId?: string) => {
    const targetId = resumeId || uploadResult?.resumeId;

    console.log("🔍 handleAnalyze called with:", {
      passedResumeId: resumeId,
      uploadResultResumeId: uploadResult?.resumeId,
      targetId,
    });

    if (!targetId) {
      console.error("❌ No targetId available!");
      return;
    }

    setStep("analyzing");
    setError("");

    try {
      console.log("📤 Sending analyze requests with resumeId:", targetId);

      // Call both analyze and summarize in parallel
      const [analyzeRes, summarizeRes] = await Promise.all([
        fetch("/api/analyze-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: targetId }),
        }),
        fetch("/api/summarize-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: targetId }),
        }),
      ]);

      const analyzeData = await analyzeRes.json();
      const summarizeData = await summarizeRes.json();

      console.log("📊 Analyze response:", analyzeData);
      console.log("📊 Summarize response:", summarizeData);

      if (!analyzeRes.ok) {
        console.error("❌ Analyze failed:", analyzeData);
        throw new Error(analyzeData.message || "Analysis failed");
      }

      setAnalysis(analyzeData.data.analysis);
      setSummary(summarizeData.data?.summary || "");
      setStep("result");
    } catch (err) {
      console.error("❌ Analysis error:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("uploaded");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setUploadResult(null);
    setAnalysis(null);
    setSummary("");
    setError("");
    setShowFullSummary(false);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {step === "upload" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analyze Contract/Resume</h1>
            <p className="text-muted-foreground">
              Upload your contract, job offer, or resume PDF to get AI-powered
              analysis
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Document</CardTitle>
              <CardDescription>Maximum file size: 10MB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium mb-1">
                    Choose a PDF file to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contract, offer letter, or resume
                  </p>
                </div>
                <div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="pdf-upload">
                    <Button variant="outline" type="button" asChild>
                      <span className="cursor-pointer">Choose File</span>
                    </Button>
                  </label>
                </div>
                {file && (
                  <div className="bg-accent px-4 py-2 rounded-lg inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!file}
              >
                Upload & Analyze
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {(step === "uploading" || step === "analyzing") && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-12 w-12 text-primary animate-spin" />
          <div className="text-center">
            <p className="font-medium mb-1">
              {step === "uploading"
                ? "Uploading PDF..."
                : "Analyzing with AI..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {step === "uploading"
                ? "Extracting text from your document"
                : "This may take 10-30 seconds"}
            </p>
          </div>
        </div>
      )}

      {step === "uploaded" && uploadResult && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <div className="text-center">
            <p className="font-medium mb-1">Upload Successful!</p>
            <p className="text-sm text-muted-foreground">
              Extracted {uploadResult.textLength} characters
            </p>
          </div>
        </div>
      )}

      {step === "result" && analysis && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
              <p className="text-muted-foreground">
                AI-powered contract/resume analysis
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">
              Analyze Another
            </Button>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Contract Info */}
          {analysis.contractInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Position
                    </dt>
                    <dd className="mt-1 font-medium">
                      {analysis.contractInfo.position}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Company
                    </dt>
                    <dd className="mt-1 font-medium">
                      {analysis.contractInfo.company}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Contract Type
                    </dt>
                    <dd className="mt-1 font-medium">
                      {analysis.contractInfo.contractType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Duration
                    </dt>
                    <dd className="mt-1 font-medium">
                      {analysis.contractInfo.duration}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Salary */}
          {analysis.salary && (
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">
                    {analysis.salary.currency} {analysis.salary.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analysis.salary.frequency}
                  </p>
                </div>
                {analysis.salary.additionalBenefits &&
                  analysis.salary.additionalBenefits.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Additional Benefits:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.salary.additionalBenefits.map(
                          (benefit, i) => (
                            <li key={i}>{benefit}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Warnings/Red Flags */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Warnings & Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.warnings.map((warning, i) => (
                    <div key={i} className="border-l-2 border-destructive pl-4">
                      <p className="font-medium text-destructive">
                        {warning.clause}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {warning.issue}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Recommendation:</span>{" "}
                        {warning.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Terms */}
          {analysis.keyTerms && analysis.keyTerms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyTerms.map((term, i) => (
                    <div key={i}>
                      <p className="font-medium">{term.term}</p>
                      <p className="text-sm text-muted-foreground">
                        {term.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {analysis.recommendations}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Summary from summarize-pdf */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>Document Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-muted-foreground whitespace-pre-line">
                  {showFullSummary ? (
                    summary
                  ) : summary.length > 800 ? (
                    <>{summary.substring(0, 800)}...</>
                  ) : (
                    summary
                  )}
                </div>

                {summary.length > 800 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullSummary(!showFullSummary)}
                    className="w-full"
                  >
                    {showFullSummary ? (
                      <>Show Less</>
                    ) : (
                      <>
                        Show Full Document ({Math.round(summary.length / 1000)}k
                        characters)
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleReset}>Analyze Another Document</Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
